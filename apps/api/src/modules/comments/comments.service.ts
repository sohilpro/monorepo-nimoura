import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Products } from '../products/entities/products.entity';
import { Users } from '../users/entities/users.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  buildPagination,
  buildSearchWhereClause,
  ListQuery,
  toSortDirection,
} from 'src/common/utils/pagination.helper';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactions } from './entities/comment-reactions.entity';
import { Comments } from './entities/comments.entity';
import { MediaStaticService } from '../media/media-static.service';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepo: Repository<Comments>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(CommentReactions)
    private readonly reactionRepo: Repository<CommentReactions>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly mediaService: MediaStaticService,
  ) {}

  async create(dto: CreateCommentDto, userId?: number) {
    if (!userId) {
      throw new UnauthorizedException('ابتدا وارد حساب کاربری خود شوید.');
    }

    const productExists = await this.productRepo.existsBy({
      id: dto.productId,
    });

    if (!productExists) {
      throw new NotFoundException(`محصول با شناسه ${dto.productId} یافت نشد`);
    }

    const existing = await this.commentRepo.findOne({
      where: {
        product: { id: dto.productId },
        user: { id: userId },
      },
      select: { id: true },
      loadEagerRelations: false,
    });

    if (existing) {
      throw new ConflictException('شما قبلاً برای این محصول نظر داده‌اید.');
    }

    // ۱. ذخیره کامنت با امتیاز و عکس‌ها
    const comment = this.commentRepo.create({
      ...dto,
      rating: dto.rating,
      images: dto.images || [],
      user: { id: userId } as Users,
      product: { id: dto.productId } as Products,
      isApproved: false,
    });

    const savedComment = await this.commentRepo.save(comment);

    if (dto.images?.length) {
      await this.mediaService
        .reassignOwner(
          dto.images,
          MediaOwnerType.COMMENT_IMAGE,
          String(savedComment.id),
        )
        .catch(() => {});
    }

    // اگر کامنت در لحظه تایید شده، میانگین محصول آپدیت شود
    if (savedComment.isApproved) {
      await this.updateProductRating(dto.productId);
    }

    return {
      id: savedComment.id,
      subject: savedComment.subject,
      description: savedComment.description,
      rating: savedComment.rating,
      images: savedComment.images,
      isApproved: savedComment.isApproved,
      createdAt: savedComment.createdAt,
    };
  }

  async findByProduct(productId: number, query?: ListQuery, userId?: number) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));

    const [data, total] = await this.commentRepo.findAndCount({
      select: {
        id: true,
        subject: true,
        description: true,
        rating: true,
        images: true,
        isVerifiedBuyer: true,
        likesCount: true,
        dislikesCount: true,
        createdAt: true,
        user: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      relations: { user: true },
      where: {
        product: { id: productId },
        isApproved: true,
        isRejected: false,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
      loadEagerRelations: false,
    });

    // دریافت واکنش‌های کاربر لاگین‌کرده برای کامنت‌های همین صفحه
    let reactionByComment = new Map<number, 'like' | 'dislike'>();
    if (userId && data.length > 0) {
      const commentIds = data.map((c) => c.id);
      const reactions = await this.reactionRepo.find({
        where: {
          user: { id: userId },
          comment: { id: In(commentIds) },
        },
        select: { id: true, type: true, comment: { id: true } },
        relations: { comment: true },
        loadEagerRelations: false,
      });
      reactionByComment = new Map(
        reactions
          .filter((r) => r.comment?.id)
          .map((r) => [r.comment.id, r.type]),
      );
    }

    // محاسبه‌ی توزیع امتیاز ستاره‌ها (۱ تا ۵) برای تمام نظرات تاییدشده‌ی این محصول
    const distRows = await this.commentRepo
      .createQueryBuilder('c')
      .select('c.rating', 'rating')
      .addSelect('COUNT(c.id)', 'count')
      .where('c.productId = :productId', { productId })
      .andWhere('c.isApproved = :approved', { approved: true })
      .andWhere('c.isRejected = :rejected', { rejected: false })
      .groupBy('c.rating')
      .getRawMany<{ rating: number; count: string }>();

    const countByStar = new Map<number, number>(
      distRows.map((r) => [Number(r.rating), Number(r.count)]),
    );
    const totalApproved = Array.from(countByStar.values()).reduce(
      (sum, c) => sum + c,
      0,
    );
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
      const count = countByStar.get(star) ?? 0;
      const percent =
        totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
      return { star, count, percent };
    });

    const commentsWithReaction = data.map((c) => ({
      ...c,
      myReaction: reactionByComment.get(c.id) ?? null,
    }));

    return {
      ...buildPagination([commentsWithReaction, total], page, limit, 'comments'),
      ratingDistribution,
    };
  }

  async react(commentId: number, userId: number, type: 'like' | 'dislike') {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const commentRepo = queryRunner.manager.getRepository(Comments);
      const reactionRepo = queryRunner.manager.getRepository(CommentReactions);
      const userRepo = queryRunner.manager.getRepository(Users);

      const comment = await commentRepo.findOne({
        where: { id: commentId },
        select: { id: true, likesCount: true, dislikesCount: true },
        loadEagerRelations: false,
      });
      if (!comment) throw new NotFoundException('کامنت پیدا نشد');

      const userExists = await userRepo.existsBy({ id: userId });
      if (!userExists) throw new UnauthorizedException('کاربر معتبر نیست');

      const existingReaction = await reactionRepo.findOne({
        where: { user: { id: userId }, comment: { id: commentId } },
        select: { id: true, type: true },
        loadEagerRelations: false,
      });

      let myReaction: 'like' | 'dislike' | null = type;

      if (!existingReaction) {
        const reaction = reactionRepo.create({
          comment: { id: commentId } as Comments,
          user: { id: userId } as Users,
          type,
        });
        await reactionRepo.save(reaction);
        if (type === 'like') comment.likesCount++;
        else comment.dislikesCount++;
      } else if (existingReaction.type === type) {
        await reactionRepo.remove(existingReaction);
        myReaction = null;
        if (type === 'like') {
          comment.likesCount = Math.max(0, comment.likesCount - 1);
        } else {
          comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
        }
      } else {
        existingReaction.type = type;
        await reactionRepo.save(existingReaction);
        if (type === 'like') {
          comment.likesCount++;
          comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
        } else {
          comment.likesCount = Math.max(0, comment.likesCount - 1);
          comment.dislikesCount++;
        }
      }

      const saved = await commentRepo.save(comment);
      await queryRunner.commitTransaction();

      return {
        id: saved.id,
        likesCount: saved.likesCount,
        dislikesCount: saved.dislikesCount,
        myReaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async recommend(productId: number, recommend: boolean) {
    const product = await this.productRepo.findOneByOrFail({ id: productId });

    if (recommend) {
      product.recommendUp += 1;
      product.ratingsSum += 4;
    } else {
      product.recommendDown += 1;
      product.ratingsSum += 2;
    }

    product.ratingsCount += 1;
    product.averageRating = product.ratingsCount
      ? Number((product.ratingsSum / product.ratingsCount).toFixed(2))
      : 5;

    await this.productRepo.save(product);
    return { message: 'ممنون از امتیازتون!' };
  }

  // src/comments/comments.service.ts

  async updateProductRating(productId: number): Promise<void> {
    // ۱. دریافت میانگین و تعداد نظرات تاییدشده از دیتابیس
    const stats = await this.commentRepo
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'avg')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.productId = :productId', { productId })
      .andWhere('comment.isApproved = :isApproved', { isApproved: true }) // فقط نظرات تایید شده
      .getRawOne<{ avg: string | null; count: string | null }>();

    const ratingsCount = stats?.count ? Number(stats.count) : 0;
    const averageRating =
      ratingsCount > 0 && stats?.avg
        ? Number(parseFloat(stats.avg).toFixed(2))
        : 5;

    // ۲. به‌روزرسانی مستقیم انتیتی محصول
    await this.productRepo.update(productId, {
      averageRating,
      ratingsCount,
    });
  }

  //  Admin

  async findAll(query: ListQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'DESC',
      sortBy = 'id',
    } = query;
    const searchableFields = ['subject'];
    const where = buildSearchWhereClause(search, searchableFields);
    const [data, total] = await this.commentRepo.findAndCount({
      select: {
        id: true,
        subject: true,
        description: true,
        rating: true,
        isApproved: true,
        isRejected: true,
        isVerifiedBuyer: true,
        likesCount: true,
        dislikesCount: true,
        createdAt: true,
        user: {
          id: true,
          first_name: true,
          last_name: true,
          mobile: true,
        },
      },
      relations: {
        user: true,
      },
      where,
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { [sortBy]: toSortDirection(sortOrder) },
      withDeleted: false,
      loadEagerRelations: false,
    });
    return buildPagination([data, total], page, limit, 'comments');
  }

  async findOne(id: number): Promise<Comments> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: {
        id: true,
        subject: true,
        description: true,
        rating: true,
        images: true,
        isApproved: true,
        isRejected: true,
        isVerifiedBuyer: true,
        likesCount: true,
        dislikesCount: true,
        createdAt: true,
      },
      loadEagerRelations: false,
    });
    if (!comment) throw new NotFoundException('کامنت پیدا نشد');
    return comment;
  }

  async update(id: number, dto: UpdateCommentDto): Promise<Comments> {
    const comment = await this.findOne(id);
    Object.assign(comment, dto);
    return this.commentRepo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: { id: true, product: { id: true } },
      relations: { product: true },
      loadEagerRelations: false,
    });

    if (!comment) throw new NotFoundException('کامنت یافت نشد');

    await this.reactionRepo.delete({ comment: { id } });
    await this.mediaService
      .deleteByOwner(MediaOwnerType.COMMENT_IMAGE, String(id))
      .catch(() => {});
    await this.commentRepo.remove(comment);

    if (comment.product?.id) {
      await this.updateProductRating(comment.product.id);
    }
  }

  async findPublic(): Promise<Comments[]> {
    return this.commentRepo.find({
      select: {
        id: true,
        subject: true,
        description: true,
        rating: true,
        images: true,
        isVerifiedBuyer: true,
        likesCount: true,
        dislikesCount: true,
        createdAt: true,
        user: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      loadEagerRelations: false,
    });
  }

  async reject(id: number): Promise<Comments> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: {
        id: true,
        isApproved: true,
        isRejected: true,
        product: { id: true },
      },
      relations: { product: true },
      loadEagerRelations: false,
    });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.isApproved = false;
    comment.isRejected = true;

    const saved = await this.commentRepo.save(comment);
    if (comment.product?.id) {
      await this.updateProductRating(comment.product.id);
    }
    return saved;
  }

  async approve(id: number): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: {
        id: true,
        isApproved: true,
        isRejected: true,
        product: { id: true },
      },
      relations: { product: true },
      loadEagerRelations: false,
    });

    if (!comment) throw new NotFoundException('کامنت یافت نشد');

    comment.isApproved = true;
    comment.isRejected = false;
    await this.commentRepo.save(comment);

    if (comment.product?.id) {
      await this.updateProductRating(comment.product.id);
    }
  }
}

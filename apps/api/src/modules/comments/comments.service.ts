import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepo: Repository<Comments>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(Comments)
    private readonly reactionRepo: Repository<CommentReactions>,
  ) {}

  async create(dto: CreateCommentDto, userId?: number) {
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

  async findByProduct(productId: number, query?: ListQuery) {
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

    return buildPagination([data, total], page, limit, 'comments');
  }

  async react(commentId: number, userId: number, type: 'like' | 'dislike') {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      select: { id: true, likesCount: true, dislikesCount: true },
      loadEagerRelations: false,
    });
    if (!comment) throw new NotFoundException('کامنت پیدا نشد');

    const userExists = await this.userRepo.existsBy({ id: userId });
    if (!userExists) throw new UnauthorizedException('کاربر معتبر نیست');

    const existingReaction = await this.reactionRepo.findOne({
      where: { user: { id: userId }, comment: { id: commentId } },
      select: { id: true, type: true },
      loadEagerRelations: false,
    });

    if (!existingReaction) {
      // ثبت واکنش جدید
      const reaction = this.reactionRepo.create({
        comment: { id: commentId } as Comments,
        user: { id: userId } as Users,
        type,
      });
      await this.reactionRepo.save(reaction);
      if (type === 'like') comment.likesCount++;
      else comment.dislikesCount++;
    } else if (existingReaction.type === type) {
      // Undo واکنش
      await this.reactionRepo.remove(existingReaction);
      if (type === 'like') comment.likesCount--;
      else comment.dislikesCount--;
    } else {
      // تغییر واکنش
      existingReaction.type = type;
      await this.reactionRepo.save(existingReaction);
      if (type === 'like') {
        comment.likesCount++;
        comment.dislikesCount--;
      } else {
        comment.likesCount--;
        comment.dislikesCount++;
      }
    }

    return this.commentRepo.save(comment);
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
      : 0;

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

    const averageRating = stats?.avg
      ? Number(parseFloat(stats.avg).toFixed(2))
      : 0;
    const ratingsCount = stats?.count ? Number(stats.count) : 0;

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

    await this.commentRepo.remove(comment);
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
      select: { id: true, isApproved: true, isRejected: true },
      loadEagerRelations: false,
    });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.isApproved = false;
    comment.isRejected = true;

    return this.commentRepo.save(comment);
  }

  async approve(id: number): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: { id: true, isApproved: true, isRejected: true },
      loadEagerRelations: false,
    });

    if (!comment) throw new NotFoundException('کامنت یافت نشد');

    comment.isApproved = true;
    comment.isRejected = false;
    await this.commentRepo.save(comment);

    // محاسبه مجدد امتیاز پس از تایید
    // await this.updateProductRating(comment.product.id);
  }
}

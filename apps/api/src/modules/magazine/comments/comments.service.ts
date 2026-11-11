import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Article } from '../entities/articles.entity';
import { CreateCommentDto } from '../dtos/misc.dto';
import { Comment, CommentStatus } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  async create(dto: CreateCommentDto, ipAddress: string): Promise<Comment> {
    const article = await this.articleRepo.findOneByOrFail({
      id: dto.articleId,
    });

    const comment = this.commentRepo.create({
      name: dto.name,
      email: dto.email,
      content: dto.content,
      article,
      // اصلاح این بخش: حذف as Comment و استفاده از ساختار استاندارد
      parent: dto.parentId ? { id: dto.parentId } : null,
      status: CommentStatus.PENDING,
      ipAddress,
    });

    return this.commentRepo.save(comment);
  }

  async findAllAdmin(params: {
    status?: CommentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const qb = this.commentRepo
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.name',
        'comment.email',
        'comment.content',
        'comment.status',
        'comment.createdAt',
        'article.id',
        'article.title',
        'article.slug',
      ])
      .leftJoin('comment.article', 'article')
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (params.status) {
      qb.andWhere('comment.status = :status', { status: params.status });
    }

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // فقط کامنت‌های تایید شده و بدون parent (سطح اول)، همراه با پاسخ‌های تاییدشده
  async findApprovedByArticle(articleId: number): Promise<Comment[]> {
    return this.commentRepo.find({
      where: {
        article: { id: articleId },
        status: CommentStatus.APPROVED,
        parent: IsNull(), // ۲. استفاده از IsNull() به جای null خالص
      },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        replies: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
        },
      },
      relations: { replies: true },
      order: { createdAt: 'DESC' },
      loadEagerRelations: false,
    });
  }

  async findPendingAdmin(): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { status: CommentStatus.PENDING },
      select: {
        id: true,
        name: true,
        email: true,
        content: true,
        status: true,
        createdAt: true,
        article: {
          id: true,
          title: true,
          slug: true,
        },
      },
      relations: {
        article: true,
      },
      order: { createdAt: 'DESC' },
      loadEagerRelations: false,
    });
  }

  async moderate(id: number, status: CommentStatus): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      select: {
        id: true,
        status: true,
        article: { id: true },
      },
      relations: {
        article: true,
      },
      loadEagerRelations: false,
    });
    if (!comment) throw new NotFoundException('نظر یافت نشد');
    comment.status = status;
    const saved = await this.commentRepo.save(comment);

    if (status === CommentStatus.APPROVED) {
      await this.articleRepo.increment(
        { id: comment.article.id },
        'commentCount',
        1,
      );
    }
    return saved;
  }

  async remove(id: number): Promise<void> {
    const result = await this.commentRepo.delete(id);
    if (!result.affected) throw new NotFoundException('نظر یافت نشد');
  }
}

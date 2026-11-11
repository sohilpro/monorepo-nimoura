import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article, ArticleStatus } from '../entities/articles.entity';
import { ArticleLike } from '../entities/article-like.entity';
import { Category } from '../entities/category.entity';
import { Author } from '../entities/author.entity';
import { Tag } from '../entities/tag.entity';
import {
  CreateArticleDto,
  QueryArticleAdminDto,
  QueryArticleDto,
  UpdateArticleDto,
} from '../dtos/create.dto';
import { generateSlug, makeSlugUnique } from '../utils/slug.util';
import { calculateReadingTime } from '../utils/reading-time.util';
import { PaginatedResult } from '../dtos/pagination.dto';

const ARTICLE_LIST_SELECT = [
  'article.id',
  'article.title',
  'article.slug',
  'article.summary',
  'article.coverImage',
  'article.coverImageAlt',
  'article.status',
  'article.isFeatured',
  'article.readingTime',
  'article.viewCount',
  'article.likeCount',
  'article.commentCount',
  'article.publishedAt',
  'article.createdAt',
  'article.updatedAt',
  'author.id',
  'author.name',
  'author.slug',
  'author.avatar',
  'category.id',
  'category.name',
  'category.slug',
  'tags.id',
  'tags.name',
  'tags.slug',
];

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(ArticleLike)
    private readonly likeRepo: Repository<ArticleLike>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Author) private readonly authorRepo: Repository<Author>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    // ۱. پیدا کردن رابطه Author
    const author = await this.authorRepo.findOneByOrFail({ id: dto.authorId });

    // ۲. پیدا کردن رابطه Category
    const category = await this.categoryRepo.findOneByOrFail({
      id: dto.categoryId,
    });

    // ۳. پیدا کردن تگ‌ها (در صورت وجود)
    const tags = dto.tagIds?.length
      ? await this.tagRepo.findBy({ id: In(dto.tagIds) })
      : [];

    // ۴. ساخت یا یکتا کردن Slug
    let slug = generateSlug(dto.title);
    const exists = await this.articleRepo.findOneBy({ slug });
    if (exists) slug = makeSlugUnique(slug);

    // ۵. ساخت انتیتی با تفکیک دقیق فیلدها و روابط
    const article = this.articleRepo.create({
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      coverImage: dto.coverImage,
      coverImageAlt: dto.coverImageAlt,
      status: dto.status ?? ArticleStatus.DRAFT,
      isFeatured: dto.isFeatured ?? false,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      metaKeywords: dto.metaKeywords,
      canonicalUrl: dto.canonicalUrl,

      // روابط و مقادیر محاسباتی
      slug,
      author,
      category,
      tags,
      readingTime: calculateReadingTime(dto.content),

      // تعیین تاریخ انتشار (اگر وضعیت PUBLISHED بود تاریخ الان، وگرنه null یا undefined)
      publishedAt: dto.status === ArticleStatus.PUBLISHED ? new Date() : null,
    });

    return this.articleRepo.save(article);
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepo.findOneBy({ id });
    if (!article) throw new NotFoundException('مقاله یافت نشد');

    if (dto.authorId)
      article.author = await this.authorRepo.findOneByOrFail({
        id: dto.authorId,
      });
    if (dto.categoryId)
      article.category = await this.categoryRepo.findOneByOrFail({
        id: dto.categoryId,
      });
    if (dto.tagIds)
      article.tags = await this.tagRepo.findBy({ id: In(dto.tagIds) });

    if (dto.title && dto.title !== article.title) {
      let slug = generateSlug(dto.title);
      const exists = await this.articleRepo.findOneBy({ slug });
      if (exists && exists.id !== id) slug = makeSlugUnique(slug);
      article.slug = slug;
    }

    if (dto.content) article.readingTime = calculateReadingTime(dto.content);

    if (
      dto.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      article.publishedAt = new Date();
    }

    Object.assign(article, dto);
    return this.articleRepo.save(article);
  }

  async findAllPublished(
    query: QueryArticleDto,
  ): Promise<PaginatedResult<Article>> {
    const qb = this.articleRepo
      .createQueryBuilder('article')
      .select(ARTICLE_LIST_SELECT)
      .leftJoin('article.author', 'author')
      .leftJoin('article.category', 'category')
      .leftJoin('article.tags', 'tags')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED });

    if (query.search) {
      qb.andWhere('(article.title ILIKE :s OR article.summary ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    if (query.categorySlug) {
      qb.andWhere('category.slug = :cSlug', { cSlug: query.categorySlug });
    }
    if (query.tagSlug) {
      qb.andWhere('tags.slug = :tSlug', { tSlug: query.tagSlug });
    }
    if (query.authorSlug) {
      qb.andWhere('author.slug = :aSlug', { aSlug: query.authorSlug });
    }
    if (query.featured) {
      qb.andWhere('article.isFeatured = true');
    }

    switch (query.sort) {
      case 'popular':
        qb.orderBy('article.viewCount', 'DESC');
        break;
      case 'most_liked':
        qb.orderBy('article.likeCount', 'DESC');
        break;
      default:
        qb.orderBy('article.publishedAt', 'DESC');
    }

    qb.skip(query.skip).take(query.limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: query.limit,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
      },
    };
  }

  // لیست کامل برای پنل ادمین — شامل تمام وضعیت‌ها، مرتب‌شده بر اساس آخرین ویرایش
  async findAllAdmin(
    query: QueryArticleAdminDto,
  ): Promise<PaginatedResult<Article>> {
    const qb = this.articleRepo
      .createQueryBuilder('article')
      .select(ARTICLE_LIST_SELECT)
      .leftJoin('article.author', 'author')
      .leftJoin('article.category', 'category')
      .leftJoin('article.tags', 'tags');

    if (query.search) {
      qb.andWhere('(article.title ILIKE :s OR article.summary ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere('article.status = :status', { status: query.status });
    }
    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.authorId) {
      qb.andWhere('author.id = :authorId', { authorId: query.authorId });
    }

    qb.orderBy('article.updatedAt', 'DESC').skip(query.skip).take(query.limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: query.limit,
        totalPages: Math.ceil(totalItems / query.limit),
        currentPage: query.page,
      },
    };
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        coverImage: true,
        coverImageAlt: true,
        status: true,
        isFeatured: true,
        readingTime: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        relatedProductIds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          jobTitle: true,
          bio: true,
          socialLinks: true,
        },
        category: { id: true, name: true, slug: true },
        tags: { id: true, name: true, slug: true },
      },
      relations: {
        author: true,
        category: true,
        tags: true,
      },
      loadEagerRelations: false,
    });
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    return article;
  }

  async findRelated(article: Article, limit = 4): Promise<Article[]> {
    return this.articleRepo
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.title',
        'article.slug',
        'article.summary',
        'article.coverImage',
        'article.coverImageAlt',
        'article.readingTime',
        'article.publishedAt',
        'author.id',
        'author.name',
        'author.slug',
        'author.avatar',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .leftJoin('article.author', 'author')
      .leftJoin('article.category', 'category')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere('article.id != :id', { id: article.id })
      .andWhere('article.category_id = :categoryId', {
        categoryId: article.category.id,
      })
      .orderBy('article.publishedAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async incrementView(id: number): Promise<void> {
    await this.articleRepo.increment({ id }, 'viewCount', 1);
  }

  async toggleLike(
    articleId: number,
    fingerprint: string,
    userId?: number,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      select: { id: true, likeCount: true },
      loadEagerRelations: false,
    });
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    const existing = await this.likeRepo.findOne({
      where: { article: { id: articleId }, fingerprint },
      select: { id: true },
      loadEagerRelations: false,
    });

    if (existing) {
      await this.likeRepo.remove(existing);
      await this.articleRepo.decrement({ id: articleId }, 'likeCount', 1);
      return { liked: false, likeCount: article.likeCount - 1 };
    }

    try {
      await this.likeRepo.save(
        this.likeRepo.create({ article, fingerprint, userId }),
      );
      await this.articleRepo.increment({ id: articleId }, 'likeCount', 1);
      return { liked: true, likeCount: article.likeCount + 1 };
    } catch {
      throw new ConflictException('این مقاله قبلا لایک شده است');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepo.delete(id);
    if (!result.affected) throw new NotFoundException('مقاله یافت نشد');
  }

  async findOneAdmin(id: number): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        coverImage: true,
        coverImageAlt: true,
        status: true,
        isFeatured: true,
        readingTime: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        relatedProductIds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { id: true, name: true, slug: true },
        category: { id: true, name: true, slug: true },
        tags: { id: true, name: true, slug: true },
      },
      relations: {
        author: true,
        category: true,
        tags: true,
      },
      loadEagerRelations: false,
    });
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    return article;
  }
}

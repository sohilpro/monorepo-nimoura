import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Author } from './author.entity';
import { Comment } from './comment.entity';
import { ArticleLike } from './article-like.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('magazine_articles')
@Index(['status', 'publishedAt'])
@Index('idx_mag_articles_status_featured_pub', [
  'status',
  'isFeatured',
  'publishedAt',
])
@Index('idx_mag_articles_status_views', ['status', 'viewCount'])
@Index('idx_mag_articles_status_likes', ['status', 'likeCount'])
@Index('idx_mag_articles_updated_at', ['updatedAt'])
export class Article extends CustomBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ length: 280, unique: true })
  @Index()
  slug: string;

  // خلاصه کوتاه برای کارت مقاله و متا دیسکریپشن
  @Column({ type: 'varchar', length: 500 })
  summary: string;

  // محتوای اصلی به صورت HTML (خروجی ادیتور Rich Text مثل TipTap/CKEditor)
  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'cover_image', type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  @Column({
    name: 'cover_image_alt',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  coverImageAlt: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  // زمان مطالعه به دقیقه (محاسبه خودکار هنگام ذخیره)
  @Column({ name: 'reading_time', type: 'int', default: 1 })
  readingTime: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  // ---------- SEO ----------
  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  metaDescription: string;

  @Column({
    name: 'meta_keywords',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  metaKeywords: string;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  canonicalUrl: string;

  // ---------- روابط ----------
  @Index('idx_mag_articles_author')
  @ManyToOne(() => Author, (author) => author.articles, {
    nullable: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: Author;

  @Index('idx_mag_articles_category')
  @ManyToOne(() => Category, (category) => category.articles, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.articles, { cascade: false })
  @JoinTable({
    name: 'magazine_article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @OneToMany(() => ArticleLike, (like) => like.article)
  likes: ArticleLike[];

  // ارتباط اختیاری با محصولات فروشگاه (برای معرفی محصول داخل مقاله)
  @Column({ name: 'related_product_ids', type: 'simple-array', nullable: true })
  relatedProductIds: string[];

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  @Index()
  publishedAt?: Date | null;
}

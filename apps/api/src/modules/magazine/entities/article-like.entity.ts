import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Article } from './articles.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('magazine_article_likes')
@Unique(['article', 'fingerprint'])
export class ArticleLike extends CustomBaseEntity {
  @Index('idx_mag_article_likes_article')
  @ManyToOne(() => Article, (article) => article.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: number;

  // شناسه ترکیبی از IP + User-Agent برای کاربران مهمان، جهت جلوگیری از لایک تکراری
  @Column({ type: 'varchar', length: 128 })
  fingerprint!: string;
}

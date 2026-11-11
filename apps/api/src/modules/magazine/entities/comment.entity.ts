import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Article } from './articles.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('magazine_comments')
@Index('idx_mag_comments_article_status_parent', [
  'article',
  'status',
  'parent',
  'createdAt',
])
@Index('idx_mag_comments_status_created', ['status', 'createdAt'])
export class Comment extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 190 })
  email: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  @Index()
  status: CommentStatus;

  // اگر کاربر لاگین بود می‌توان به جدول users در ماژول اصلی سایت وصل کرد
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string;
}

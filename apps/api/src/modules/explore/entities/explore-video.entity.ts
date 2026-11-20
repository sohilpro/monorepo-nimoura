import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { ExploreVideoComment } from './explore-video-comment.entity';
import { ExploreVideoLike } from './explore-video-like.entity';

@Entity('explore_videos')
export class ExploreVideo extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'video_url', type: 'varchar', length: 500 })
  videoUrl!: string;

  @Column({ name: 'poster_url', type: 'varchar', length: 500, default: '' })
  posterUrl!: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount!: number;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product?: Products | null;

  @ManyToOne(() => Categories, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: Categories | null;

  @OneToMany(() => ExploreVideoComment, (c) => c.video)
  comments!: ExploreVideoComment[];

  @OneToMany(() => ExploreVideoLike, (l) => l.video)
  likes!: ExploreVideoLike[];
}

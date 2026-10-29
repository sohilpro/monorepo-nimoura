// backend/src/comments/entities/comment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('comments')
export class Comments extends CustomBaseEntity {
  @ApiProperty({ example: 'خیلی خوب بود' })
  @Column()
  subject!: string;

  @ApiProperty({ example: 'محصول دقیقاً همونیه که توی عکس دیدم...' })
  @Column({ type: 'text' })
  description!: string;

  // ── NEW: ستون امتیاز (۱ تا ۵) ─────────────────
  @ApiProperty({ example: 5, description: 'امتیاز کاربر به محصول (۱ تا ۵)' })
  @Column({ type: 'int', default: 5 })
  rating!: number;

  // ── NEW: آرایه URL عکس‌های کاربر ──────────────
  @ApiProperty({
    type: [String],
    description: 'عکس‌های ضمیمه کاربر',
    default: [],
  })
  @Column({ type: 'simple-array', nullable: true, default: null })
  images!: string[] | null;

  @ManyToOne(() => Users, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  user!: Users;

  @ManyToOne(() => Products, (product) => product.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product!: Products;

  @Column({ default: false }) isVerifiedBuyer!: boolean;
  @Column({ default: 0 }) likesCount!: number;
  @Column({ default: 0 }) dislikesCount!: number;
  @Column({ default: false }) isApproved!: boolean;
  @Column({ default: false }) isRejected!: boolean;
}

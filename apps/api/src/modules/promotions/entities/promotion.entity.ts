import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Brands } from 'src/modules/brands/entities/brands.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

@Entity('promotions')
export class Promotions extends CustomBaseEntity {
  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: PromotionType })
  type!: PromotionType;

  @Column('float')
  amount!: number;

  @Column({ nullable: true })
  promoCode?: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column({ default: false })
  isPublic!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Products, { nullable: true })
  @JoinTable({
    name: 'promotion_products',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products?: Products[];

  @ManyToMany(() => Categories, { nullable: true })
  @JoinTable({
    name: 'promotion_categories',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories?: Categories[];

  @ManyToMany(() => Brands, { nullable: true })
  @JoinTable({
    name: 'promotion_brands',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'brand_id', referencedColumnName: 'id' },
  })
  brands?: Brands[];

  @Column({ default: 0 })
  maxTotalUses!: number; // 0 = نامحدود

  @Column({ default: 0 })
  maxUsesPerUser!: number;

  @Column({ default: 0 })
  minOrderAmount!: number;

  @Column({ default: 0 })
  totalUsed!: number; // مجموع کل استفاده‌ها

  @ManyToMany(() => Users, { nullable: true }) // اگر خواستید فقط برای کاربر خاصی باشه
  @JoinTable()
  allowedUsers?: Users[];

  @Column({ type: 'int', nullable: true })
  maxAmount?: number;
}

import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Products } from './products.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('product_images')
export class ProductImages extends CustomBaseEntity {
  @Index('idx_product_images_product')
  @ManyToOne(() => Products, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product!: Products;

  @Column()
  url!: string;
}

import { Column, Entity, ManyToOne } from 'typeorm';
import { Products } from './products.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('product_images')
export class ProductImages extends CustomBaseEntity {
  @ManyToOne(() => Products, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product!: Products;

  @Column()
  url!: string;
}

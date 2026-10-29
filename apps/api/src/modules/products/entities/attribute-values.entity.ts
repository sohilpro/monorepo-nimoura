import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Attributes } from './attributes.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('attribute_values')
export class AttributeValues extends CustomBaseEntity {
  @Column()
  value!: string; // مانند: "500ml"، "شفاف"، "1kg"

  @ManyToOne(() => Attributes, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  attribute!: Attributes;

  @ManyToMany(() => ProductVariants, (variant) => variant.attributeValues)
  variants!: ProductVariants[];
}
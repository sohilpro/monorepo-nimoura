import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Attributes } from './attributes.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('attribute_values')
export class AttributeValues extends CustomBaseEntity {
  @Column()
  value!: string; // مانند: "500ml"، "شفاف"، "1kg"

  // کد رنگ به فرمت #RRGGBB (فقط برای ویژگی‌های رنگی)
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorHex?: string | null;

  @ManyToOne(() => Attributes, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  attribute!: Attributes;

  @ManyToMany(() => ProductVariants, (variant) => variant.attributeValues)
  variants!: ProductVariants[];
}
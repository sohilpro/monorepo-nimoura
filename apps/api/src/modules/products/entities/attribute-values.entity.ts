import { Entity, Column, ManyToOne, ManyToMany, Index } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Attributes } from './attributes.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('attribute_values')
@Index('idx_attribute_values_attr_val', ['attribute', 'value'])
export class AttributeValues extends CustomBaseEntity {
  @Column()
  value!: string; // مانند: "500ml"، "شفاف"، "1kg"

  // کد رنگ به فرمت #RRGGBB (فقط برای ویژگی‌های رنگی)
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorHex?: string | null;

  @Index('idx_attribute_values_attribute')
  @ManyToOne(() => Attributes, (attribute) => attribute.values, {
    onDelete: 'CASCADE',
  })
  attribute!: Attributes;

  @ManyToMany(() => ProductVariants, (variant) => variant.attributeValues)
  variants!: ProductVariants[];
}

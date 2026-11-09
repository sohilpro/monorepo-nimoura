import { Entity, Column, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { AttributeValues } from './attribute-values.entity';
import type { AttributeKind } from '../constants/attribute-kind';

@Entity('attributes')
export class Attributes extends CustomBaseEntity {
  @Column({ unique: true })
  name!: string; // مانند: "حجم"، "رنگ"، "وزن"

  @Column({ nullable: true })
  label?: string; // عنوان نمایشی برای UI

  // نوع ویژگی: حجمی، وزنی، رنگی یا سایر
  @Column({ type: 'varchar', length: 16, default: 'custom' })
  kind!: AttributeKind;

  @OneToMany(() => AttributeValues, (value) => value.attribute, {
    cascade: true,
  })
  values!: AttributeValues[];
}
import { Entity, Column, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { AttributeValues } from './attribute-values.entity';

@Entity('attributes')
export class Attributes extends CustomBaseEntity {
  @Column({ unique: true })
  name!: string; // مانند: "حجم"، "رنگ"، "وزن"

  @Column({ nullable: true })
  label?: string; // عنوان نمایشی برای UI

  @OneToMany(() => AttributeValues, (value) => value.attribute, {
    cascade: true,
  })
  values!: AttributeValues[];
}
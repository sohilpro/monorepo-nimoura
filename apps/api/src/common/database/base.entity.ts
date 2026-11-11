// src/common/database/base.entity.ts
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';

export abstract class CustomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;
}

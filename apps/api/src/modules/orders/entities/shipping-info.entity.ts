import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Addresses } from 'src/modules/users/addresses/entities/addresses.entity';

@Entity('shipping_info')
export class ShippingInfo extends CustomBaseEntity {
  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @ManyToOne(() => Addresses, { cascade: false, eager: true })
  @JoinColumn()
  address!: Addresses;

  @Column()
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  note?: string | null;
}
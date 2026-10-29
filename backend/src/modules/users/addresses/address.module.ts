// src/modules/addresses/addresses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Addresses } from './entities/addresses.entity';
import { AddressesService } from './address.service';
import { AdminAddressesController } from './controllers/admin-addresses.controller';
import { AddressesController } from './controllers/addresses.controller';
import { Users } from '../entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Addresses, Users])],
  controllers: [AddressesController, AdminAddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}

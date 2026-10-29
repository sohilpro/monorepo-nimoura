import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersAdminController } from './controllers/users-admin.controller';
import { WishlistModule } from 'src/modules/wishlist/wishlist.module'; // در صورت وجود
import { UsersController } from './controllers/users.controller';
import { Users } from './entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    WishlistModule, // اگر ماژول ویش‌لیست را دارید
  ],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

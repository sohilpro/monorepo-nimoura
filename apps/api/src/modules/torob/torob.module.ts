import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { TorobAuthGuard } from './torob-auth.guard';
import { TorobController } from './torob.controller';
import { TorobService } from './torob.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Orders])],
  controllers: [TorobController],
  providers: [TorobService, TorobAuthGuard],
})
export class TorobModule {}
// TorobModule را در imports مربوط به AppModule اضافه کنید.
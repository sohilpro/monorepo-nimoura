import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payments } from './entities/payments.entity';
import { PaymentService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SmsService } from './sms.service';

import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../orders/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payments]),

    CartModule,

    forwardRef(() => OrderModule),
  ],

  controllers: [PaymentsController],

  providers: [PaymentService, SmsService],

  exports: [PaymentService],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { PromotionUsages } from 'src/modules/promotions/entities/promotion-usages.entity';
import { Promotions } from 'src/modules/promotions/entities/promotion.entity';
import { PromotionModule } from 'src/modules/promotions/promotions.module';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Addresses } from 'src/modules/users/addresses/entities/addresses.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { AdminOrdersController } from './controllers/orders-admin.controller';
import { OrdersController } from './controllers/orders.controller';
import { OrderItems } from './entities/order-items.entity';
import { Orders } from './entities/orders.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { ShippingInfo } from './entities/shipping-info.entity';
import { InvoiceService } from './invoice.service';
import { OrderService } from './order.service';
import { OrdersAdminService } from './orders-admin.service';
import { PendingOrdersExpiryTask } from './tasks/pending-orders-expiry.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orders,
      OrderItems,
      ShippingInfo,
      PaymentInfo,
      Products,
      ProductVariants,
      Users,
      Addresses,
      Cart,
      Promotions,
      PromotionUsages,
    ]),
    PromotionModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [
    OrderService,
    OrdersAdminService,
    InvoiceService,
    PendingOrdersExpiryTask,
  ],
  exports: [OrderService, OrdersAdminService, InvoiceService],
})
export class OrderModule {}

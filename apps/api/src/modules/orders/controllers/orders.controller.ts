import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import { PaymentFailureDto } from 'src/modules/payments/dtos/payment-result.dto';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { InvoiceService } from '../invoice.service';
import { OrderService } from '../order.service';

@ApiTags('Store - Orders')
@ApiBearerAuth()
@Controller('orders') // مسیر نهایی: /api/v1/orders
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'ایجاد سفارش جدید',
    description:
      'ثبت سفارش بر اساس اقلام انتخاب‌شده؛ قیمت‌ها سمت سرور محاسبه می‌شوند.',
  })
  @ApiResponse({ status: 201, description: 'سفارش با موفقیت ثبت شد.' })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات سفارش یا آدرس نامعتبر است.',
  })
  async create(@CurrentUser('id') userId: number, @Body() dto: CreateOrderDto) {
    return await this.orderService.createOrder(dto, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'لیست سفارش‌های کاربر جاری (صفحه‌بندی)' })
  async getMyOrders(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.orderService.getUserOrders(userId, query);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'دریافت فاکتور PDF سفارش کاربر' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'شناسه سفارش',
    example: 123,
  })
  @ApiResponse({ status: 200, description: 'فایل فاکتور' })
  @ApiResponse({
    status: 404,
    description: 'سفارش یافت نشد یا متعلق به شما نیست.',
  })
  async getInvoice(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const order = await this.orderService.getUserOrderById(id, userId);
    const pdf = await this.invoiceService.generateInvoice(order);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `attachment; filename="invoice-${id}.pdf"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات یک سفارش کاربر' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه سفارش' })
  @ApiResponse({ status: 404, description: 'سفارش یافت نشد.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.orderService.getUserOrderById(id, userId);
  }

  /**
   * تأیید پرداخت عمداً از این کنترلر حذف شده است: هر کاربر لاگین‌کرده می‌توانست
   * سفارش را بدون پرداخت «پرداخت‌شده» کند. تأیید باید فقط از ماژول پرداخت و پس از
   * verify با درگاه، با OrderService.markAsPaid انجام شود.
   */
  @Post(':id/payment/failure')
  @ApiOperation({
    summary: 'ثبت شکست/انصراف پرداخت (لغو سفارش در انتظار خود کاربر)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه سفارش' })
  async paymentFailure(
    @Param('id', ParseIntPipe) orderId: number,
    @CurrentUser('id') userId: number,
    @Body() body: PaymentFailureDto,
  ) {
    return await this.orderService.markAsFailed(orderId, body.method, userId);
  }
}

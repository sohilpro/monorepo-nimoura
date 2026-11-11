import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { AdminOrderQueryDto } from '../dtos/admin-order-query.dto';
import {
  CreateOrderAdminDto,
  UpdateOrderAdminDto,
} from '../dtos/admin-order.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { InvoiceService } from '../invoice.service';
import { OrdersAdminService } from '../orders-admin.service';

@AdminController('orders') // مسیر نهایی: /api/v1/admin/orders
export class AdminOrdersController {
  constructor(
    private readonly ordersAdminService: OrdersAdminService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'لیست سفارش‌ها با فیلتر، جستجو و صفحه‌بندی' })
  async findAll(@Query() query: AdminOrderQueryDto) {
    return await this.ordersAdminService.findAllOrdersAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'آمار و گزارش فروش کلی' })
  async getStatistics() {
    return await this.ordersAdminService.getOrderStatistics();
  }

  @Post()
  @ApiOperation({
    summary: 'ایجاد سفارش توسط مدیریت',
    description:
      'قیمت‌ها و جمع کل سمت سرور محاسبه می‌شوند و موجودی کالاها کسر می‌شود.',
  })
  @ApiResponse({ status: 201, description: 'سفارش ایجاد شد.' })
  async create(@Body() dto: CreateOrderAdminDto) {
    return await this.ordersAdminService.createOrderAdmin(dto);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'دانلود فاکتور PDF سفارش' })
  @ApiParam({ name: 'id', type: Number })
  async getInvoice(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersAdminService.getOrderById(id);
    const pdf = await this.invoiceService.generateInvoice(order);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `attachment; filename="invoice-admin-${id}.pdf"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات کامل یک سفارش' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'سفارش یافت نشد.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersAdminService.getOrderById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'ویرایش سفارش (اقلام، مبالغ، گیرنده، پرداخت، وضعیت)',
    description:
      'همه‌ی فیلدها اختیاری هستند. اگر items ارسال شود، جایگزین کل اقلام می‌شود و موجودی بر اساس اختلاف تنظیم می‌گردد.',
  })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderAdminDto,
  ) {
    return await this.ordersAdminService.updateOrderAdmin(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تغییر وضعیت سفارش' })
  @ApiParam({ name: 'id', type: Number })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return await this.ordersAdminService.updateOrderStatus(id, dto.status);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'لغو سفارش',
    description:
      'وضعیت به «لغو شده» می‌رود و موجودی کالاها به انبار برمی‌گردد.',
  })
  @ApiParam({ name: 'id', type: Number })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersAdminService.cancelOrderAdmin(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف دائمی سفارش',
    description:
      'فقط سفارش‌های «در انتظار» یا «لغو شده» که به ترب گزارش نشده‌اند قابل حذف هستند.',
  })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersAdminService.deleteOrderAdmin(id);
  }
}

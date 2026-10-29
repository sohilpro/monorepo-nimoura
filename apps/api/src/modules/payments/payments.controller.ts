// src/modules/payment/controllers/payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';

@ApiTags('Payment')
@Controller('payments') // مسیر نهایی: /api/v1/payment
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({
    summary: 'ایجاد درخواست پرداخت',
    description:
      'درخواست اتصال به درگاه بانکی ایجاد شده و آدرس هدایت (Redirect URL) بازگردانده می‌شود.',
  })
  @ApiResponse({
    status: 201,
    description: 'آدرس درگاه پرداخت با موفقیت ایجاد شد.',
  })
  @ApiResponse({
    status: 400,
    description: 'خطا در اعتبارسنجی اطلاعات سفارش یا مبلغ.',
  })
  @ApiResponse({ status: 401, description: 'کاربر احراز هویت نشده است.' })
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreatePaymentDto,
  ) {
    const redirectUrl = await this.paymentService.requestPayment(dto, userId);
    return { redirectUrl };
  }

  @Public() // تماس بازگشتی از طرف درگاه بانکی فاقد هدر Authorization است
  @Get('verify')
  @ApiOperation({
    summary: 'تأیید تراکنش بانکی (Callback درگاه)',
    description:
      'بررسی وضعیت پرداخت، ثبت شماره پیگیری و تکمیل فرایند سفارش پس از بازگشت از بانک.',
  })
  @ApiResponse({ status: 200, description: 'پرداخت با موفقیت تأیید شد.' })
  @ApiResponse({
    status: 400,
    description: 'تراکنش ناموفق بود یا وریفای شکست خورد.',
  })
  async verify(
    @Query() query: VerifyPaymentDto,
    @Headers('x-internal-key') internalKey?: string,
  ) {
    return await this.paymentService.verifyPayment(query, internalKey);
  }

  @Post('retry/:orderId')
  @ApiOperation({ summary: 'تلاش مجدد برای پرداخت سفارش معلق' })
  async retryPayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser('id') userId: number,
  ) {
    return await this.paymentService.retryOrderPayment(orderId, userId);
  }
}

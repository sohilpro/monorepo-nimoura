import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { LoyaltyService } from '../loyalty.service';
import { CreateWithdrawalDto } from '../dtos/create-withdrawal.dto';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @Post('visits/check-in')
  @ApiOperation({ summary: 'ثبت حضور روزانه کاربر در باشگاه مشتریان' })
  checkIn(@CurrentUser('id') id: number) {
    return this.service.checkIn(id);
  }

  @Get('status')
  @ApiOperation({ summary: 'دریافت وضعیت حضور و اعتبار کاربر (فقط خواندنی)' })
  status(@CurrentUser('id') id: number) {
    return this.service.getStatus(id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'دریافت خلاصه جامع اعتبار و وضعیت هفته کاربر' })
  summary(@CurrentUser('id') id: number) {
    return this.service.getStatus(id);
  }

  @Get('balance')
  @ApiOperation({ summary: 'دریافت موجودی و اطلاعات هفتگی کاربر' })
  balance(@CurrentUser('id') id: number) {
    return this.service.getStatus(id);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'لیست تاریخچه تراکنش‌های کاربر با صفحه‌بندی' })
  ledger(
    @CurrentUser('id') id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.history(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('withdrawals')
  @ApiOperation({ summary: 'ثبت درخواست برداشت / تسویه اعتبار توسط کاربر' })
  requestWithdrawal(
    @CurrentUser('id') id: number,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.service.requestWithdrawal(id, dto);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'مشاهده درخواست‌های برداشت اعتبار کاربر' })
  withdrawals(@CurrentUser('id') id: number) {
    return this.service.getUserWithdrawals(id);
  }

  @Get('referral/info')
  @ApiOperation({ summary: 'اطلاعات سیستم دعوت، کد معرف و دوستان دعوت‌شده' })
  referralInfo(@CurrentUser('id') id: number) {
    return this.service.getReferralInfo(id);
  }

  @Post('referral/validate')
  @ApiOperation({ summary: 'بررسی و اعتبارسنجی کد تخفیف معرف برای سفارش' })
  validateReferral(
    @CurrentUser('id') id: number,
    @Body() dto: { code: string; subtotal: number },
  ) {
    return this.service.validateReferralCodeForOrder(
      dto.code,
      id,
      dto.subtotal || 0,
    );
  }
}

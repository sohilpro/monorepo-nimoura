import {
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { LoyaltyService } from '../loyalty.service';
import { UpdateLoyaltySettingsDto } from '../dtos/update-loyalty-settings.dto';
import { ManualAdjustmentDto } from '../dtos/manual-adjustment.dto';
import { LoyaltyLedgerQueryDto } from '../dtos/loyalty-ledger-query.dto';
import { ProcessWithdrawalDto } from '../dtos/process-withdrawal.dto';
import { LoyaltyWithdrawalStatus } from '../enums/loyalty-withdrawal-status.enum';
import { ReferralStatus } from '../enums/referral-status.enum';

@ApiTags('Admin - Loyalty')
@AdminController('loyalty')
export class LoyaltyAdminController {
  constructor(private readonly service: LoyaltyService) {}

  @Get('settings')
  @ApiOperation({ summary: 'دریافت تنظیمات باشگاه مشتریان' })
  settings() {
    return this.service.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'به‌روزرسانی تنظیمات باشگاه مشتریان' })
  update(@Body() dto: UpdateLoyaltySettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'دریافت آمار کلی باشگاه مشتریان' })
  stats() {
    return this.service.getAdminStats();
  }

  @Get('ledger')
  @ApiOperation({ summary: 'گزارش تراکنش‌های باشگاه مشتریان با فیلتر و جستجو' })
  ledger(@Query() query: LoyaltyLedgerQueryDto) {
    return this.service.getAdminLedger(query);
  }

  @Get('users')
  @ApiOperation({ summary: 'جستجوی کاربر جهت تنظیم دستی اعتبار' })
  searchUsers(@Query('q') q: string) {
    return this.service.searchUsersForAdjustment(q);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'ثبت تغییر دستی اعتبار توسط ادمین' })
  adjustment(
    @Body() dto: ManualAdjustmentDto,
    @CurrentUser('id') adminId: number,
  ) {
    return this.service.adjustment(
      dto.userId,
      dto.amount,
      dto.description,
      adminId,
      dto.idempotencyKey,
    );
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'لیست درخواست‌های برداشت اعتبار' })
  withdrawals(
    @Query('status') status?: LoyaltyWithdrawalStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getAdminWithdrawals(status, page, limit);
  }

  @Patch('withdrawals/:id')
  @ApiOperation({ summary: 'تأیید یا رد درخواست برداشت اعتبار' })
  processWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessWithdrawalDto,
    @CurrentUser('id') adminId: number,
  ) {
    return this.service.processWithdrawalAdmin(
      id,
      dto.status,
      adminId,
      dto.adminNote,
    );
  }

  @Get('referrals')
  @ApiOperation({ summary: 'لیست گزارشات معرفی و رفرال کاربران' })
  referrals(
    @Query('status') status?: ReferralStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getAdminReferrals(page, limit, status);
  }
}

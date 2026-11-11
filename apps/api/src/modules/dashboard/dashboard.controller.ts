import { Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dtos/dashboard-query.dto';

@AdminController('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'آمار جامع داشبورد مدیریت',
    description:
      'گزارش یکپارچه فروش، سری زمانی روزانه، وضعیت سفارش‌ها، موجودی انبار، مشتریان و محتوا.',
  })
  @ApiResponse({ status: 200, description: 'داده‌های داشبورد دریافت شد.' })
  getOverview(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOverview(query.range ?? '30d');
  }
}

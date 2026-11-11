import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { DashboardRange } from '@nimoura/shared-types';

export const DASHBOARD_RANGES = ['today', '7d', '30d', '90d', 'all'] as const;

export class DashboardQueryDto {
  @ApiPropertyOptional({
    enum: DASHBOARD_RANGES,
    default: '30d',
    description: 'بازه‌ی زمانی گزارش داشبورد',
  })
  @IsOptional()
  @IsIn(DASHBOARD_RANGES, {
    message: 'بازه زمانی باید یکی از مقادیر today، 7d، 30d، 90d یا all باشد.',
  })
  range?: DashboardRange = '30d';
}

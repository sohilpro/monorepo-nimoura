import { Body, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { LoyaltyService } from '../loyalty.service';
import { UpdateLoyaltySettingsDto } from '../dtos/update-loyalty-settings.dto';
import { ManualAdjustmentDto } from '../dtos/manual-adjustment.dto';

@ApiTags('Admin - Loyalty') @AdminController('loyalty')
export class LoyaltyAdminController {
  constructor(private readonly service: LoyaltyService) {}
  @Get('settings') settings() { return this.service.getSettings(); }
  @Patch('settings') update(@Body() dto: UpdateLoyaltySettingsDto) { return this.service.updateSettings(dto); }
  @Post('adjustments') adjustment(@Body() dto: ManualAdjustmentDto, @CurrentUser('id') adminId: number) { return this.service.adjustment(dto.userId!, dto.amount, dto.description, adminId); }
}

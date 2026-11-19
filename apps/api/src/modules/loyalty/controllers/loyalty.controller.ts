import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { LoyaltyService } from '../loyalty.service';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}
  @Post('visits/check-in') checkIn(@CurrentUser('id') id: number) {
    return this.service.checkIn(id);
  }
  @Get('status') status(@CurrentUser('id') id: number) {
    return this.service.checkIn(id);
  }
  @Get('balance') balance(@CurrentUser('id') id: number) {
    return this.service.balance(id);
  }
  @Get('ledger') ledger(
    @CurrentUser('id') id: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.history(id, Number(limit) || 50);
  }
}

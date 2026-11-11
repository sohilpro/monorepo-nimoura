import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PriceListService } from './price-list.service';
import { PriceListQueryDto } from './dtos/price-list-query.dto';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('price-list')
export class PriceListController {
  constructor(private readonly service: PriceListService) {}

  @Get()
  list(
    @Query() q: PriceListQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'public, max-age=60'); // کش کوتاه، قیمت‌ها هفتگی عوض می‌شوند
    return this.service.getList(q);
  }

  @Get('filters')
  filters() {
    return this.service.getFilters();
  }
}

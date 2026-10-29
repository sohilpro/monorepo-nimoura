import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchProductDto } from './dtos/search-product.dto';
import { QuickSearchDto } from './dtos/quick-search.dto';
import { Public } from 'src/common/auth/auth.decorators';

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // 🔓 عمومی — صفحه‌ی کامل نتایج جستجو (/search?q=...)
  @Get('products')
  searchProducts(@Query() dto: SearchProductDto) {
    return this.searchService.searchProducts(dto);
  }

  // 🔓 عمومی — dropdown سرچ‌بار موبایل (محصول + دسته + برند با هم)
  @Get('quick')
  quickSearch(@Query() dto: QuickSearchDto) {
    return this.searchService.quickSearch(dto.q);
  }
}
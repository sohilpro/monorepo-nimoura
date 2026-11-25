import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/auth/auth.decorators';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ShowcaseConfigsService } from '../showcase-configs.service';

@ApiTags('Showcase Configs (Public)')
@Public()
@UseGuards(ThrottlerGuard)
@Controller('showcase-configs')
export class ShowcaseConfigsController {
  constructor(private readonly service: ShowcaseConfigsService) {}

  @Get('key/:key')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 1000)
  @ApiOperation({ summary: 'دریافت تنظیمات ویترین فعال بر اساس کلید' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }
}

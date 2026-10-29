import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TorobAuthGuard } from './torob-auth.guard';
import { TorobOrdersQueryDto } from './dtos/torob-orders-query.dto';
import { TorobService } from './torob.service';
import { Public } from 'src/common/auth/auth.decorators';
import { SkipThrottle } from '@nestjs/throttler';

@Public()
@SkipThrottle()
@Controller('torob/v1/orders')
@UseGuards(TorobAuthGuard)
export class TorobController {
  constructor(private readonly torob: TorobService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() q: TorobOrdersQueryDto) {
    return await this.torob.listOrders(q.purchase_timestamp_gt, q.limit);
  }
}

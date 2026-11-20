import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, Roles } from 'src/common/auth/auth.decorators';
import { UserRole } from 'src/common/auth/jwt.types';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dtos/subscribe-newsletter.dto';
import { NewsletterQueryDto } from './dtos/newsletter-query.dto';
import { BroadcastCampaignDto } from './dtos/broadcast-campaign.dto';

@ApiTags('Newsletter')
@Controller(['newsletter', 'admin/newsletter'])
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Get()
  async findAll(@Query() query: NewsletterQueryDto) {
    return this.newsletterService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Get('stats')
  async getStats() {
    return this.newsletterService.getStats();
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  async broadcast(@Body() dto: BroadcastCampaignDto) {
    return this.newsletterService.broadcastCampaign(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Patch(':id/toggle')
  async toggle(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.toggleActive(id);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.delete(id);
  }
}

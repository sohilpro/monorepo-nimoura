import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from 'src/common/auth/auth.decorators';
import { UserRole } from 'src/common/auth/jwt.types';
import { TicketsService } from '../tickets.service';
import { ReplyTicketDto } from '../dtos/reply-ticket.dto';
import { UpdateTicketStatusDto } from '../dtos/update-ticket-status.dto';
import { TicketQueryDto } from '../dtos/ticket-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaStaticService } from 'src/modules/media/media-static.service';
import {
  MEDIA_OWNER_TYPE_MAX_SIZE,
  MediaOwnerType,
} from 'src/modules/media/enums/media-owner-type.enum';

@ApiTags('Admin - Tickets')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.OWNER)
@Controller('admin/tickets')
export class TicketsAdminController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly mediaService: MediaStaticService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'لیست تمام تیکت‌ها برای مدیریت' })
  async getAdminTickets(@Query() query: TicketQueryDto) {
    return await this.ticketsService.getAdminTickets(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'آمار وضعیت تیکت‌های پشتیبانی' })
  async getStats() {
    return await this.ticketsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'مشاهده تیکت و پیام‌ها توسط ادمین' })
  async getAdminTicketById(@Param('id', ParseIntPipe) ticketId: number) {
    return await this.ticketsService.getAdminTicketById(ticketId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'پاسخ پشتیبان به تیکت' })
  async replyAdmin(
    @CurrentUser('id') adminId: number,
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: ReplyTicketDto,
  ) {
    return await this.ticketsService.replyAdmin(adminId, ticketId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تغییر وضعیت یا اولویت تیکت' })
  async updateStatus(
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return await this.ticketsService.updateTicketStatus(ticketId, dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'آپلود فایل ضمیمه توسط ادمین' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MEDIA_OWNER_TYPE_MAX_SIZE[MediaOwnerType.TICKET_ATTACHMENT],
      },
    }),
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') adminId: number,
  ) {
    const uploaded = await this.mediaService.upload(file, {
      ownerType: MediaOwnerType.TICKET_ATTACHMENT,
      ownerId: `ticket_admin_${adminId}`,
    });

    return {
      url: uploaded.publicUrl,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'حذف تیکت پشتیبانی (فقط توسط مالک فروشگاه)' })
  async deleteTicket(@Param('id', ParseIntPipe) ticketId: number) {
    return await this.ticketsService.deleteTicket(ticketId);
  }
}

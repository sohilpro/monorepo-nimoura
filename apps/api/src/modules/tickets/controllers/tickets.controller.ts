import {
  Body,
  Controller,
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
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { TicketsService } from '../tickets.service';
import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { ContactMessageDto } from '../dtos/contact-message.dto';
import { ReplyTicketDto } from '../dtos/reply-ticket.dto';
import { TicketQueryDto } from '../dtos/ticket-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaStaticService } from 'src/modules/media/media-static.service';
import {
  MEDIA_OWNER_TYPE_MAX_SIZE,
  MediaOwnerType,
} from 'src/modules/media/enums/media-owner-type.enum';

@ApiTags('Store - Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly mediaService: MediaStaticService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'ثبت تیکت پشتیبانی جدید' })
  async createTicket(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateTicketDto,
  ) {
    return await this.ticketsService.createTicket(userId, dto);
  }

  @Public()
  @Post('contact')
  @ApiOperation({ summary: 'ثبت و ارسال پیام از فرم تماس با ما وب‌سایت' })
  async submitContact(
    @CurrentUser('id') userId: number | undefined,
    @Body() dto: ContactMessageDto,
  ) {
    return await this.ticketsService.submitContactMessage(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست تیکت‌های کاربر' })
  async getUserTickets(
    @CurrentUser('id') userId: number,
    @Query() query: TicketQueryDto,
  ) {
    return await this.ticketsService.getUserTickets(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'مشاهده جزئیات تیکت و پیام‌ها' })
  async getUserTicketById(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) ticketId: number,
  ) {
    return await this.ticketsService.getUserTicketById(userId, ticketId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'ارسال پاسخ به تیکت توسط کاربر' })
  async replyTicket(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: ReplyTicketDto,
  ) {
    return await this.ticketsService.replyUser(userId, ticketId, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'بستن تیکت توسط کاربر' })
  async closeTicket(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) ticketId: number,
  ) {
    return await this.ticketsService.closeTicketUser(userId, ticketId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'آپلود فایل ضمیمه تیکت' })
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
    @CurrentUser('id') userId: number,
  ) {
    const uploaded = await this.mediaService.upload(file, {
      ownerType: MediaOwnerType.TICKET_ATTACHMENT,
      ownerId: `ticket_user_${userId}`,
    });

    return {
      url: uploaded.publicUrl,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  }
}

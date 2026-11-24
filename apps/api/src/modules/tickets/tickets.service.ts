import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import {
  TicketAttachmentItem,
  TicketMessage,
} from './entities/ticket-message.entity';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { ReplyTicketDto } from './dtos/reply-ticket.dto';
import { UpdateTicketStatusDto } from './dtos/update-ticket-status.dto';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { ContactMessageDto } from './dtos/contact-message.dto';
import { TicketStatus } from './enums/ticket-status.enum';
import { TicketSenderRole } from './enums/ticket-sender-role.enum';
import { TicketPriority } from './enums/ticket-priority.enum';
import { TicketDepartment } from './enums/ticket-department.enum';
import { SmsService } from 'src/modules/payments/sms.service';
import { Users } from 'src/modules/users/entities/users.entity';
import { UserRole } from 'src/common/auth/jwt.types';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private readonly messageRepo: Repository<TicketMessage>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    private readonly dataSource: DataSource,
    private readonly smsService: SmsService,
  ) {}

  /**
   * تولید کد پیگیری یکتا برای تیکت به فرمت TK-XXXXXX
   */
  private async generateTrackingCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const code = `TK-${randomNum}`;
      const exists = await this.ticketRepo.findOne({
        where: { trackingCode: code },
        select: { id: true },
      });
      if (!exists) return code;
    }
    return `TK-${Date.now().toString().slice(-6)}`;
  }

  /**
   * ۱. ایجاد تیکت جدید توسط کاربر
   */
  async createTicket(userId: number, dto: CreateTicketDto): Promise<Ticket> {
    const trackingCode = await this.generateTrackingCode();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticket = queryRunner.manager.create(Ticket, {
        userId,
        trackingCode,
        title: dto.title.trim(),
        department: dto.department,
        priority: dto.priority || TicketPriority.MEDIUM,
        orderId: dto.orderId || null,
        status: TicketStatus.OPEN,
        lastReplyAt: new Date(),
        lastReplyBy: TicketSenderRole.USER,
        unreadUserCount: 0,
        unreadAdminCount: 1,
      });

      const savedTicket = await queryRunner.manager.save(Ticket, ticket);

      const message = queryRunner.manager.create(TicketMessage, {
        ticketId: savedTicket.id,
        senderId: userId,
        senderRole: TicketSenderRole.USER,
        message: dto.message.trim(),
        attachments: dto.attachments || [],
      });

      await queryRunner.manager.save(TicketMessage, message);
      await queryRunner.commitTransaction();

      return await this.getUserTicketById(userId, savedTicket.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create ticket', error);
      throw new BadRequestException('خطا در ثبت تیکت پشتیبانی');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ۲. دریافت تیکت‌های کاربر جاری (همراه با صفحه‌بندی)
   */
  async getUserTickets(
    userId: number,
    query: TicketQueryDto,
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.order', 'order')
      .where('ticket.userId = :userId', { userId });

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query.department) {
      qb.andWhere('ticket.department = :department', {
        department: query.department,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(ticket.title ILIKE :search OR ticket.trackingCode ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    qb.orderBy('ticket.lastReplyAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // برای هر تیکت آخرین پیام را اضافه می‌کنیم
    const ticketIds = items.map((t) => t.id);
    let latestMessagesMap: Record<number, string> = {};
    if (ticketIds.length > 0) {
      const messages = await this.messageRepo
        .createQueryBuilder('msg')
        .where('msg.ticketId IN (:...ticketIds)', { ticketIds })
        .orderBy('msg.id', 'DESC')
        .getMany();

      for (const msg of messages) {
        if (!latestMessagesMap[msg.ticketId]) {
          latestMessagesMap[msg.ticketId] = msg.message;
        }
      }
    }

    const formattedItems = items.map((ticket) => ({
      ...ticket,
      latestMessage: latestMessagesMap[ticket.id] || '',
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
    };
  }

  /**
   * ۳. مشاهده جزئیات تیکت و پیام‌ها توسط کاربر
   */
  async getUserTicketById(userId: number, ticketId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
      relations: {
        order: true,
        messages: {
          sender: true,
        },
      },
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت پشتیبانی یافت نشد');
    }

    // صفر کردن نشانگر پیام‌های خوانده‌نشده کاربر
    if (ticket.unreadUserCount > 0) {
      ticket.unreadUserCount = 0;
      await this.ticketRepo.update(ticket.id, { unreadUserCount: 0 });
    }

    return ticket;
  }

  /**
   * ۴. پاسخ کاربر به تیکت
   */
  async replyUser(
    userId: number,
    ticketId: number,
    dto: ReplyTicketDto,
  ): Promise<TicketMessage> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت مورد نظر یافت نشد');
    }

    const message = this.messageRepo.create({
      ticketId: ticket.id,
      senderId: userId,
      senderRole: TicketSenderRole.USER,
      message: dto.message.trim(),
      attachments: dto.attachments || [],
    });

    const savedMessage = await this.messageRepo.save(message);

    // به‌روزرسانی وضعیت تیکت: بازگشایی و ثبت زمان آخرین پاسخ
    await this.ticketRepo.update(ticket.id, {
      status: TicketStatus.OPEN,
      lastReplyAt: new Date(),
      lastReplyBy: TicketSenderRole.USER,
      unreadAdminCount: () => 'unread_admin_count + 1',
    });

    return savedMessage;
  }

  /**
   * ۵. بستن تیکت توسط کاربر
   */
  async closeTicketUser(userId: number, ticketId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت مورد نظر یافت نشد');
    }

    ticket.status = TicketStatus.CLOSED;
    ticket.lastReplyAt = new Date();
    ticket.lastReplyBy = TicketSenderRole.USER;
    await this.ticketRepo.save(ticket);

    return ticket;
  }

  /**
   * ۶. دریافت کل تیکت‌ها توسط ادمین (فیلترها، جستجو و آمار)
   */
  async getAdminTickets(
    query: TicketQueryDto,
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.order', 'order');

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('ticket.priority = :priority', { priority: query.priority });
    }
    if (query.department) {
      qb.andWhere('ticket.department = :department', {
        department: query.department,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(ticket.title ILIKE :search OR ticket.trackingCode ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.mobile ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    qb.orderBy('ticket.lastReplyAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // اضافه کردن آخرین پیام و تعداد سفارشات کاربر
    const ticketIds = items.map((t) => t.id);
    let latestMessagesMap: Record<number, string> = {};
    if (ticketIds.length > 0) {
      const messages = await this.messageRepo
        .createQueryBuilder('msg')
        .where('msg.ticketId IN (:...ticketIds)', { ticketIds })
        .orderBy('msg.id', 'DESC')
        .getMany();

      for (const msg of messages) {
        if (!latestMessagesMap[msg.ticketId]) {
          latestMessagesMap[msg.ticketId] = msg.message;
        }
      }
    }

    const formattedItems = items.map((ticket) => ({
      ...ticket,
      latestMessage: latestMessagesMap[ticket.id] || '',
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
    };
  }

  /**
   * ۷. مشاهده تیکت توسط ادمین و دریافت تاریخچه پیام‌ها
   */
  async getAdminTicketById(ticketId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: {
        user: true,
        order: true,
        messages: {
          sender: true,
        },
      },
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    // صفر کردن نشانگر پیام‌های خوانده‌نشده ادمین
    if (ticket.unreadAdminCount > 0) {
      ticket.unreadAdminCount = 0;
      await this.ticketRepo.update(ticket.id, { unreadAdminCount: 0 });
    }

    return ticket;
  }

  /**
   * ۸. پاسخ ادمین به تیکت
   */
  async replyAdmin(
    adminId: number,
    ticketId: number,
    dto: ReplyTicketDto,
  ): Promise<TicketMessage> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: {
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    const message = this.messageRepo.create({
      ticketId: ticket.id,
      senderId: adminId,
      senderRole: TicketSenderRole.ADMIN,
      message: dto.message.trim(),
      attachments: dto.attachments || [],
    });

    const savedMessage = await this.messageRepo.save(message);

    // وضعیت تیکت به «در انتظار پاسخ کاربر» تغییر می‌کند
    await this.ticketRepo.update(ticket.id, {
      status: TicketStatus.WAITING_USER,
      lastReplyAt: new Date(),
      lastReplyBy: TicketSenderRole.ADMIN,
      unreadUserCount: () => 'unread_user_count + 1',
    });

    return savedMessage;
  }

  /**
   * ۹. به‌روزرسانی وضعیت یا اولویت تیکت توسط ادمین
   */
  async updateTicketStatus(
    ticketId: number,
    dto: UpdateTicketStatusDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    ticket.status = dto.status;
    if (dto.priority) ticket.priority = dto.priority;
    if (dto.department) ticket.department = dto.department;

    await this.ticketRepo.save(ticket);
    return ticket;
  }

  /**
   * ۱۰. آمار تجمیعی تیکت‌ها جهت نمایش در داشبورد و بج‌های ادمین
   */
  async getStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    waitingUser: number;
    closed: number;
    today: number;
  }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, open, inProgress, waitingUser, closed, today] =
      await Promise.all([
        this.ticketRepo.count(),
        this.ticketRepo.count({ where: { status: TicketStatus.OPEN } }),
        this.ticketRepo.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        this.ticketRepo.count({ where: { status: TicketStatus.WAITING_USER } }),
        this.ticketRepo.count({ where: { status: TicketStatus.CLOSED } }),
        this.ticketRepo
          .createQueryBuilder('ticket')
          .where('ticket.createdAt >= :startOfToday', { startOfToday })
          .getCount(),
      ]);

    return {
      total,
      open,
      inProgress,
      waitingUser,
      closed,
      today,
    };
  }

  /**
   * ۱۱. حذف تیکت توسط مالک (فقط Owner)
   */
  async deleteTicket(ticketId: number): Promise<{ success: boolean; id: number; message: string }> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('تیکت پشتیبانی مورد نظر یافت نشد');
    }

    await this.ticketRepo.softRemove(ticket);
    return {
      success: true,
      id: ticketId,
      message: 'تیکت پشتیبانی با موفقیت حذف گردید',
    };
  }

  /**
   * ۱۲. ثبت پیام ارسالی از فرم تماس با ما و تبدیل آن به تیکت پشتیبانی ادمین
   */
  async submitContactMessage(
    dto: ContactMessageDto,
    userId?: number,
  ): Promise<{ success: boolean; trackingCode: string; message: string }> {
    const cleanMobile = dto.mobile.replace(/[\s\-\(\)]/g, '').trim();

    let targetUserId = userId;

    if (!targetUserId) {
      let user = await this.userRepo.findOne({
        where: { mobile: cleanMobile },
      });

      if (!user) {
        const nameParts = dto.name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'کاربر';
        const lastName = nameParts.slice(1).join(' ') || 'تماس با ما';

        user = this.userRepo.create({
          mobile: cleanMobile,
          first_name: firstName,
          last_name: lastName,
          email: dto.email?.trim() || undefined,
          role: UserRole.USER,
        });
        user = await this.userRepo.save(user);
      } else if (!user.first_name && dto.name) {
        const nameParts = dto.name.trim().split(/\s+/);
        user.first_name = nameParts[0];
        user.last_name = nameParts.slice(1).join(' ') || undefined;
        await this.userRepo.save(user);
      }

      targetUserId = user.id;
    }

    const subjectMap: Record<
      string,
      { dept: TicketDepartment; label: string; priority: TicketPriority }
    > = {
      skincare: {
        dept: TicketDepartment.SALES,
        label: 'مشاوره روتین پوستی و زیبایی',
        priority: TicketPriority.MEDIUM,
      },
      order: {
        dept: TicketDepartment.ORDERS,
        label: 'پیگیری وضعیت سفارش',
        priority: TicketPriority.HIGH,
      },
      return: {
        dept: TicketDepartment.ORDERS,
        label: 'درخواست مرجوعی و گارانتی',
        priority: TicketPriority.HIGH,
      },
      complaint: {
        dept: TicketDepartment.GENERAL,
        label: 'انتقادات و شکایات',
        priority: TicketPriority.HIGH,
      },
      b2b: {
        dept: TicketDepartment.SALES,
        label: 'همکاری تجاری و تامین کالا',
        priority: TicketPriority.MEDIUM,
      },
      other: {
        dept: TicketDepartment.GENERAL,
        label: 'پیام عمومی',
        priority: TicketPriority.MEDIUM,
      },
    };

    const mapped = subjectMap[dto.subject] || {
      dept: TicketDepartment.GENERAL,
      label: dto.subject,
      priority: TicketPriority.MEDIUM,
    };

    const trackingCode = await this.generateTrackingCode();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticket = queryRunner.manager.create(Ticket, {
        userId: targetUserId,
        trackingCode,
        title: `[فرم تماس] ${mapped.label} - ${dto.name}`,
        department: mapped.dept,
        priority: mapped.priority,
        status: TicketStatus.OPEN,
        lastReplyAt: new Date(),
        lastReplyBy: TicketSenderRole.USER,
        unreadUserCount: 0,
        unreadAdminCount: 1,
      });

      const savedTicket = await queryRunner.manager.save(Ticket, ticket);

      const messageContent = [
        '📋 پیام ارسالی از فرم تماس با ما وب‌سایت نیمورا:',
        `👤 فرستنده: ${dto.name}`,
        `📱 شماره همراه: ${cleanMobile}`,
        dto.email ? `✉️ ایمیل: ${dto.email}` : null,
        dto.orderId ? `📦 شماره سفارش پیوست: ${dto.orderId}` : null,
        `📌 موضوع: ${mapped.label}`,
        '────────────────────────────────────────',
        dto.message.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      const message = queryRunner.manager.create(TicketMessage, {
        ticketId: savedTicket.id,
        senderId: targetUserId,
        senderRole: TicketSenderRole.USER,
        message: messageContent,
        attachments: [],
      });

      await queryRunner.manager.save(TicketMessage, message);
      await queryRunner.commitTransaction();

      this.logger.log(
        `New contact ticket created: ${trackingCode} by ${dto.name} (${cleanMobile})`,
      );

      return {
        success: true,
        trackingCode,
        message: 'پیام شما با موفقیت برای کارشناسان نیمورا ارسال شد و در صف بررسی قرار گرفت.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to submit contact ticket', error);
      throw new BadRequestException('خطا در ثبت پیام تماس با ما');
    } finally {
      await queryRunner.release();
    }
  }
}

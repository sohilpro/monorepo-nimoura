import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService } from '../../../src/modules/tickets/tickets.service';
import { TicketStatus } from '../../../src/modules/tickets/enums/ticket-status.enum';
import { TicketDepartment } from '../../../src/modules/tickets/enums/ticket-department.enum';
import { TicketPriority } from '../../../src/modules/tickets/enums/ticket-priority.enum';
import { TicketSenderRole } from '../../../src/modules/tickets/enums/ticket-sender-role.enum';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepo: any;
  let messageRepo: any;
  let userRepo: any;
  let dataSource: any;
  let smsService: any;

  beforeEach(() => {
    ticketRepo = {
      findOne: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      createQueryBuilder: vi.fn(),
    };
    messageRepo = {
      create: vi.fn((dto) => dto),
      save: vi.fn((msg) => Promise.resolve({ id: 1, ...msg })),
      createQueryBuilder: vi.fn(),
    };
    userRepo = {
      findOne: vi.fn(),
    };
    dataSource = {
      createQueryRunner: vi.fn(),
    };
    smsService = {
      sendPattern: vi.fn(),
    };

    service = new TicketsService(
      ticketRepo,
      messageRepo,
      userRepo,
      dataSource,
      smsService,
    );
  });

  it('should reply as user and update ticket to open', async () => {
    const existingTicket = {
      id: 12,
      userId: 1,
      status: TicketStatus.WAITING_USER,
      unreadAdminCount: 0,
    };
    ticketRepo.findOne.mockResolvedValue(existingTicket);
    ticketRepo.update.mockResolvedValue({ affected: 1 });

    const replyDto = {
      message: 'سلام، این پاسخ من است.',
    };

    const res = await service.replyUser(1, 12, replyDto);

    expect(messageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: 12,
        senderId: 1,
        senderRole: TicketSenderRole.USER,
        message: 'سلام، این پاسخ من است.',
      }),
    );
    expect(ticketRepo.update).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        status: TicketStatus.OPEN,
        lastReplyBy: TicketSenderRole.USER,
      }),
    );
    expect(res.message).toBe('سلام، این پاسخ من است.');
  });

  it('should reply as admin and update ticket to waiting_user', async () => {
    const existingTicket = {
      id: 15,
      userId: 2,
      status: TicketStatus.OPEN,
      unreadUserCount: 0,
      user: { id: 2, mobile: '09120000000' },
    };
    ticketRepo.findOne.mockResolvedValue(existingTicket);
    ticketRepo.update.mockResolvedValue({ affected: 1 });

    const replyDto = {
      message: 'درود، سفارش شما پیگیری شد.',
    };

    const res = await service.replyAdmin(99, 15, replyDto);

    expect(messageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: 15,
        senderId: 99,
        senderRole: TicketSenderRole.ADMIN,
        message: 'درود، سفارش شما پیگیری شد.',
      }),
    );
    expect(ticketRepo.update).toHaveBeenCalledWith(
      15,
      expect.objectContaining({
        status: TicketStatus.WAITING_USER,
        lastReplyBy: TicketSenderRole.ADMIN,
      }),
    );
    expect(res.message).toBe('درود، سفارش شما پیگیری شد.');
  });

  it('should close ticket by user', async () => {
    const existingTicket = {
      id: 20,
      userId: 5,
      status: TicketStatus.OPEN,
    };
    ticketRepo.findOne.mockResolvedValue(existingTicket);
    ticketRepo.save.mockImplementation((t: any) => Promise.resolve(t));

    const res = await service.closeTicketUser(5, 20);

    expect(res.status).toBe(TicketStatus.CLOSED);
    expect(ticketRepo.save).toHaveBeenCalled();
  });

  it('should calculate stats properly', async () => {
    ticketRepo.count
      .mockResolvedValueOnce(50) // total
      .mockResolvedValueOnce(10) // open
      .mockResolvedValueOnce(8) // inProgress
      .mockResolvedValueOnce(12) // waitingUser
      .mockResolvedValueOnce(20); // closed

    const qbMock = {
      where: vi.fn().mockReturnThis(),
      getCount: vi.fn().mockResolvedValue(5),
    };
    ticketRepo.createQueryBuilder.mockReturnValue(qbMock);

    const stats = await service.getStats();

    expect(stats.total).toBe(50);
    expect(stats.open).toBe(10);
    expect(stats.inProgress).toBe(8);
    expect(stats.waitingUser).toBe(12);
    expect(stats.closed).toBe(20);
    expect(stats.today).toBe(5);
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { LoyaltyLedger } from './entities/loyalty-ledger.entity';
import { LoyaltyVisit } from './entities/loyalty-visit.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyWithdrawal } from './entities/loyalty-withdrawal.entity';
import { Referral } from './entities/referral.entity';
import { LoyaltyLedgerType } from './enums/loyalty-ledger-type.enum';
import { LoyaltyWithdrawalStatus } from './enums/loyalty-withdrawal-status.enum';
import { ReferralStatus } from './enums/referral-status.enum';
import { UpdateLoyaltySettingsDto } from './dtos/update-loyalty-settings.dto';
import { CreateWithdrawalDto } from './dtos/create-withdrawal.dto';
import { LoyaltyLedgerQueryDto } from './dtos/loyalty-ledger-query.dto';
import {
  AdminReferralItemDto,
  ReferralInfoResponseDto,
} from './dtos/referral.dto';
import {
  LoyaltyLedgerItemDto,
  LoyaltyStatsResponseDto,
  LoyaltySummaryResponseDto,
  LoyaltyWithdrawalItemDto,
} from './dtos/loyalty-response.dto';
import { Users } from 'src/modules/users/entities/users.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { PAID_STATUSES } from 'src/modules/orders/constants/order.constant';
import { SmsService } from 'src/modules/payments/sms.service';
import { Promotions, PromotionType } from 'src/modules/promotions/entities/promotion.entity';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyLedger)
    private readonly ledger: Repository<LoyaltyLedger>,
    @InjectRepository(LoyaltyVisit)
    private readonly visits: Repository<LoyaltyVisit>,
    @InjectRepository(LoyaltySettings)
    private readonly settings: Repository<LoyaltySettings>,
    @InjectRepository(LoyaltyWithdrawal)
    private readonly withdrawals: Repository<LoyaltyWithdrawal>,
    @InjectRepository(Referral)
    private readonly referrals: Repository<Referral>,
    private readonly smsService: SmsService,
    private readonly dataSource: DataSource,
  ) {}

  // ===========================================================================
  // تنظیمات (Settings)
  // ===========================================================================

  async getSettings(): Promise<LoyaltySettings> {
    let s = await this.settings.findOne({ where: { id: 1 } });
    if (!s) {
      try {
        s = await this.settings.save(
          this.settings.create({
            id: 1,
            enabled: true,
            weeklyReward: 15000,
            cashbackMinOrder: 2000000,
            cashbackAmount: 100000,
            cashbackEnabled: true,
            autoRedeem: true,
            referralEnabled: true,
            referralRewardAmount: 50000,
            referralDiscountAmount: 50000,
            referralMinOrder: 150000,
          }),
        );
      } catch {
        s = await this.settings.findOne({ where: { id: 1 } });
        if (!s) {
          s = await this.settings.findOne({ where: {} });
        }
      }
    }
    return s!;
  }

  async updateSettings(dto: UpdateLoyaltySettingsDto): Promise<LoyaltySettings> {
    const s = await this.getSettings();
    Object.assign(s, dto);
    return this.settings.save(s);
  }

  // ===========================================================================
  // محاسبه تاریخ و هفته با افست تهران (Asia/Tehran - شنبه تا جمعه)
  // ===========================================================================

  getTehranDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  getTehranWeekKey(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let year = 0;
    let month = 0;
    let day = 0;
    let weekdayStr = '';
    for (const p of parts) {
      if (p.type === 'year') year = Number(p.value);
      if (p.type === 'month') month = Number(p.value);
      if (p.type === 'day') day = Number(p.value);
      if (p.type === 'weekday') weekdayStr = p.value;
    }

    const weekdayMap: Record<string, number> = {
      Sat: 0,
      Sun: 1,
      Mon: 2,
      Tue: 3,
      Wed: 4,
      Thu: 5,
      Fri: 6,
    };
    const daysSinceSaturday = weekdayMap[weekdayStr] ?? 0;

    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - daysSinceSaturday);
    return d.toISOString().slice(0, 10);
  }

  // ===========================================================================
  // موجودی و خلاصه (Balance & Summary)
  // ===========================================================================

  async balance(userId: number, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(LoyaltyLedger) : this.ledger;
    const row = await repo
      .createQueryBuilder('l')
      .select('COALESCE(SUM(l.amount), 0)', 'balance')
      .where('l.user_id = :userId', { userId })
      .getRawOne();
    return Math.max(0, Number(row?.balance ?? 0));
  }

  async getStatus(userId: number): Promise<LoyaltySummaryResponseDto> {
    const now = new Date();
    const weekKey = this.getTehranWeekKey(now);

    const weekVisits = await this.visits.find({
      where: { userId, weekKey },
      select: { calendarDate: true },
      order: { calendarDate: 'ASC' },
    });
    const weeklyVisitDates = weekVisits.map((v) => v.calendarDate);
    const days = weeklyVisitDates.length;
    const settings = await this.getSettings();

    return {
      balance: await this.balance(userId),
      weeklyVisitCount: days,
      weeklyVisitDates,
      weekCompleted: days >= 7,
      weeklyReward: Number(settings.weeklyReward),
      cashbackMinOrder: Number(settings.cashbackMinOrder),
      cashbackAmount: Number(settings.cashbackAmount),
      enabled: settings.enabled,
      cashbackEnabled: settings.cashbackEnabled,
      autoRedeem: settings.autoRedeem,
    };
  }

  // ===========================================================================
  // ثبت حضور روزانه (Check-in)
  // ===========================================================================

  async checkIn(userId: number) {
    const now = new Date();
    const calendarDate = this.getTehranDateString(now);
    const weekKey = this.getTehranWeekKey(now);

    const existing = await this.visits.findOne({
      where: { userId, calendarDate },
    });

    if (!existing) {
      try {
        await this.visits.insert({ userId, calendarDate, weekKey });
      } catch (err: any) {
        if (err?.code !== '23505') {
          throw err;
        }
      }
    }

    const weekVisits = await this.visits.find({
      where: { userId, weekKey },
      select: { calendarDate: true },
      order: { calendarDate: 'ASC' },
    });
    const weeklyVisitDates = weekVisits.map((v) => v.calendarDate);
    const days = weeklyVisitDates.length;

    let reward = 0;
    if (days >= 7) {
      const key = `weekly:${userId}:${weekKey}`;
      const existingReward = await this.ledger.findOne({
        where: { idempotencyKey: key },
      });
      if (!existingReward) {
        const s = await this.getSettings();
        if (s.enabled && Number(s.weeklyReward) > 0) {
          reward = Number(s.weeklyReward);
          await this.ledger.insert({
            userId,
            amount: reward,
            type: LoyaltyLedgerType.WEEKLY_VISIT_REWARD,
            description: `پاداش هفتگی تکمیل ۷ روز بازدید (${weekKey})`,
            idempotencyKey: key,
          });
        }
      }
    }

    const s = await this.getSettings();
    return {
      calendarDate,
      weekKey,
      days,
      weeklyVisitCount: days,
      weeklyVisitDates,
      completed: days >= 7,
      weekCompleted: days >= 7,
      reward,
      weeklyReward: Number(s.weeklyReward),
      balance: await this.balance(userId),
    };
  }

  // ===========================================================================
  // مصرف اعتبار سفارش (Redeem) با قفل اتمیک و جلوگیری از خرج هم‌زمان
  // ===========================================================================

  async redeemForOrder(
    userId: number,
    orderId: number,
    total: number,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager ?? this.dataSource.manager;
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.autoRedeem) return 0;

    await em.query('SELECT pg_advisory_xact_lock($1)', [userId]);

    const existing = await em.getRepository(LoyaltyLedger).findOne({
      where: { idempotencyKey: `order-redemption:${orderId}` },
    });
    if (existing) return Math.max(0, -Number(existing.amount));

    const currentBalance = await this.balance(userId, em);
    const amount = Math.min(currentBalance, Math.max(0, Math.floor(total)));
    if (amount <= 0) return 0;

    await em.getRepository(LoyaltyLedger).insert({
      userId,
      amount: -amount,
      type: LoyaltyLedgerType.ORDER_REDEMPTION,
      orderId,
      description: `کسر خودکار اعتبار باشگاه مشتریان برای سفارش #${orderId}`,
      idempotencyKey: `order-redemption:${orderId}`,
    });

    return amount;
  }

  // ===========================================================================
  // آزادسازی اعتبار سفارش لغو یا منقضی شده (Release / Refund)
  // ===========================================================================

  async releaseForOrder(
    userId: number,
    orderId: number,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager ?? this.dataSource.manager;
    const redemptionKey = `order-redemption:${orderId}`;
    const refundKey = `order-redemption-refund:${orderId}`;

    const existingRefund = await em.getRepository(LoyaltyLedger).findOne({
      where: { idempotencyKey: refundKey },
    });
    if (existingRefund) return Number(existingRefund.amount);

    const redemption = await em.getRepository(LoyaltyLedger).findOne({
      where: { idempotencyKey: redemptionKey },
    });
    if (!redemption) return 0;

    const amount = Math.abs(Number(redemption.amount));
    if (amount <= 0) return 0;

    await em.getRepository(LoyaltyLedger).insert({
      userId,
      amount,
      type: LoyaltyLedgerType.ORDER_REDEMPTION_REFUND,
      orderId,
      description: `استرداد اعتبار سفارش لغو شده #${orderId}`,
      idempotencyKey: refundKey,
    });

    return amount;
  }

  // ===========================================================================
  // اعطای پاداش نقدی (Cashback)
  // ===========================================================================

  async awardCashback(
    userId: number,
    orderId: number,
    eligibleTotal: number,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager ?? this.dataSource.manager;
    const settings = await this.getSettings();
    if (
      !settings.enabled ||
      !settings.cashbackEnabled ||
      eligibleTotal < Number(settings.cashbackMinOrder)
    ) {
      return 0;
    }

    const key = `cashback:${orderId}`;
    const existing = await em.getRepository(LoyaltyLedger).findOne({
      where: { idempotencyKey: key },
    });
    if (existing) return Number(existing.amount);

    const amount = Number(settings.cashbackAmount);
    if (!amount || amount <= 0) return 0;

    await em.getRepository(LoyaltyLedger).insert({
      userId,
      amount,
      type: LoyaltyLedgerType.CASHBACK,
      orderId,
      description: `پاداش نقدی (کش‌بک) سفارش پرداخت‌شده #${orderId}`,
      idempotencyKey: key,
    });

    return amount;
  }

  // ===========================================================================
  // تنظیم دستی اعتبار توسط ادمین (Manual Adjustment)
  // ===========================================================================

  async adjustment(
    userId: number,
    amount: number,
    description: string,
    adminId: number,
    clientKey?: string,
  ) {
    return await this.dataSource.transaction(async (em) => {
      await em.query('SELECT pg_advisory_xact_lock($1)', [userId]);

      const currentBalance = await this.balance(userId, em);
      if (amount < 0 && currentBalance + amount < 0) {
        throw new BadRequestException(
          `موجودی کاربر کافی نیست (موجودی فعلی: ${currentBalance.toLocaleString('fa-IR')} تومان)`,
        );
      }

      const idempotencyKey =
        clientKey?.trim() ||
        `manual:${adminId}:${userId}:${Date.now()}:${randomBytes(4).toString('hex')}`;

      const record = em.create(LoyaltyLedger, {
        userId,
        amount,
        type: LoyaltyLedgerType.MANUAL_ADJUSTMENT,
        description: description.trim(),
        idempotencyKey,
      });

      return await em.save(LoyaltyLedger, record);
    });
  }

  // ===========================================================================
  // درخواست برداشت / تسویه توسط کاربر (Withdrawal Request)
  // ===========================================================================

  async requestWithdrawal(
    userId: number,
    dto: CreateWithdrawalDto,
  ): Promise<LoyaltyWithdrawal> {
    return await this.dataSource.transaction(async (em) => {
      await em.query('SELECT pg_advisory_xact_lock($1)', [userId]);

      const currentBalance = await this.balance(userId, em);
      if (currentBalance < dto.amount) {
        throw new BadRequestException(
          `موجودی اعتبار شما کافی نیست. موجودی قابل برداشت: ${currentBalance.toLocaleString('fa-IR')} تومان`,
        );
      }

      const withdrawal = em.create(LoyaltyWithdrawal, {
        userId,
        amount: dto.amount,
        iban: dto.iban.trim(),
        cardNumber: dto.cardNumber?.trim() || undefined,
        accountHolderName: dto.accountHolderName.trim(),
        status: LoyaltyWithdrawalStatus.PENDING,
      });
      const savedWithdrawal = await em.save(LoyaltyWithdrawal, withdrawal);

      const key = `withdrawal:${savedWithdrawal.id}`;
      await em.getRepository(LoyaltyLedger).insert({
        userId,
        amount: -dto.amount,
        type: LoyaltyLedgerType.WITHDRAWAL,
        description: `درخواست برداشت اعتبار به شبا ${dto.iban} (کد پیگیری #${savedWithdrawal.id})`,
        idempotencyKey: key,
      });

      return savedWithdrawal;
    });
  }

  async getUserWithdrawals(userId: number): Promise<LoyaltyWithdrawalItemDto[]> {
    const list = await this.withdrawals.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return list.map((w) => ({
      id: w.id,
      userId: w.userId,
      amount: Number(w.amount),
      iban: w.iban,
      cardNumber: w.cardNumber,
      accountHolderName: w.accountHolderName,
      status: w.status,
      adminNote: w.adminNote,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
      processedByAdminId: w.processedByAdminId,
    }));
  }

  // ===========================================================================
  // بررسی درخواست برداشت توسط ادمین (Admin Process Withdrawal)
  // ===========================================================================

  async processWithdrawalAdmin(
    withdrawalId: number,
    status: LoyaltyWithdrawalStatus,
    adminId: number,
    adminNote?: string,
  ): Promise<LoyaltyWithdrawal> {
    return await this.dataSource.transaction(async (em) => {
      const withdrawal = await em.findOne(LoyaltyWithdrawal, {
        where: { id: withdrawalId },
      });
      if (!withdrawal) {
        throw new NotFoundException('درخواست برداشت یافت نشد');
      }
      if (withdrawal.status !== LoyaltyWithdrawalStatus.PENDING) {
        throw new BadRequestException('این درخواست قبلاً تعیین تکلیف شده است');
      }

      await em.query('SELECT pg_advisory_xact_lock($1)', [withdrawal.userId]);

      withdrawal.status = status;
      withdrawal.processedAt = new Date();
      withdrawal.processedByAdminId = adminId;
      if (adminNote) withdrawal.adminNote = adminNote.trim();

      // در صورت رد درخواست، مبلغ فوراً به اعتبار کاربر بازگردانده می‌شود
      if (status === LoyaltyWithdrawalStatus.REJECTED) {
        const refundKey = `withdrawal-refund:${withdrawal.id}`;
        await em.getRepository(LoyaltyLedger).insert({
          userId: withdrawal.userId,
          amount: Number(withdrawal.amount),
          type: LoyaltyLedgerType.WITHDRAWAL_REFUND,
          description: `بازگشت اعتبار به دلیل رد درخواست برداشت #${withdrawal.id}${adminNote ? ` (${adminNote})` : ''}`,
          idempotencyKey: refundKey,
        });
      }

      return await em.save(LoyaltyWithdrawal, withdrawal);
    });
  }

  // ===========================================================================
  // تاریخچه تراکنش‌ها (Ledger History) با Pagination
  // ===========================================================================

  async history(userId: number, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const [items, total] = await this.ledger.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      items: items.map((i) => ({
        id: i.id,
        userId: i.userId,
        amount: Number(i.amount),
        type: i.type,
        description: i.description,
        orderId: i.orderId,
        idempotencyKey: i.idempotencyKey,
        createdAt: i.createdAt,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  // ===========================================================================
  // گزارش‌ها و ابزارهای ادمین (Admin Services)
  // ===========================================================================

  async getAdminLedger(query: LoyaltyLedgerQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100);

    const qb = this.ledger
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'u')
      .orderBy('l.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.type) {
      qb.andWhere('l.type = :type', { type: query.type });
    }
    if (query.userId) {
      qb.andWhere('l.userId = :userId', { userId: query.userId });
    }
    if (query.search?.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere(
        '(l.description ILIKE :s OR u.mobile ILIKE :s OR u.email ILIKE :s OR u.first_name ILIKE :s OR u.last_name ILIKE :s)',
        { s },
      );
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map(
        (i): LoyaltyLedgerItemDto => ({
          id: i.id,
          userId: i.userId,
          amount: Number(i.amount),
          type: i.type,
          description: i.description ?? undefined,
          orderId: i.orderId ?? undefined,
          idempotencyKey: i.idempotencyKey,
          createdAt: i.createdAt,
          user: i.user
            ? {
                id: i.user.id,
                firstName: i.user.first_name,
                lastName: i.user.last_name,
                mobile: i.user.mobile,
              }
            : undefined,
        }),
      ),
      total,
      page,
      limit,
    };
  }

  async getAdminStats(): Promise<LoyaltyStatsResponseDto> {
    const issuedRow = await this.ledger
      .createQueryBuilder('l')
      .select('COALESCE(SUM(l.amount), 0)', 'total')
      .where('l.amount > 0')
      .getRawOne();

    const redeemedRow = await this.ledger
      .createQueryBuilder('l')
      .select('COALESCE(SUM(ABS(l.amount)), 0)', 'total')
      .where('l.amount < 0')
      .getRawOne();

    const netRow = await this.ledger
      .createQueryBuilder('l')
      .select('COALESCE(SUM(l.amount), 0)', 'total')
      .getRawOne();

    const currentWeek = this.getTehranWeekKey(new Date());
    const activeUsersRow = await this.visits
      .createQueryBuilder('v')
      .select('COUNT(DISTINCT v.user_id)', 'count')
      .where('v.week_key = :currentWeek', { currentWeek })
      .getRawOne();

    return {
      totalCreditIssued: Number(issuedRow?.total ?? 0),
      totalCreditRedeemed: Number(redeemedRow?.total ?? 0),
      remainingBalance: Math.max(0, Number(netRow?.total ?? 0)),
      activeUsersThisWeek: Number(activeUsersRow?.count ?? 0),
    };
  }

  async getAdminWithdrawals(
    status?: LoyaltyWithdrawalStatus,
    page = 1,
    limit = 20,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const qb = this.withdrawals
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.user', 'u')
      .orderBy('w.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (status) {
      qb.andWhere('w.status = :status', { status });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map(
        (w): LoyaltyWithdrawalItemDto => ({
          id: w.id,
          userId: w.userId,
          amount: Number(w.amount),
          iban: w.iban,
          cardNumber: w.cardNumber,
          accountHolderName: w.accountHolderName,
          status: w.status,
          adminNote: w.adminNote,
          createdAt: w.createdAt,
          processedAt: w.processedAt,
          processedByAdminId: w.processedByAdminId,
          user: w.user
            ? {
                id: w.user.id,
                firstName: w.user.first_name,
                lastName: w.user.last_name,
                mobile: w.user.mobile,
              }
            : undefined,
        }),
      ),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async searchUsersForAdjustment(query: string) {
    if (!query?.trim()) return [];
    const s = `%${query.trim()}%`;
    const users = await this.dataSource
      .getRepository(Users)
      .createQueryBuilder('u')
      .select(['u.id', 'u.first_name', 'u.last_name', 'u.mobile'])
      .where(
        'u.mobile ILIKE :s OR u.email ILIKE :s OR u.first_name ILIKE :s OR u.last_name ILIKE :s',
        { s },
      )
      .take(10)
      .getMany();

    const results: Array<{
      id: number;
      firstName?: string;
      lastName?: string;
      mobile?: string;
      balance: number;
    }> = [];
    for (const user of users) {
      const userBalance = await this.balance(user.id);
      results.push({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        mobile: user.mobile,
        balance: userBalance,
      });
    }
    return results;
  }

  // ===========================================================================
  // سیستم رفرال و دعوت از دوستان (Referral System)
  // ===========================================================================

  async getOrCreateUserReferralCode(userId: number): Promise<string> {
    const userRepo = this.dataSource.getRepository(Users);
    const user = await userRepo.findOne({
      where: { id: userId },
      select: { id: true, referral_code: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.referral_code?.trim()) {
      return user.referral_code;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = `REF-${randomBytes(3).toString('hex').toUpperCase()}`;
      const exists = await userRepo.count({ where: { referral_code: code } });
      if (exists === 0) {
        user.referral_code = code;
        await userRepo.update(user.id, { referral_code: code });
        return code;
      }
    }
    const fallbackCode = `REF-${userId}${randomBytes(2).toString('hex').toUpperCase()}`;
    await userRepo.update(user.id, { referral_code: fallbackCode });
    return fallbackCode;
  }

  async getReferralInfo(userId: number): Promise<ReferralInfoResponseDto> {
    const referralCode = await this.getOrCreateUserReferralCode(userId);
    const settings = await this.getSettings();

    const baseUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
    const referralLink = baseUrl
      ? `${baseUrl}/auth?ref=${referralCode}`
      : `/auth?ref=${referralCode}`;

    const totalInvited = await this.referrals.count({
      where: { referrerId: userId },
    });

    const successfulOrders = await this.referrals.count({
      where: { referrerId: userId, status: ReferralStatus.COMPLETED },
    });

    const rewardSumRow = await this.ledger
      .createQueryBuilder('l')
      .select('COALESCE(SUM(l.amount), 0)', 'total')
      .where('l.user_id = :userId', { userId })
      .andWhere('l.type = :type', { type: LoyaltyLedgerType.REFERRAL_REWARD })
      .getRawOne();

    const friendsList = await this.referrals.find({
      where: { referrerId: userId },
      relations: { referredUser: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const friends = friendsList.map((f) => {
      const mobile = f.referredUser?.mobile || '';
      const masked =
        mobile.length >= 10
          ? `${mobile.slice(0, 4)}***${mobile.slice(-3)}`
          : mobile || 'کاربر جدید';

      return {
        id: f.id,
        mobileMasked: masked,
        firstName: f.referredUser?.first_name ?? undefined,
        status: f.status,
        rewardAmount: Number(f.discountAmount || f.rewardAmount),
        discountCode: f.discountCode,
        createdAt: f.createdAt,
        completedAt: f.completedAt ?? undefined,
      };
    });

    const completedInvites = friendsList.filter(
      (f) => f.status === ReferralStatus.COMPLETED,
    ).length;
    const totalDiscountEarned =
      completedInvites * Number(settings.referralDiscountAmount || 50000);

    return {
      referralCode,
      referralLink,
      discountAmount: Number(settings.referralDiscountAmount),
      rewardAmount: Number(settings.referralRewardAmount),
      minOrderAmount: Number(settings.referralMinOrder),
      totalInvited,
      successfulOrders: completedInvites,
      totalEarned: totalDiscountEarned,
      friends,
    };
  }

  async registerReferral(
    referralCode: string,
    newUserId: number,
  ): Promise<Referral | null> {
    if (!referralCode?.trim()) return null;
    const cleanCode = referralCode.trim().toUpperCase();

    const userRepo = this.dataSource.getRepository(Users);
    const referrer = await userRepo.findOne({
      where: { referral_code: cleanCode },
      select: { id: true, referral_code: true, mobile: true, first_name: true, last_name: true },
    });

    if (!referrer || referrer.id === newUserId) {
      return null;
    }

    const newUser = await userRepo.findOne({
      where: { id: newUserId },
      select: { id: true, referred_by_id: true, mobile: true, first_name: true, last_name: true },
    });
    if (!newUser || newUser.referred_by_id) {
      return null;
    }

    const settings = await this.getSettings();
    if (!settings.enabled || !settings.referralEnabled) {
      return null;
    }

    return await this.dataSource.transaction(async (em) => {
      // قفل کاربر معرف جهت جلوگیری از فراخوانی‌های همزمان
      await em.query('SELECT pg_advisory_xact_lock($1)', [referrer.id]);

      const existing = await em.getRepository(Referral).findOne({
        where: { referredUserId: newUserId },
      });
      if (existing) return existing;

      await em.getRepository(Users).update(newUserId, { referred_by_id: referrer.id });

      const friendCreditAmount = Number(settings.referralRewardAmount || 50000);
      const inviterDiscountAmount = Number(settings.referralDiscountAmount || 50000);
      const minOrderAmount = Number(settings.referralMinOrder || 150000);

      // ۱. شارژ ۵۰٬۰۰۰ تومان اعتبار باشگاه مشتریان برای دوست دعوت‌شده (کاربر جدید)
      const friendIdempotencyKey = `ref-welcome-credit:${newUserId}`;
      const existingLedger = await em.getRepository(LoyaltyLedger).findOne({
        where: { idempotencyKey: friendIdempotencyKey },
      });
      if (!existingLedger) {
        await em.getRepository(LoyaltyLedger).insert({
          userId: newUserId,
          amount: friendCreditAmount,
          type: LoyaltyLedgerType.REFERRAL_REWARD,
          description: 'اعتبار هدیه ثبت‌نام با کد معرف دوست',
          idempotencyKey: friendIdempotencyKey,
        });
      }

      // ۲. ایجاد کد تخفیف اختصاصی ۵۰٬۰۰۰ تومانی برای معرف (کاربری که دعوت کرده)
      const promoSuffix = randomBytes(3).toString('hex').toUpperCase();
      const generatedPromoCode = `REF50-${promoSuffix}`;

      const promoRepo = em.getRepository(Promotions);
      const promo = promoRepo.create({
        title: 'کد تخفیف پاداش دعوت از دوست',
        description: `کد تخفیف اختصاصی ۵۰ هزار تومانی بابت دعوت موفق کاربر #${newUserId}`,
        type: PromotionType.FIXED,
        amount: inviterDiscountAmount,
        promoCode: generatedPromoCode,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // ۶ ماه اعتبار
        isActive: true,
        isPublic: false,
        maxTotalUses: 1,
        maxUsesPerUser: 1,
        minOrderAmount: minOrderAmount,
        allowedUsers: [{ id: referrer.id } as Users],
      });
      const savedPromo = await promoRepo.save(promo);

      // ۳. ثبت رفرال با وضعیت COMPLETED و ذخیره کد تخفیف صادرشده
      const referral = em.getRepository(Referral).create({
        referrerId: referrer.id,
        referredUserId: newUserId,
        referralCode: cleanCode,
        discountCode: generatedPromoCode,
        promotionId: savedPromo.id,
        status: ReferralStatus.COMPLETED,
        rewardAmount: friendCreditAmount,
        discountAmount: inviterDiscountAmount,
        completedAt: new Date(),
      });
      const savedReferral = await em.getRepository(Referral).save(referral);

      // ۴. ارسال پیامک به معرف شامل کد تخفیف ۵۰ هزار تومانی
      if (referrer.mobile) {
        this.smsService
          .sendReferralSuccessViaMeliSms(referrer.mobile, generatedPromoCode)
          .catch(() => null);
      }

      return savedReferral;
    });
  }

  async validateReferralCodeForOrder(
    code: string,
    userId: number,
    subtotal: number,
  ) {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.referralEnabled) {
      throw new BadRequestException('سیستم معرفی در حال حاضر غیرفعال است');
    }

    const cleanCode = code.trim().toUpperCase();
    const userRepo = this.dataSource.getRepository(Users);
    const referrer = await userRepo.findOne({
      where: { referral_code: cleanCode },
      select: { id: true, referral_code: true },
    });

    if (!referrer) {
      throw new BadRequestException('کد معرف نامعتبر است');
    }
    if (referrer.id === userId) {
      throw new BadRequestException('نمی‌توانید از کد معرف خودتان استفاده کنید');
    }

    const minOrder = Number(settings.referralMinOrder);
    if (subtotal < minOrder) {
      throw new BadRequestException(
        `حداقل مبلغ سفارش برای استفاده از این کد ${minOrder.toLocaleString('fa-IR')} تومان است`,
      );
    }

    const paidOrdersCount = await this.dataSource.getRepository(Orders).count({
      where: { user: { id: userId }, status: In([...PAID_STATUSES]) },
    });
    if (paidOrdersCount > 0) {
      throw new BadRequestException(
        'کد هدیه معرف فقط برای اولین سفارش قابل استفاده است',
      );
    }

    return {
      valid: true,
      discount: Number(settings.referralDiscountAmount),
      referrerId: referrer.id,
      code: cleanCode,
    };
  }

  async completeReferralOnFirstOrder(
    referredUserId: number,
    orderId: number,
    manager?: EntityManager,
  ) {
    const em = manager ?? this.dataSource.manager;

    const ref = await em.findOne(Referral, {
      where: { referredUserId, status: ReferralStatus.PENDING },
      relations: { referrer: true, referredUser: true },
    });

    if (!ref) return null;

    const paidCount = await em.count(Orders, {
      where: { user: { id: referredUserId }, status: In([...PAID_STATUSES]) },
    });
    if (paidCount > 1) {
      return null;
    }

    await em.query('SELECT pg_advisory_xact_lock($1)', [ref.referrerId]);

    const idempotencyKey = `referral-reward:${ref.id}`;
    const existing = await em.getRepository(LoyaltyLedger).findOne({
      where: { idempotencyKey },
    });

    if (!existing) {
      const reward = Number(ref.rewardAmount);
      await em.getRepository(LoyaltyLedger).insert({
        userId: ref.referrerId,
        amount: reward,
        type: LoyaltyLedgerType.REFERRAL_REWARD,
        orderId,
        description: 'پاداش معرفی دوست (ثبت اولین خرید دوست)',
        idempotencyKey,
      });
    }

    ref.status = ReferralStatus.COMPLETED;
    ref.orderId = orderId;
    ref.completedAt = new Date();
    await em.save(Referral, ref);

    if (ref.referrer?.mobile) {
      const friendName =
        ref.referredUser?.first_name ||
        (ref.referredUser?.mobile
          ? `${ref.referredUser.mobile.slice(0, 4)}***${ref.referredUser.mobile.slice(-3)}`
          : 'دوست شما');

      this.smsService
        .sendReferralSuccessViaMeliSms(ref.referrer.mobile, friendName)
        .catch(() => null);
    }

    return ref;
  }

  async getAdminReferrals(page = 1, limit = 20, status?: ReferralStatus) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const qb = this.referrals
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.referrer', 'referrer')
      .leftJoinAndSelect('r.referredUser', 'referred')
      .orderBy('r.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (status) {
      qb.andWhere('r.status = :status', { status });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map(
        (r): AdminReferralItemDto => ({
          id: r.id,
          referralCode: r.referralCode,
          discountCode: r.discountCode,
          status: r.status,
          rewardAmount: Number(r.rewardAmount),
          discountAmount: Number(r.discountAmount),
          orderId: r.orderId ?? undefined,
          createdAt: r.createdAt,
          completedAt: r.completedAt ?? undefined,
          referrer: {
            id: r.referrer.id,
            firstName: r.referrer.first_name,
            lastName: r.referrer.last_name,
            mobile: r.referrer.mobile,
          },
          referredUser: {
            id: r.referredUser.id,
            firstName: r.referredUser.first_name,
            lastName: r.referredUser.last_name,
            mobile: r.referredUser.mobile,
          },
        }),
      ),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }
}

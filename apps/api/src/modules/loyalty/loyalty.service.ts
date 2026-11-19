import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { LoyaltyLedger } from './entities/loyalty-ledger.entity';
import { LoyaltyVisit } from './entities/loyalty-visit.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyLedgerType } from './enums/loyalty-ledger-type.enum';
import { UpdateLoyaltySettingsDto } from './dtos/update-loyalty-settings.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyLedger) private readonly ledger: Repository<LoyaltyLedger>,
    @InjectRepository(LoyaltyVisit) private readonly visits: Repository<LoyaltyVisit>,
    @InjectRepository(LoyaltySettings) private readonly settings: Repository<LoyaltySettings>,
    private readonly dataSource: DataSource,
  ) {}
  async getSettings() { let s = await this.settings.findOne({ where: {} }); if (!s) s = await this.settings.save(this.settings.create({})); return s; }
  async updateSettings(dto: UpdateLoyaltySettingsDto) { const s = await this.getSettings(); Object.assign(s, dto); return this.settings.save(s); }
  async redeemForOrder(userId: number, orderId: number, total: number, manager?: EntityManager) {
    const em = manager ?? this.dataSource.manager;
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.autoRedeem) return 0;
    const existing = await em.getRepository(LoyaltyLedger).findOne({ where: { idempotencyKey: `order-redemption:${orderId}` } });
    if (existing) return Math.max(0, -Number(existing.amount));
    const raw = await em.getRepository(LoyaltyLedger).createQueryBuilder('l').select('COALESCE(SUM(l.amount),0)', 'balance').where('l.user_id = :userId', { userId }).getRawOne();
    const amount = Math.min(Math.max(0, Number(raw.balance)), Math.max(0, total));
    if (!amount) return 0;
    await em.getRepository(LoyaltyLedger).insert({ userId, amount: -amount, type: LoyaltyLedgerType.ORDER_REDEMPTION, orderId, description: 'Automatic loyalty credit redemption', idempotencyKey: `order-redemption:${orderId}` });
    return amount;
  }

  async awardCashback(userId: number, orderId: number, eligibleTotal: number, manager?: EntityManager) {
    const em = manager ?? this.dataSource.manager;
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.cashbackEnabled || eligibleTotal < Number(settings.cashbackMinOrder)) return 0;
    const key = `cashback:${orderId}`;
    const existing = await em.getRepository(LoyaltyLedger).findOne({ where: { idempotencyKey: key } });
    if (existing) return Number(existing.amount);
    const amount = Number(settings.cashbackAmount);
    if (!amount) return 0;
    await em.getRepository(LoyaltyLedger).insert({ userId, amount, type: LoyaltyLedgerType.CASHBACK, orderId, description: 'Cashback for paid order', idempotencyKey: key });
    return amount;
  }


  async balance(userId: number) {
    const row = await this.ledger.createQueryBuilder('l').select('COALESCE(SUM(l.amount),0)', 'balance').where('l.user_id = :userId', { userId }).getRawOne();
    return Number(row?.balance ?? 0);
  }

  async history(userId: number, limit = 50) { return this.ledger.find({ where: { userId }, order: { createdAt: 'DESC' }, take: Math.min(limit, 100) }); }

  private weekKey(date: Date) {
    const d = new Date(date);
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - day + 1);
    return d.toISOString().slice(0, 10);
  }

  async checkIn(userId: number) { const now = new Date(); const calendarDate = now.toISOString().slice(0,10); const weekKey = this.weekKey(now); const existing = await this.visits.findOne({ where: { userId, calendarDate } }); if (!existing) { try { await this.visits.insert({ userId, calendarDate, weekKey }); } catch {} } const count = await this.visits.count({ where: { userId, weekKey } }); let reward = 0; if (count >= 7) { const key = `weekly:${userId}:${weekKey}`; if (!(await this.ledger.findOne({ where: { idempotencyKey: key } }))) { const s = await this.getSettings(); if (s.enabled && s.weeklyReward > 0) { await this.ledger.save(this.ledger.create({ userId, amount: s.weeklyReward, type: LoyaltyLedgerType.WEEKLY_VISIT_REWARD, description: 'Weekly visit reward', idempotencyKey: key })); reward = s.weeklyReward; } } } return { calendarDate, weekKey, days: count, completed: count >= 7, reward, balance: await this.balance(userId) }; }
  async adjustment(userId: number, amount: number, description: string, adminId: number) { return this.ledger.save(this.ledger.create({ userId, amount, type: LoyaltyLedgerType.MANUAL_ADJUSTMENT, description, idempotencyKey: `manual:${adminId}:${userId}:${Date.now()}` })); }
}

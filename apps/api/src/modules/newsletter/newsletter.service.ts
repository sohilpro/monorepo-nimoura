import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './entities/newsletter.entity';
import { SubscribeNewsletterDto } from './dtos/subscribe-newsletter.dto';
import { NewsletterQueryDto } from './dtos/newsletter-query.dto';
import { BroadcastCampaignDto } from './dtos/broadcast-campaign.dto';
import { SmsService } from '../payments/sms.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepo: Repository<Newsletter>,
    private readonly smsService: SmsService,
  ) {}

  private normalizeContact(contact: string): {
    type: 'mobile' | 'email';
    value: string;
  } {
    const trimmed = (contact || '').trim();
    // Regex for Iranian mobile numbers (09xxxxxxxxx or +989... or 9...)
    const phoneMatch = trimmed.match(/^(?:0|\+?98)?(9\d{9})$/);
    if (phoneMatch) {
      return { type: 'mobile', value: `0${phoneMatch[1]}` };
    }

    // Regex for Email
    const emailMatch = trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    if (emailMatch) {
      return { type: 'email', value: trimmed.toLowerCase() };
    }

    throw new BadRequestException(
      'لطفاً یک شماره موبایل معتبر (مثلاً 09123456789) یا یک ایمیل صحیح وارد نمایید.',
    );
  }

  async subscribe(dto: SubscribeNewsletterDto) {
    const { type, value } = this.normalizeContact(dto.contact);

    const where = type === 'mobile' ? { mobile: value } : { email: value };
    const existing = await this.newsletterRepo.findOne({ where });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        if (dto.name?.trim()) existing.name = dto.name.trim();
        await this.newsletterRepo.save(existing);
        return {
          message: 'عضویت شما در خبرنامه شگفتانه‌ها و تخفیف‌ها مجدداً فعال شد.',
          isNew: false,
          id: existing.id,
        };
      }
      return {
        message: 'شما قبلاً در خبرنامه تخفیف‌ها و جشنواره‌های نیمورا عضو شده‌اید.',
        isNew: false,
        id: existing.id,
      };
    }

    const item = this.newsletterRepo.create({
      mobile: type === 'mobile' ? value : null,
      email: type === 'email' ? value : null,
      name: dto.name?.trim() || null,
      source: dto.source?.trim() || 'footer',
      isActive: true,
    });

    const saved = await this.newsletterRepo.save(item);

    if (type === 'mobile') {
      this.smsService
        .sendNewsletterPromoViaMeliSms(value, 'عضویت')
        .catch(() => null);
    }

    return {
      message:
        'عضویت شما با موفقیت ثبت شد! شگفتانه‌ها، تخفیف‌های ویژه و جشنواره‌ها برای شما ارسال خواهند شد.',
      isNew: true,
      id: saved.id,
    };
  }

  async findAll(query: NewsletterQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(Math.max(1, query.limit || 15), 100);

    const qb = this.newsletterRepo.createQueryBuilder('n');

    if (query.search?.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere('(n.email ILIKE :s OR n.mobile ILIKE :s OR n.name ILIKE :s)', {
        s,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('n.isActive = :isActive', { isActive: query.isActive });
    }

    const sortField =
      query.sortBy === 'email'
        ? 'n.email'
        : query.sortBy === 'mobile'
          ? 'n.mobile'
          : 'n.createdAt';
    qb.orderBy(sortField, query.sortOrder || 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: {
        newsletter: items.map((i) => ({
          id: i.id,
          email: i.email || i.mobile || '',
          mobile: i.mobile,
          actualEmail: i.email,
          name: i.name,
          source: i.source,
          isActive: i.isActive,
          campaignCount: i.campaignCount,
          lastNotifiedAt: i.lastNotifiedAt,
          subscribedAt: i.createdAt,
          createdAt: i.createdAt,
        })),
        total,
      },
      page,
      limit,
    };
  }

  async getStats() {
    const total = await this.newsletterRepo.count();
    const active = await this.newsletterRepo.count({
      where: { isActive: true },
    });
    const withMobile = await this.newsletterRepo
      .createQueryBuilder('n')
      .where('n.mobile IS NOT NULL AND n.isActive = true')
      .getCount();
    const withEmail = await this.newsletterRepo
      .createQueryBuilder('n')
      .where('n.email IS NOT NULL AND n.isActive = true')
      .getCount();

    return {
      total,
      active,
      withMobile,
      withEmail,
    };
  }

  async toggleActive(id: number) {
    const item = await this.newsletterRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('عضو خبرنامه یافت نشد');
    item.isActive = !item.isActive;
    await this.newsletterRepo.save(item);
    return { id: item.id, isActive: item.isActive };
  }

  async delete(id: number) {
    const item = await this.newsletterRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('عضو خبرنامه یافت نشد');
    await this.newsletterRepo.softRemove(item);
    return { success: true, id };
  }

  async broadcastCampaign(dto: BroadcastCampaignDto) {
    const subscribers = await this.newsletterRepo
      .createQueryBuilder('n')
      .where('n.isActive = true AND n.mobile IS NOT NULL')
      .select(['n.id', 'n.mobile', 'n.campaignCount'])
      .getMany();

    if (!subscribers.length) {
      return {
        success: false,
        count: 0,
        message: 'هیچ عضو فعالی با شماره موبایل در خبرنامه ثبت نشده است.',
      };
    }

    let sent = 0;
    const now = new Date();

    for (const sub of subscribers) {
      if (!sub.mobile) continue;
      try {
        await this.smsService.sendNewsletterPromoViaMeliSms(
          sub.mobile,
          dto.promoCode,
        );
        sent++;
      } catch {
        // continue sending
      }
    }

    await this.newsletterRepo
      .createQueryBuilder()
      .update(Newsletter)
      .set({
        lastNotifiedAt: now,
        campaignCount: () => 'campaign_count + 1',
      })
      .where('isActive = true AND mobile IS NOT NULL')
      .execute();

    return {
      success: true,
      count: sent,
      totalSubscribers: subscribers.length,
      message: `کد تخفیف «${dto.promoCode}» برای ${sent} نفر از اعضای خبرنامه ارسال شد.`,
    };
  }
}

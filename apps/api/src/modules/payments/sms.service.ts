import { Injectable, Logger } from '@nestjs/common';
import MelipayamakApi from 'melipayamak';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtpViaMeliSms(phone: string, code: string) {
    await this.sendPattern(phone, code, 'MELI_SMS_PATTERN_CODE');
  }

  async sendOrderViaMeliSms(phone: string, code: string) {
    await this.sendPattern(phone, code, 'MELI_SMS_PATTERN_ORDER');
  }

  async sendReferralSuccessViaMeliSms(phone: string, token: string) {
    const patternKey = 'MELI_SMS_PATTERN_REFERRAL';
    const bodyId = process.env[patternKey];
    if (!bodyId || !bodyId.trim()) {
      this.logger.debug(
        'MELI_SMS_PATTERN_REFERRAL is not configured yet. Skipping SMS.',
      );
      return;
    }
    try {
      await this.sendPattern(phone, token, patternKey);
    } catch (err: any) {
      this.logger.warn(
        `Failed to send referral SMS to ${phone}: ${err?.message}`,
      );
    }
  }

  async sendNewsletterPromoViaMeliSms(phone: string, token: string) {
    const patternKey = 'MELI_SMS_PATTERN_NEWSLETTER';
    const bodyId = process.env[patternKey];
    if (!bodyId || !bodyId.trim()) {
      this.logger.debug(
        'MELI_SMS_PATTERN_NEWSLETTER is not configured yet. Skipping SMS.',
      );
      return;
    }
    try {
      await this.sendPattern(phone, token, patternKey);
    } catch (err: any) {
      this.logger.warn(
        `Failed to send newsletter SMS to ${phone}: ${err?.message}`,
      );
    }
  }

  private async sendPattern(
    phone: string,
    code: string,
    patternEnvKey:
      | 'MELI_SMS_PATTERN_CODE'
      | 'MELI_SMS_PATTERN_ORDER'
      | 'MELI_SMS_PATTERN_REFERRAL'
      | 'MELI_SMS_PATTERN_NEWSLETTER',
  ) {
    const username = process.env.MELI_SMS_USER;
    const password = process.env.MELI_SMS_PASS;
    const bodyId = process.env[patternEnvKey];

    if (!username || !password || !bodyId) {
      throw new Error(
        `SMS provider is not configured (MELI_SMS_USER, MELI_SMS_PASS, ${patternEnvKey})`,
      );
    }

    const sms = new MelipayamakApi(username, password).sms();
    const res = await sms.sendByBaseNumber([code], phone, bodyId);

    if (res.StrRetStatus !== 'Ok') {
      throw new Error('ارسال پیامک ناموفق بود');
    }
  }
}

import { Injectable } from '@nestjs/common';
import MelipayamakApi from 'melipayamak';

@Injectable()
export class SmsService {
  async sendOtpViaMeliSms(phone: string, code: string) {
    await this.sendPattern(phone, code, 'MELI_SMS_PATTERN_CODE');
  }

  async sendOrderViaMeliSms(phone: string, code: string) {
    await this.sendPattern(phone, code, 'MELI_SMS_PATTERN_ORDER');
  }

  private async sendPattern(
    phone: string,
    code: string,
    patternEnvKey: 'MELI_SMS_PATTERN_CODE' | 'MELI_SMS_PATTERN_ORDER',
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

import { Injectable } from "@nestjs/common";
const MelipayamakApi = require("melipayamak");

@Injectable()
export class SmsService {
  async sendOtpViaMeliSms(phone: string, code: string) {
    const username = process.env.MELI_SMS_USER;
    // const password = process.env.MELI_SMS_PASS;
    const password = "e22a0333-87c6-4ca3-9c45-0c3651828d3f";
    const bodyId = process.env.MELI_SMS_PATTERN_CODE;
    const api = new MelipayamakApi(username, password);
    const sms = api.sms();

    const res = await sms.sendByBaseNumber([code], phone, bodyId);

    if (res.StrRetStatus !== "Ok") {
      throw new Error("ارسال پیامک ناموفق بود");
    }
  }
  async sendOrderViaMeliSms(phone: string, code: string) {
    const username = process.env.MELI_SMS_USER;
    // const password = process.env.MELI_SMS_PASS;
    const password = "e22a0333-87c6-4ca3-9c45-0c3651828d3f";
    const bodyId = process.env.MELI_SMS_PATTERN_ORDER;
    const api = new MelipayamakApi(username, password);
    const sms = api.sms();

    const res = await sms.sendByBaseNumber([code], phone, bodyId);

    if (res.StrRetStatus !== "Ok") {
      throw new Error("ارسال پیامک ناموفق بود");
    }
  }
}

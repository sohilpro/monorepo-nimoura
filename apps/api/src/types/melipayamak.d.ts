declare module 'melipayamak' {
  interface MelipayamakSendResult {
    StrRetStatus: string;
  }

  interface MelipayamakSms {
    sendByBaseNumber(
      args: string[],
      to: string,
      bodyId: string,
    ): Promise<MelipayamakSendResult>;
  }

  export default class MelipayamakApi {
    constructor(username: string, password: string);
    sms(): MelipayamakSms;
  }
}

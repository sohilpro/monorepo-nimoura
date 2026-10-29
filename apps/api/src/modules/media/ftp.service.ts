import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';

/**
 * تمام تعامل با هاست دانلودی (FTP) از این سرویس عبور می‌کند.
 * هر بار یک اتصال جدید باز و در پایان بسته می‌شود؛ برای ترافیک بالا
 * می‌توان بعداً یک connection pool اضافه کرد، ولی برای شروع همین کافی و پایدار است.
 */
@Injectable()
export class FtpService {
  private readonly logger = new Logger(FtpService.name);

  constructor(private readonly config: ConfigService) {}

  private async getClient(): Promise<Client> {
    const client = new Client();
    client.ftp.verbose = false;

    await client.access({
      host: this.config.get<string>('FTP_HOST'),
      port: this.config.get<number>('FTP_PORT', 21),
      user: this.config.get<string>('FTP_USER'),
      password: this.config.get<string>('FTP_PASSWORD'),
      secure: this.config.get<boolean>('FTP_SECURE', false),
    });

    return client;
  }

  /** آپلود یک بافر (فایل در حافظه) به مسیر مشخص روی FTP */
  async uploadBuffer(
    buffer: Buffer,
    remoteDir: string,
    fileName: string,
  ): Promise<string> {
    const client = await this.getClient();
    try {
      await client.ensureDir(remoteDir);
      await client.clearWorkingDir().catch(() => undefined);
      const stream = Readable.from(buffer);
      const remotePath = `${remoteDir}/${fileName}`;
      await client.uploadFrom(stream, remotePath);
      this.logger.log(`Uploaded to FTP: ${remotePath}`);
      return remotePath;
    } finally {
      client.close();
    }
  }

  /** حذف یک فایل مشخص از روی FTP (اگر فایل وجود نداشت خطا نمی‌دهد) */
  async deleteFile(remotePath: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.remove(remotePath, true); // true => اگر وجود نداشت ignore کن
      this.logger.log(`Deleted from FTP: ${remotePath}`);
    } catch (err: any) {
      this.logger.warn(`FTP delete failed for ${remotePath}: ${err.message}`);
    } finally {
      client.close();
    }
  }

  /** حذف چند فایل با هم (مثلاً حذف کل گالری یک محصول) */
  async deleteMany(remotePaths: string[]): Promise<void> {
    const client = await this.getClient();
    try {
      for (const path of remotePaths) {
        await client
          .remove(path, true)
          .catch((err) =>
            this.logger.warn(`FTP delete failed for ${path}: ${err.message}`),
          );
      }
    } finally {
      client.close();
    }
  }
}

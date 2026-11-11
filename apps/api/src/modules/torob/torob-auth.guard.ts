import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey, KeyObject, verify } from 'crypto';
import type { Request } from 'express';

// کلید عمومی رسمی ترب (از داکیومنت)
const TOROB_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=
-----END PUBLIC KEY-----`;

const CLOCK_LEEWAY_SEC = 10;

/**
 * اعتبارسنجی JWT با الگوریتم EdDSA (ed25519) بدون هیچ پکیج اضافه (فقط crypto نود).
 * بررسی‌ها: alg، امضا، exp، nbf، aud.
 * دلیل هر ۴۰۱ در لاگ سرور (Logger) نوشته می‌شود تا عیب‌یابی ساده باشد.
 */
@Injectable()
export class TorobAuthGuard implements CanActivate {
  private readonly logger = new Logger(TorobAuthGuard.name);
  private readonly publicKey: KeyObject;

  constructor(private readonly config: ConfigService) {
    // فقط برای تست محلی با کلید خودتان؛ در production ست نکنید.
    const override = this.config.get<string>('TOROB_PUBLIC_KEY_OVERRIDE');
    if (override) {
      this.logger.warn(
        'TOROB_PUBLIC_KEY_OVERRIDE is SET: the official Torob key is NOT used (test mode)',
      );
    }
    this.publicKey = TorobAuthGuard.loadKey(override || TOROB_PUBLIC_KEY_PEM);

    this.logger.log(
      `enabled=${this.config.get('TOROB_ORDERS_ENABLED')} audience=${
        this.config.get('TOROB_AUDIENCE') ?? '(from Host header)'
      }`,
    );
  }

  /** PEM را با هر فرمت (چندخطی، تک‌خطی، با \n یا فقط base64) می‌پذیرد */
  private static loadKey(raw: string): KeyObject {
    const b64 = raw
      .replace(/\\n/g, '')
      .replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '')
      .replace(/\s+/g, '');
    return createPublicKey({
      key: Buffer.from(b64, 'base64'),
      format: 'der',
      type: 'spki',
    });
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    this.verifyToken(req);

    // سوییچ روشن/خاموش (بند 3.1 داکیومنت)
    if (this.config.get<string>('TOROB_ORDERS_ENABLED') !== 'true') {
      throw new ForbiddenException('Torob order tracking is disabled');
    }
    return true;
  }

  private fail(reason: string, details?: Record<string, unknown>): never {
    this.logger.warn(
      `401 ${reason}${details ? ' ' + JSON.stringify(details) : ''}`,
    );
    throw new UnauthorizedException(reason);
  }

  private verifyToken(req: Request): void {
    const token = req.header('x-torob-token');
    if (!token) {
      // فقط «نام» هدرها لاگ می‌شود (نه مقدارشان) تا ببینیم ترب چه هدری می‌فرستد
      this.fail('Missing token', {
        method: req.method,
        headerNames: Object.keys(req.headers),
        userAgent: req.headers['user-agent'],
        forwardedFor: req.headers['x-forwarded-for'],
      });
    }

    const parts = token.split('.');
    if (parts.length !== 3) this.fail('Malformed token');
    const [h, p, s] = parts;

    let header: { alg?: string };
    let payload: { exp?: unknown; nbf?: unknown; aud?: string | string[] };
    try {
      header = JSON.parse(
        Buffer.from(h, 'base64url').toString('utf8'),
      ) as typeof header;
      payload = JSON.parse(
        Buffer.from(p, 'base64url').toString('utf8'),
      ) as typeof payload;
    } catch {
      this.fail('Malformed token');
    }

    if (header?.alg !== 'EdDSA') this.fail('Bad alg', { alg: header?.alg });

    let valid = false;
    try {
      valid = verify(
        null,
        Buffer.from(`${h}.${p}`),
        this.publicKey,
        Buffer.from(s, 'base64url'),
      );
    } catch {
      valid = false;
    }
    if (!valid) {
      this.fail('Invalid signature', {
        overrideKeyActive: !!this.config.get('TOROB_PUBLIC_KEY_OVERRIDE'),
      });
    }

    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.exp !== 'number' ||
      now > payload.exp + CLOCK_LEEWAY_SEC
    ) {
      this.fail('Token expired', { now, exp: payload.exp });
    }
    if (
      typeof payload.nbf === 'number' &&
      now + CLOCK_LEEWAY_SEC < payload.nbf
    ) {
      this.fail('Token not yet valid', { now, nbf: payload.nbf });
    }

    // aud باید با دامنه‌ی عمومی API برابر باشد (مثلاً api.vecaro.ir)
    const expected =
      this.config.get<string>('TOROB_AUDIENCE') || req.headers.host;
    const aud: string[] = Array.isArray(payload.aud)
      ? payload.aud
      : payload.aud === undefined
        ? []
        : [payload.aud];
    if (!expected || !aud.includes(expected)) {
      this.fail('Invalid audience', {
        tokenAud: payload.aud,
        expected,
        hostHeader: req.headers.host,
      });
    }
  }
}

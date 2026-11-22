/**
 * Same-origin proxy for backend uploads.
 *
 * API طوری ذخیره میکند که آدرس عمومی مدیاها میشود
 *   https://nimoura.ir/uploads/products/thumbnails/<uuid>.webp
 * اما دامنه اصلی (web) خودش فایلی نداشت و تصاویر 404 میشدند.
 *
 * این روت:
 *  ۱. ابتدا فایل را از دیسک/shared volume پیدا میکند (سریعترین حالت)
 *  ۲. اگر نبود، آنرا از بکند (http://api:4000/uploads/...) پروکسی میکند
 *     تا در داکر بدون volume مشترک هم کار کند.
 *
 * نکته: فقط GET/HEAD مجاز است و مسیر کاملاً validate میشود (جلوگیری از path traversal).
 */

import type { H3Event } from 'h3';
import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';

const MIME_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
};

const CACHE_IMMUTABLE = 'public, max-age=31536000, immutable';
const UPSTREAM_TIMEOUT_MS = 15_000;

/** مسیرهای احتمالی پوشه uploads بکند (لوکال، مونوئورپو و داکر) */
function resolveUploadRoots(configuredDir?: string): string[] {
  const roots: string[] = [];

  if (configuredDir) roots.push(resolve(configuredDir));
  roots.push('/var/www/uploads'); // shared volume در nginx (تولید)

  const cwd = process.cwd();
  roots.push(resolve(cwd, 'uploads'));
  roots.push(resolve(cwd, 'apps/api/uploads'));

  // وقتی web از داخل apps/web اجرا میشود، ریشه مونوئورپو را پیدا میکنیم
  let cursor = cwd;
  for (let depth = 0; depth < 4; depth++) {
    const parent = dirname(cursor);
    if (parent === cursor) break;
    roots.push(resolve(parent, 'uploads'));
    roots.push(resolve(parent, 'apps/api/uploads'));
    cursor = parent;
  }

  return [...new Set(roots)];
}

/** آدرس بکندی که باید پروکسی شود؛ فقط از تنظیمات سرور میآید (SSRF ایمن) */
function resolveUpstream(apiBase: string, configured?: string): string | null {
  const explicit = configured?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  try {
    return new URL(apiBase).origin;
  } catch {
    return null;
  }
}

/** مسیر ورودی را به یک مسیر نسبی امن تبدیل میکند */
function sanitizeRelativePath(raw: string): string | null {
  let value = raw;
  if (value.includes('%')) {
    try {
      value = decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  if (!value || value.includes('\0') || value.includes('\\') || value.startsWith('/')) {
    return null;
  }

  const segments = value.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    return null;
  }

  return segments.join('/');
}

function isInside(root: string, target: string): boolean {
  return target === root || target.startsWith(root + sep);
}

function applyCommonHeaders(event: H3Event, contentType: string) {
  setHeader(event, 'content-type', contentType);
  setHeader(event, 'cache-control', CACHE_IMMUTABLE);
  setHeader(event, 'x-content-type-options', 'nosniff');
  // SVG میتواند اسکریپت اجرا کند، بنابراین در sandbox سرو میشود
  if (contentType === 'image/svg+xml') {
    setHeader(
      event,
      'content-security-policy',
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
  }
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    setHeader(event, 'allow', 'GET, HEAD');
    setResponseStatus(event, 405);
    return null;
  }

  const rawPath = getRouterParam(event, 'path') ?? '';
  const relativePath = sanitizeRelativePath(rawPath);
  if (!relativePath) {
    throw createError({ statusCode: 400, statusMessage: 'invalid upload path' });
  }

  const extension = extname(relativePath).slice(1).toLowerCase();
  const contentType = MIME_BY_EXT[extension];
  if (!contentType) {
    throw createError({ statusCode: 404, statusMessage: 'file not found' });
  }

  const config = useRuntimeConfig(event);
  const uploadConfig = (config as { uploads?: { dir?: string; upstream?: string } }).uploads;

  // ۱) سرو مستقیم از دیسک (وقتی فایل روی هاست/volume مشترک موجود است)
  for (const root of resolveUploadRoots(uploadConfig?.dir)) {
    let candidate: string;
    try {
      candidate = resolve(root, relativePath);
    } catch {
      continue;
    }
    if (!isInside(root, candidate)) continue;

    try {
      const stats = await fs.stat(candidate);
      if (!stats.isFile()) continue;

      const etag = `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
      applyCommonHeaders(event, contentType);
      setHeader(event, 'etag', etag);
      setHeader(event, 'last-modified', stats.mtime.toUTCString());
      setHeader(event, 'accept-ranges', 'bytes');

      if (getRequestHeader(event, 'if-none-match') === etag) {
        setResponseStatus(event, 304);
        return null;
      }

      // ویدیوها نیاز به Range دارند تا مرورگر بتواند جستوجو (seek) کند
      const rangeHeader = getRequestHeader(event, 'range');
      const rangeMatch = rangeHeader ? /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim()) : null;
      let start = 0;
      let end = stats.size - 1;
      if (rangeMatch?.[1] || rangeMatch?.[2]) {
        if (rangeMatch[1]) start = Number(rangeMatch[1]);
        if (rangeMatch[2]) end = Number(rangeMatch[2]);
        if (!rangeMatch[1] && rangeMatch[2]) {
          start = Math.max(0, stats.size - Number(rangeMatch[2]));
        }
        if (start > end || start >= stats.size) {
          setHeader(event, 'content-range', `bytes */${stats.size}`);
          setResponseStatus(event, 416);
          return null;
        }
        end = Math.min(end, stats.size - 1);
        setHeader(event, 'content-range', `bytes ${start}-${end}/${stats.size}`);
        setResponseStatus(event, 206);
      } else {
        setResponseStatus(event, 200);
      }
      setHeader(event, 'content-length', end - start + 1);

      if (event.method === 'HEAD') return new Uint8Array(0);

      return createReadStream(candidate, { start, end });
    } catch (error: unknown) {
      // اگر فایل در این ریشه نبود (یا قابل خواندن نبود)، ریشه بعدی را امتحان میکنیم
      void error;
    }
  }

  // ۲) پروکسی از بکند (زمانی که API فایل را در اختیار دارد؛ مثلاً داخل داکر)
  const upstream = resolveUpstream(
    String(config.apiBase || ''),
    uploadConfig?.upstream,
  );
  if (!upstream) {
    throw createError({ statusCode: 404, statusMessage: 'file not found' });
  }

  const headers: HeadersInit = {};
  const range = getRequestHeader(event, 'range');
  if (range) headers.range = range;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${upstream}/uploads/${relativePath}`, {
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'upstream unavailable' });
  }

  const upstreamType = upstreamResponse.headers.get('content-type') || contentType;
  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    if (upstreamResponse.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'file not found' });
    }
    throw createError({ statusCode: 502, statusMessage: 'upstream error' });
  }
  if (!upstreamType.startsWith('image/') && !upstreamType.startsWith('video/') && upstreamType !== 'application/pdf') {
    throw createError({ statusCode: 415, statusMessage: 'unsupported media type' });
  }

  applyCommonHeaders(event, upstreamType);

  const passthroughHeaders = ['content-range', 'accept-ranges', 'etag', 'last-modified', 'content-length'];
  for (const name of passthroughHeaders) {
    const value = upstreamResponse.headers.get(name);
    if (value) setHeader(event, name, value);
  }

  const requestEtag = getRequestHeader(event, 'if-none-match');
  const upstreamEtag = upstreamResponse.headers.get('etag');
  if (requestEtag && upstreamEtag && requestEtag === upstreamEtag) {
    setResponseStatus(event, 304);
    return null;
  }

  setResponseStatus(event, upstreamResponse.status);
  if (event.method === 'HEAD' || !upstreamResponse.body) return new Uint8Array(0);
  return upstreamResponse.body;
});

// app/utils/productAtlas.ts
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";
import type { AtlasQuality } from "~/composables/useShopQuality";
import type { Theme3D } from "./theme3d";
import type { ShopProduct } from "./shopCatalog";

const CELL_W = 224;
const CELL_H = 288; // نسبت 0.14:0.18 = جعبه محصول

export interface AtlasRect {
  u: number;
  v: number;
  w: number;
  h: number;
}

const bodyFont = () =>
  (import.meta.client && getComputedStyle(document.body).fontFamily) ||
  "Tahoma, sans-serif";

function loadImage(src: string, timeoutMs = 10_000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // بدون این، canvas «آلوده» می‌شود و WebGL رد می‌کند
    img.decoding = "async";
    const t = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    img.onload = () => {
      clearTimeout(t);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(t);
      reject(new Error("load failed"));
    };
    img.src = src;
  });
}

export class ProductAtlas {
  readonly texture: CanvasTexture;
  readonly capacity: number;
  readonly failed = new Set<number>();
  loaded = 0;

  private readonly opts: AtlasQuality;
  private readonly onProgress?: (done: number, total: number) => void;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly size: number;
  private readonly cw: number;
  private readonly ch: number;
  private readonly pad: number;
  private readonly cells = new Map<number, { x: number; y: number }>();
  private readonly products: ShopProduct[];
  private readonly family = bodyFont();
  private readonly theme: Theme3D;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private dead = false;

  constructor(
    theme: Theme3D,
    products: ShopProduct[],
    opts: AtlasQuality,
    onProgress?: (done: number, total: number) => void,
  ) {
    this.theme = theme;
    this.opts = opts;
    this.onProgress = onProgress;
    const k = opts.scale;
    this.size = Math.round(2048 * k);
    this.cw = Math.round(CELL_W * k);
    this.ch = Math.round(CELL_H * k);
    this.pad = k >= 0.75 ? 2 : 1;

    const cols = Math.floor(this.size / this.cw);
    const rows = Math.floor(this.size / this.ch);
    this.capacity = cols * rows;
    this.products = products.slice(0, this.capacity);

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;

    this.products.forEach((p, i) => {
      this.cells.set(p.id, {
        x: (i % cols) * this.cw,
        y: Math.floor(i / cols) * this.ch,
      });
      this.draw(p, null);
    });

    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.anisotropy = opts.anisotropy;
    if (!opts.mipmaps) {
      this.texture.generateMipmaps = false;
      this.texture.minFilter = LinearFilter;
    }
  }

  get total() {
    return this.products.length;
  }

  has(id: number) {
    return this.cells.has(id);
  }

  rectFor(id: number): AtlasRect {
    const c = this.cells.get(id)!;
    const { size, cw, ch, pad } = this;
    return {
      u: (c.x + pad) / size,
      v: 1 - (c.y + ch - pad) / size, // کانواس از بالا شروع می‌شود، UV از پایین
      w: (cw - 2 * pad) / size,
      h: (ch - 2 * pad) / size,
    };
  }

  /** لود تدریجی عکس‌ها (همزمانی ۶ تا) */
  async loadAll(proxy: boolean, concurrency = this.opts.concurrency) {
    const queue = [...this.products];
    const worker = async () => {
      while (queue.length && !this.dead)
        await this.loadOne(queue.shift()!, proxy);
    };
    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, worker),
    );
    if (!this.dead) this.flush();
  }

  private async loadOne(p: ShopProduct, proxy: boolean) {
    try {
      if (!p.image) throw new Error("no image");
      const src = proxy
        ? `/api/shop-img?url=${encodeURIComponent(p.image)}`
        : p.image;
      const img = await loadImage(src);
      if (this.dead) return;
      this.draw(p, img);
      this.loaded++;
      this.scheduleFlush();
    } catch {
      this.failed.add(p.id); // همان کارت نام محصول می‌ماند
    } finally {
      if (!this.dead)
        this.onProgress?.(this.loaded + this.failed.size, this.products.length);
    }
  }

  private scheduleFlush() {
    if (this.timer || this.dead) return;
    this.timer = setTimeout(() => this.flush(), this.opts.flushMs);
  }

  private flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.texture.needsUpdate = true;
  }

  private draw(p: ShopProduct, img: HTMLImageElement | null) {
    const { ctx, cw, ch, pad, theme } = this;
    const { x, y } = this.cells.get(p.id)!;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cw, ch);
    ctx.clip();

    if (img) {
      // کارت سفید + عکس به‌صورت contain (بدون بریده‌شدن محصول)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, cw, ch);
      const m = pad + cw * 0.05;
      const aw = cw - 2 * m;
      const ah = ch - 2 * m;
      const s = Math.min(aw / img.naturalWidth, ah / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.drawImage(img, x + (cw - dw) / 2, y + (ch - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + ch);
      g.addColorStop(0, theme.hex.base);
      g.addColorStop(1, theme.hex.accent);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw, ch);

      ctx.fillStyle = theme.hex["text-700"];
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fs = Math.round(cw * 0.1);
      ctx.font = `600 ${fs}px ${this.family}`;
      const lines = this.wrap(p.title, cw * 0.78, 5);
      const lh = fs * 1.5;
      lines.forEach((l, i) =>
        ctx.fillText(
          l,
          x + cw / 2,
          y + ch / 2 + (i - (lines.length - 1) / 2) * lh,
        ),
      );
    }
    ctx.restore();
  }

  private wrap(text: string, maxW: number, maxLines: number): string[] {
    const { ctx } = this;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(t).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] += "…";
    }
    return lines;
  }

  dispose() {
    this.dead = true;
    if (this.timer) clearTimeout(this.timer);
    this.texture.dispose();
  }
}

/** برچسب «ناموجود» روی جعبه */
export function createUnavailableTagTexture(theme: Theme3D) {
  const w = 256;
  const h = 80;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const r = 18;
  ctx.fillStyle = theme.hex.velvet;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.hex.base;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 40px ${bodyFont()}`;
  ctx.fillText("ناموجود", w / 2, h / 2 + 2);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

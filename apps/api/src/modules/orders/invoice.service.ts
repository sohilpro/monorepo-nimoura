import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import { Orders } from './entities/orders.entity';

/**
 * فونت فارسی (TTF) برای رندر درست متن فارسی ضروری است؛ پیش‌فرض pdfkit فارسی ندارد.
 * مسیر با env `INVOICE_FONT_PATH` قابل تنظیم است، پیش‌فرض: assets/fonts/Vazirmatn-Regular.ttf
 */
const FONT_PATH =
  process.env.INVOICE_FONT_PATH ??
  join(process.cwd(), 'assets', 'fonts', 'Vazirmatn-Regular.ttf');

const PAGE_MARGIN = 40;
const COL = {
  total: { x: 40, width: 110 },
  unitPrice: { x: 150, width: 110 },
  quantity: { x: 260, width: 60 },
  title: { x: 320, width: 235 },
} as const;

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly hasPersianFont = existsSync(FONT_PATH);

  constructor() {
    if (!this.hasPersianFont) {
      this.logger.warn(
        `فونت فاکتور یافت نشد (${FONT_PATH}). متن فارسی در PDF درست نمایش داده نمی‌شود.`,
      );
    }
  }

  generateInvoice(order: Orders): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        if (this.hasPersianFont) doc.font(FONT_PATH);
        this.render(doc, order);
        doc.end();
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }

  private render(doc: PDFKit.PDFDocument, order: Orders) {
    const money = (n: number) => `${Number(n).toLocaleString('fa-IR')} تومان`;
    const right = {
      width: COL.title.width + COL.quantity.width,
      align: 'right',
    } as const;
    const fullWidth = doc.page.width - PAGE_MARGIN * 2;

    // ── سرتیتر
    doc.fontSize(18).text(`فاکتور سفارش ${order.orderCode ?? `#${order.id}`}`, {
      width: fullWidth,
      align: 'right',
    });
    doc
      .fontSize(10)
      .text(`تاریخ: ${order.createdAt.toLocaleDateString('fa-IR')}`, {
        width: fullWidth,
        align: 'right',
      });
    doc.moveDown();

    // ── گیرنده
    const shipping = order.shippingInfo;
    if (shipping) {
      doc.fontSize(11);
      doc.text(`گیرنده: ${shipping.first_name} ${shipping.last_name}`, {
        width: fullWidth,
        align: 'right',
      });
      doc.text(`تلفن: ${shipping.phone}`, { width: fullWidth, align: 'right' });
      const address = this.formatAddress(shipping.address);
      if (address)
        doc.text(`آدرس: ${address}`, { width: fullWidth, align: 'right' });
      doc.moveDown();
    }

    // ── جدول اقلام
    this.row(doc, ['مبلغ کل', 'قیمت واحد', 'تعداد', 'محصول'], true);
    doc
      .moveTo(PAGE_MARGIN, doc.y)
      .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
      .stroke();
    doc.moveDown(0.3);

    for (const item of order.items) {
      if (doc.y > doc.page.height - 150) doc.addPage();
      this.row(doc, [
        money(item.unitPrice * item.quantity),
        money(item.unitPrice),
        String(item.quantity),
        item.product.title,
      ]);
    }
    doc.moveDown();

    // ── جمع‌ها
    const totals: Array<[string, string]> = [
      ['جمع اقلام', money(order.subtotal)],
      ['هزینه ارسال', money(order.shippingCost)],
      ['تخفیف', money(order.discount)],
      ['مبلغ قابل پرداخت', money(order.finalTotal)],
    ];
    for (const [label, value] of totals) {
      const y = doc.y;
      doc.fontSize(11).text(label, COL.quantity.x, y, right);
      doc.text(value, PAGE_MARGIN, y, { width: 220, align: 'left' });
      doc.moveDown(0.3);
    }
  }

  /** یک سطر جدول؛ ارتفاع بر اساس بلندترین سلول (عنوان طولانی) محاسبه می‌شود */
  private row(
    doc: PDFKit.PDFDocument,
    cells: [string, string, string, string],
    header = false,
  ) {
    const columns = [COL.total, COL.unitPrice, COL.quantity, COL.title];
    doc.fontSize(header ? 11 : 10);
    const y = doc.y;
    let height = 0;
    cells.forEach((text, i) => {
      const { x, width } = columns[i];
      const align = i === 3 ? 'right' : 'left';
      doc.text(text, x, y, { width, align });
      height = Math.max(height, doc.heightOfString(text, { width }));
    });
    doc.x = PAGE_MARGIN;
    doc.y = y + height + 6;
  }

  private formatAddress(address: unknown): string {
    if (!address || typeof address !== 'object') return '';
    const a = address as Record<string, unknown>;
    return [a.state, a.city, a.address, a.postal_code]
      .filter((part): part is string => typeof part === 'string' && part !== '')
      .join('، ');
  }
}

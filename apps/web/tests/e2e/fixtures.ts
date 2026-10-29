// tests/e2e/fixtures.ts
import type { Page } from '@playwright/test'

// GIF شفاف ۱×۱
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

const cat = (id: number, name: string, slug: string) => ({ id, name, slug })
const base = {
  brand: { name: 'تست' },
  images: [],
  isAvailable: true,
  type: 'simple',
  isAmazingOffer: true,
  thumbnail: 'https://storage.nimoura.shop/uploads/thumbnail/test.webp',
}

export const PRODUCTS = [
  { ...base, id: 1, slug: 'mascara-test', title: 'ریمل تست', price: 130000, priceDiscount: 100000, stock: 10, category: cat(27, 'ریمل', 'riml') },
  { ...base, id: 2, slug: 'sold-out-test', title: 'رژ لب تست ناموجود', price: 90000, priceDiscount: 0, stock: 0, isAvailable: false, category: cat(23, 'رژ لب مایع و برق لب', 'rzh-lb') },
  { ...base, id: 3, slug: 'blush-variant-test', title: 'رژگونه تست چندرنگ', price: 120000, priceDiscount: 90000, stock: 20, type: 'variant', category: cat(34, 'رژ گونه', 'rzh-gwnh') },
  { ...base, id: 4, slug: 'foot-file-test', title: 'سوهان کف پا تست', price: 80000, priceDiscount: 60000, stock: 20, category: cat(41, 'رنده و سوهان', 'rndh-w-swhn') },
]

/** خطاهای بی‌اهمیت محیط تست (نرم‌افزار GPU و منابع بی‌ربط) */
export const IGNORED = /GPU stall|GroupMarkerNotSet|software WebGL|favicon|Failed to load resource/

export async function mockShop(page: Page) {
  await page.route('**/products/category**', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { products: PRODUCTS, total: PRODUCTS.length, page: 1, limit: 50, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      },
    }),
  )
  await page.route('https://storage.nimoura.shop/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/gif', headers: { 'access-control-allow-origin': '*' }, body: GIF }),
  )
}

export async function open3d(page: Page, opts: { query?: string; onboarded?: boolean } = {}) {
  const { query = '', onboarded = true } = opts
  await mockShop(page)
  if (onboarded) {
    await page.addInitScript(() => {
      try { localStorage.setItem('shop3d:onboarded', 'done') } catch { /* ignore */ }
    })
  }
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(`/store-3d?force3d=1&e2e=1&quality=low${query}`)
  await page.waitForFunction(() => (window as any).__shop3d?.ready === true, undefined, { timeout: 45_000 })
  return errors
}
// tests/e2e/shop3d.spec.ts
import { expect, test } from '@playwright/test'
import { IGNORED, open3d } from './fixtures'

const select = (page: import('@playwright/test').Page, slug: string) =>
  page.evaluate((s) => (window as any).__shop3d.selectBySlug(s), slug)

test('صحنه بدون خطا بالا می‌آید و محصولات چیده می‌شوند', async ({ page }) => {
  const errors = await open3d(page)
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).__shop3d.instances)).toBeGreaterThan(0)
  expect(errors.filter((e) => !IGNORED.test(e))).toEqual([])
})

test('مهمان: افزودن به سبد از کارت محصول', async ({ page }) => {
  await open3d(page)
  await select(page, 'mascara-test')

  const card = page.getByRole('dialog', { name: /ریمل تست/ })
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'افزودن به سبد خرید', exact: true }).click()
  await expect(card.getByRole('button', { name: 'به سبد اضافه شد' })).toBeVisible()

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('nimoura_cart_items') || '[]'))
  expect(stored).toHaveLength(1)
  expect(stored[0]).toMatchObject({ productId: 1, quantity: 1 })

  await expect(page.getByRole('button', { name: 'سبد خرید', exact: true })).toContainText(/[1۱]/)

  // نشانه attribution برای «خرید با کمک ۳D»
  const attr = await page.evaluate(() => JSON.parse(localStorage.getItem('shop3d:attr') || 'null'))
  expect(attr?.ids).toContain(1)
})

test('محصول ناموجود قابل افزودن نیست', async ({ page }) => {
  await open3d(page)
  await select(page, 'sold-out-test')
  const card = page.getByRole('dialog', { name: /ناموجود/ })
  await expect(card.getByRole('button', { name: 'ناموجود', exact: true })).toBeDisabled()
})

test('محصول واریانت‌دار به صفحه محصول هدایت می‌شود', async ({ page }) => {
  await open3d(page)
  await select(page, 'blush-variant-test')
  const card = page.getByRole('dialog', { name: /رژگونه تست/ })
  // اگر loadVariants را وصل کردید، این تست را به انتخاب رنگ تغییر دهید
  await expect(card.getByRole('link', { name: 'انتخاب مدل در صفحه محصول' })).toHaveAttribute(
    'href',
    '/product/blush-variant-test',
  )
})

test('مینی‌کارت: رفتن به صندوق از صحنه خارج می‌شود', async ({ page }) => {
  await open3d(page)
  await select(page, 'mascara-test')
  const card = page.getByRole('dialog', { name: /ریمل تست/ })
  await card.getByRole('button', { name: 'افزودن به سبد خرید', exact: true }).click()
  await expect(card.getByRole('button', { name: 'به سبد اضافه شد' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(card).toBeHidden()

  await page.getByRole('button', { name: 'سبد خرید', exact: true }).click()
  const link = page.getByRole('link', { name: 'رفتن به صندوق' })
  await expect(link).toHaveAttribute('href', '/checkout')
  await link.click()
  await page.waitForURL((u) => u.pathname !== '/store-3d')
})

test('لینک عمیق محصول کارت را باز می‌کند', async ({ page }) => {
  await open3d(page, { query: '&product=mascara-test' })
  await expect(page.getByRole('dialog', { name: /ریمل تست/ })).toBeVisible()
})

test('منوی بخش‌ها: رفتن به آرایش', async ({ page }) => {
  await open3d(page)
  await page.getByRole('button', { name: 'آرایش', exact: true }).click()
  await expect.poll(() => page.evaluate(() => (window as any).__shop3d.zone)).toBe('makeup')
})

test('راهنمای اولین ورود: یک‌بار نمایش داده می‌شود', async ({ page }) => {
  await open3d(page, { onboarded: false })
  const dlg = page.getByRole('dialog', { name: 'راهنمای مغازه' })
  await expect(dlg).toBeVisible()
  await dlg.getByRole('button', { name: 'بعدی' }).click()
  await dlg.getByRole('button', { name: 'بعدی' }).click()
  await dlg.getByRole('button', { name: 'شروع خرید' }).click()
  await expect(dlg).toBeHidden()

  await page.reload()
  await page.waitForFunction(() => (window as any).__shop3d?.ready === true)
  await page.waitForTimeout(1200) // تأخیر نمایش خودکار ۷۰۰ms
  await expect(dlg).toBeHidden()
})

test('کارت محصول داخل صفحه جا می‌شود و اسکرول افقی نداریم', async ({ page }) => {
  await open3d(page)
  await select(page, 'mascara-test')
  const card = page.getByRole('dialog', { name: /ریمل تست/ })
  await expect(card).toBeVisible()

  const vp = page.viewportSize()!
  await expect
    .poll(async () => {
      const b = await card.boundingBox()
      return b ? b.y + b.height : Number.POSITIVE_INFINITY
    })
    .toBeLessThanOrEqual(vp.height + 1)
  const box = (await card.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(-1)
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
// app/utils/shopCatalog.ts
import type { ZoneId } from './storeLayout'

/* ---------- پاسخ خام API (فقط فیلدهای لازم) ---------- */
export interface ApiProduct {
  id: number
  slug: string
  title: string
  englishTitle?: string
  price: number
  priceDiscount?: number | null
  isAvailable: boolean
  stock: number
  thumbnail?: string | null
  images?: { url: string }[]
  category?: { id: number; name: string; slug: string } | null
  brand?: { name: string } | null
  type?: 'simple' | 'variant'
  isAmazingOffer?: boolean
}

export interface ApiListResponse {
  success: boolean
  data: {
    products: ApiProduct[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
  }
}

/* ---------- مدل سبک مخصوص صحنه (بدون HTML توضیحات) ---------- */
export interface ShopProduct {
  id: number
  slug: string
  title: string
  englishTitle: string
  price: number
  finalPrice: number
  discountPercent: number
  available: boolean
  stock: number
  image: string | null
  categoryId: number
  categorySlug: string
  categoryName: string
  brandName: string
  type: 'simple' | 'variant'
  isAmazingOffer: boolean
}

export function toShopProduct(p: ApiProduct): ShopProduct {
  const price = Number(p.price) || 0
  const disc = Number(p.priceDiscount) || 0
  const finalPrice = disc > 0 && disc < price ? disc : price
  const stock = Number(p.stock) || 0

  return {
    id: p.id,
    slug: p.slug,
    title: (p.title ?? '').trim(),
    englishTitle: p.englishTitle ?? '',
    price,
    finalPrice,
    discountPercent: price > 0 ? Math.round((1 - finalPrice / price) * 100) : 0,
    // محصول variant: اگر موجودی سطح محصول برای شما معنا ندارد، این شرط را عوض کنید
    available: !!p.isAvailable && stock > 0,
    stock,
    image: p.thumbnail || p.images?.[0]?.url || null,
    categoryId: p.category?.id ?? 0,
    categorySlug: p.category?.slug ?? '',
    categoryName: (p.category?.name ?? '').trim(),
    brandName: p.brand?.name ?? '',
    type: p.type === 'variant' ? 'variant' : 'simple',
    isAmazingOffer: !!p.isAmazingOffer,
  }
}

/* ============ نگاشت دسته → بخش مغازه ============ */

/** override دقیق با slug دسته. هر دسته‌ای که جای اشتباه افتاد را اینجا اصلاح کنید */
export const SLUG_ZONE: Record<string, ZoneId> = {
  // 'rndh-w-swhn': 'body',
}

// ترتیب مهم است: اولین بخشی که کلمه‌اش بیاید برنده است
const KEYWORDS: [ZoneId, string[]][] = [
  ['fragrance', ['عطر', 'ادکلن', 'ادوپرفیوم', 'ادو', 'بادی میست']],
  ['body', ['بدن', 'مو', 'سوهان', 'رنده', 'شامپو', 'لوسیون', 'اسکراب', 'پا', 'دست', 'دئودورانت', 'صابون']],
  [
    'makeup',
    ['ریمل', 'خط چشم', 'مداد', 'رژ', 'تینت', 'سایه', 'کانسیلر', 'پودر', 'براش', 'قلمو',
      'هایلایتر', 'کانتور', 'پرایمر', 'لاک', 'ابرو', 'مژه', 'آرایش', 'ماتیک', 'برق لب'],
  ],
  ['skincare', ['سرم', 'ماسک', 'مرطوب', 'ضد آفتاب', 'ضدآفتاب', 'پاک کننده', 'شوینده', 'تونر', 'کرم', 'ژل', 'میسلار', 'لایه بردار']],
]

const norm = (s: string) =>
  s.replace(/\u200c/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim()

/** کلمه‌های کوتاه (≤۳ حرف) فقط با تطابق کامل توکن، تا «مو» وسط کلمه‌های دیگر نخورد */
function hit(name: string, tokens: Set<string>, kw: string) {
  const k = norm(kw)
  return k.length <= 3 && !k.includes(' ') ? tokens.has(k) : name.includes(k)
}

export function zoneOf(p: Pick<ShopProduct, 'categoryName' | 'categorySlug'>): { zone: ZoneId; matched: boolean } {
  const forced = SLUG_ZONE[p.categorySlug]
  if (forced) return { zone: forced, matched: true }

  const name = norm(p.categoryName)
  const tokens = new Set(name.split(' '))
  for (const [zone, words] of KEYWORDS) {
    if (words.some((w) => hit(name, tokens, w))) return { zone, matched: true }
  }
  return { zone: 'makeup', matched: false } // پیش‌فرض: بزرگ‌ترین بخش
}

/** واحد نمایش قیمت. اگر قیمت‌های API ریال است، اینجا عوض کنید یا بر ۱۰ تقسیم کنید */
export const CURRENCY_LABEL = 'تومان'

export function formatPrice(n: number) {
  return `${Math.round(n).toLocaleString('fa-IR')} ${CURRENCY_LABEL}`
}
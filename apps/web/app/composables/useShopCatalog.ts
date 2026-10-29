// app/composables/useShopCatalog.ts
import { ref, shallowRef } from 'vue'
import type { ApiListResponse, ApiProduct, ShopProduct } from '~/utils/shopCatalog'
import type { Placement } from '~/utils/productLayout'

export const CATALOG = {
  path: '/api/products/category',
  /** هر شناسه جداگانه گرفته و بعد بر اساس id یکتا می‌شود */
  categoryIds: [1],
  pageLimit: 50, // اگر بک‌اند سقف دارد، حلقه با hasNextPage خودش ادامه می‌دهد
  maxPages: 20,
}

/** هر نمونه (instance) روی قفسه ↔ محصولش. روز ۶ از instanceId رِی‌کست همین‌جا می‌خواند */
export interface ShopInstance {
  product: ShopProduct
  placement: Placement
}

// state مشترک؛ بین کامپوننت‌ها تکرار نمی‌شود
const products = shallowRef<ShopProduct[]>([])
const instances = shallowRef<ShopInstance[]>([])
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const error = ref<string | null>(null)
let inflight: Promise<void> | null = null

export function useShopCatalog() {
  

  async function fetchCategory(categoryId: number): Promise<ApiProduct[]> {
    const all: ApiProduct[] = []
    for (let page = 1; page <= CATALOG.maxPages; page++) {
      const res = await $fetch<ApiListResponse>(CATALOG.path, {
   
        query: { categoryId, page, limit: CATALOG.pageLimit },
        timeout: 15_000,
      })
      if (!res?.success) throw new Error('پاسخ نامعتبر از API محصولات')
      all.push(...res.data.products)
      if (!res.data.hasNextPage) break
    }
    return all
  }

  function load(force = false): Promise<void> {
    if (!force && (status.value === 'ready' || inflight)) return inflight ?? Promise.resolve()

    status.value = 'loading'
    error.value = null

    inflight = (async () => {
      try {
        const lists = await Promise.all(CATALOG.categoryIds.map(fetchCategory))
        const byId = new Map<number, ApiProduct>()
        for (const p of lists.flat()) byId.set(p.id, p)
        products.value = [...byId.values()].map(toShopProduct)
        status.value = 'ready'
        if (import.meta.dev) console.info(`[shop3d] ${products.value.length} محصول دریافت شد`)
      } catch (e) {
        status.value = 'error'
        error.value = e instanceof Error ? e.message : 'خطا در دریافت محصولات'
        console.error('[shop3d] دریافت محصولات ناموفق بود', e)
      } finally {
        inflight = null
      }
    })()

    return inflight
  }

  return { products, instances, status, error, load }
}
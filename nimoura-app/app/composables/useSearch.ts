// composables/useSearch.ts
//
// اگه فایل useSearch.ts از قبل توی پروژه‌ات هست، این نسخه رو جایگزینش کن
// (یا فقط متد fetchQuickSearch رو بهش اضافه کن اگه فانکشن‌های دیگه‌ای هم داره
// که اینجا نیستن).

export function useSearch() {
  // صفحه‌ی کامل نتایج جستجو (/search?q=...) — با فیلتر و صفحه‌بندی
  async function fetchSearchResults(params: {
    q: string
    page?: number
    limit?: number
    minPrice?: number
    maxPrice?: number
    isAvailable?: boolean
  }) {
    return await $fetch('/api/search/products', { query: params })
  }

  // سرچ سریع dropdown: محصول + دسته + برند با هم
  async function fetchQuickSearch(term: string) {
    return await $fetch('/api/search/quick', { query: { q: term } })
  }

  return { fetchSearchResults, fetchQuickSearch }
}
## Context
صفحات دسته‌بندی، برند و amazing از کامپوننت مشترک `apps/web/app/components/Categories/index.vue` استفاده می‌کنند و فیلتر، مرتب‌سازی، pagination/infinite scroll، facet، حالت‌های loading/empty و sync با URL را همان‌جا مدیریت می‌کنند. API جستجوی کامل نیز از قبل در `apps/web/server/api/search/products.get.ts` به endpoint بک‌اند `/search/products` متصل است و پارامتر `q` را می‌پذیرد. هدف، ساخت صفحه‌ی `/search?q=` با همان رفتار کامل بدون ایجاد یک listing مستقل و تکراری است.

## Implementation plan

1. **افزودن صفحه‌ی `/search`**
   - ایجاد `apps/web/app/pages/search.vue` با `definePageMeta({ key: route => route.fullPath })`.
   - خواندن query پارامتر `q` از URL و نمایش عنوانی مثل «نتایج جستجو برای «…»».
   - افزودن SEO title/description، canonical و JSON-LD مناسب صفحه‌ی SearchResultsPage/CollectionPage.
   - برای `q` خالی یا نبودن آن، API را صدا نزنیم و حالت راهنمای جستجو/empty مناسب نشان دهیم؛ برای عبارت معتبر، کامپوننت `Categories` را رندر کنیم.

2. **توسعه‌ی `Categories/index.vue` برای حالت جستجو**
   - اضافه کردن `isSearchRoute = route.path === '/search'` و branch انتخاب API روی `/api/search/products`.
   - در `buildQuery()` حفظ `q` و انتقال همه‌ی queryهای مشترک موجود: `page`, `limit`, `sort`, `sortOrder`, `tags`, `minPrice`, `maxPrice`, `onSale`, `isAvailable` و سایر فیلترها.
   - استفاده از sort canonical فعلی (`newest`, `cheapest`, `expensive`, `popular`, `title`, `stock`) و حفظ reset صفحه هنگام تغییر فیلتر/مرتب‌سازی.
   - اضافه کردن heading جستجو و breadcrumb «خانه ← جستجو» با عبارت جستجو، بدون تغییر رفتار routeهای category/brand/amazing.
   - تنظیم `seoSectionTarget` و sub-brand/category logic برای search به null تا SEO متن نامربوط نمایش داده نشود.
   - اطمینان از اینکه response search با هر دو شکل envelope (`data.products` یا `products`) خوانده می‌شود؛ در صورت نیاز یک helper کوچک برای unwrap listing اضافه می‌شود.

3. **اتصال facetها برای جستجو**
   - در `facetQuery` وقتی `isSearchRoute` فعال است، `q` را به کلید مورد انتظار endpoint facets یعنی `search` map کنیم، درحالی‌که `q` برای خود endpoint جستجو حفظ شود.
   - صفحه، همان `SideFilterBox`, `FilterModal`, `ActiveFilters`, `SortedBy`, `SortModal`, `Pagination`, `ProductGridSkeleton` و `ProductItem` را استفاده کند.
   - query مربوط به search را هنگام تغییر facetها حفظ کنیم تا facet و نتیجه روی همان عبارت باقی بمانند.

4. **بهبود proxy جستجو در صورت نیاز**
   - `apps/web/server/api/search/products.get.ts` را سبک و یکپارچه نگه داریم: `assertMethod`، `getQuery`، `apiFetch` و return مستقیم؛ حذف catch تکراری چون `apiFetch` خطاها را استاندارد می‌کند.
   - `apps/web/server/api/products/facets.get.ts` را بررسی و فقط mapping موردنیاز search را اضافه کنیم؛ public route و قرارداد فعلی تغییر نکند.

5. **Regression safety**
   - مسیرهای موجود category، brand، amazing، newest و best-seller را دست‌نخورده از نظر URL و API نگه داریم.
   - با queryهای نمونه تست کنیم:
     - `/search?q=ریمل`
     - `/search?q=ریمل&sort=cheapest`
     - `/search?q=ریمل&tags=...&minPrice=...&maxPrice=...`
     - `/search?q=ریمل&page=2`
     - `/search` و `/search?q=` برای حالت خالی.
   - اجرای `git diff --check`، typecheck/lint web و بررسی static route/API contract؛ خطاهای قدیمی خارج از این تغییر جدا گزارش می‌شوند.
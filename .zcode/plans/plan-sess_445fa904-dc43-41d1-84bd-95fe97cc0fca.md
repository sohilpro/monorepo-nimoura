## Context
قسمت پروفایل `apps/web` currently ترکیبی از Tailwind، ۷ بلوک `<style scoped>`، کلاسهای سفارشی (`profile-hero`, `stat-pill`, `tab-btn`, `field-*`, `order-card`, `step-*`…)، `style=` этого inline و hex کدهای تکراری (`#b76e79`, `#3d1f25`, `#dc2626`, rgba…) است. هدف: بازسازی کامل حدود ۲۰ فایل پروفایل با Tailwind 4 utility-first +PrimeVue، با پالت Nimoura موجود، ظاهری شیک و حرفهای، بدون کلاس متفرقه. طبق تأیید شما: (۱) از پالت Nimoura actu موجود استفاده میشود (پدوژهای در ریپو وجود ندارد)، (۲) کل بخش پروفایل، (۳) حداکثر استفاده از کامپوننتهای PrimeVue.

## تصمیمات طراحی
- **توکنها**: در `apps/web/app/assets/css/main.css` داخل `@theme` طیف عددی `nimoura-50…950` (از `packages/ui/src/primevue-preset.ts`) و `--color-nimoura-error/warning` (از `packages/ui/src/tokens.css`) اضافه میشود تا بتوان `bg-nimoura-500`, `text-nimoura-700`, `border-nimoura-200` نوشت. هیچ کلاس CSS جدیدی ساخته نمیشود؛ تمام scoped styleهای پروفایل حذف میشود.
- **PrimeVue**:凡是 دکمهها → `<Button>`، فیلدها → `<InputText>/<Textarea>`، منوهای استانی/شهری → `<Select filter>`، تبها → `<Tabs>/<TabList>/<Tab>`، فیلترها → `<SelectButton>`، لودینگ → `<Skeleton>`، مودالها → `<Dialog>/<ConfirmDialog>` (همانند الگوی `app/components/Product/DetailSingle/PriceBox.vue` با overrideهای `!rounded-xl !border-nimoura-* !bg-nimoura-*`).
- **زبان بصری مشترک**: کارتها `rounded-2xl border border-nimoura-text-100 bg-white shadow-[0_8px_30px_rgba(39,33,33,0.05)]`، هرو `rounded-3xl` با گرادیان `from-nimoura-950 via-nimoura-800 to-nimoura-500` + blobهای `blur-3xl`، پیلهای شیشهای `bg-white/10 border-white/20 backdrop-blur`، تأکید رنگی `text-nimoura-primary`، فاصلهها و hover مطابق کامپوننتهای اخیر (`Magazine/index.vue`, `Categories/Showcase.vue`, `Banners/Grid.vue`). RTL و فونتهای `font-vazir/font-modam` حفظ میشوند.
- **منطق untouched**: تمام composableها و utilityها (`useAuth`, `useProfileStats`, `useLoyalty`, `useAddresses`, `useWishlist`, `useTickets`, `useReferral`, `numberFormat`, `formatImageUrl`, `useAppToast`, `useConfirm`) بدون تغییر فراخوانی میشوند؛ endpointها، emitها، v-modelها، route query، polling ۱۲ ثانیهای تیکت، آستانه ۵۰۰۰۰۰ تسویه و middleware/auth و routeRules سایت دستنخورده میمانند.

## مراحل پیادهسازی
1. `app/assets/css/main.css` — اضافه کردن توکنهای طیف رنگی Nimoura (فقط `@theme`، بدون کلاس).
2. `components/Profile/index.vue` — هرو، آواتار، آمار و تبها با PrimeVue `Tabs`/`Button`/`Skeleton` بازنویسی، حذف کامل scoped CSS و inline style؛ کارت وفاداری و نوار پیشرفت با توکنها.
3. `components/Profile/Account.vue` — فرم با `InputText` + دکمههای PrimeVue، پیامهای خطا و راهنما با توکنها؛ حفظ `maskDate`، اعتبارسنجی، `watch` عمیق، `PUT /api/user/profile` و emit `updated`.
4. آدرسها: `Profile/Addresses.vue`, `Profile/Address/Address.Card.vue`, `Profile/Address/AddressFormDialog.vue` — تبدیل داپداون دستی به `Select` قابل جستجو، دکمهها و.dialogها به PrimeVue، حذف CSS مربوط به `field-*`, `dropdown-*`, `addr-card`؛ حفظ اعتبارسنجی کد پستی و emitها.
5. سفارشات: `Profile/Orders.vue`, `Profile/OrderDetail.vue` — حذف scoped CSS، استفاده از `Skeleton`/`Button`/Badge با توکنها، حفظ نگاشت وضعیتها، فرمت fa-IR و جزئیات stepper.
6. تیکت: `Profile/Tickets/TicketList.vue`, `TicketChat.vue`, `NewTicketModal.vue` و `pages/profile/tickets.vue` — فیلترها با `SelectButton`، جستجو با `InputText`، کامپوزر با `Textarea`، مودال با `Dialog`، حفظ polling، آپلود فایل و `confirm()` بستن تیکت؛ حذف هرو و inline gradient صفحه tickets.
7. سایر تبها: `Profile/Wishlist.vue`, `ReferralCard.vue`, `LoyaltyWithdrawalDialog.vue`, `Messages.vue`, `TrackingInfoCard.vue` — دکمهها به PrimeVue، رنگها به توکنها، حذف گرادیانها و رنگهای hard-coded.
8. رفع رفرنس شکسته `app/pages/profile/favorite.vue`: کامپوننت `<ProfileFavorite />` وجود ندارد؛ به `<ProfileWishlist />` تغییر میکند.
9. پاکسازی نهایی: اطمینان از عدم وجود scoped style، کلاس سفارشی یا hex خام در فایلهای پروفایل (بهجز جایی که ذاتاً لازم است مانندtransitionها).

## Verification
- `cd apps/web && npm run typecheck` و `npm run lint`
- `npm run build` در `apps/web` (برای اطمینان از کامپایل Tailwind/PrimeVue و auto-importها)
- بررسی چشمی: اجرای `npm run dev` و بازدید `/profile` و تبها در مرورگر (این مسیرها نیاز به لاگین دارند؛ در صورت در دسترس نبودن نشست احراز هویت، صراحتاً اعلام میشود که بررسی بصری انجام نشد).

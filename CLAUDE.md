# نیمورا — راهنمای مونوریپو برای Claude

نیمورا یک فروشگاه اینترنتی ایرانی برای لوازم آرایشی و بهداشتی است.
کاربران فارسی‌زبان هستند: همه‌ی متن‌های رابط کاربری **فارسی** و همه‌ی چیدمان‌ها **RTL** هستند.
کد، نام متغیرها و توابع، کامنت‌ها و پیام‌های commit به **انگلیسی** نوشته می‌شوند.
پاسخ‌های Claude به من (توضیحات، گزارش‌ها، برنامه‌ها) به **فارسی** باشد؛ اصطلاحات فنی را به انگلیسی بنویس.

## اهداف این ریپو (به ترتیب اولویت)
1. **تمیزی و ماژولار بودن** — ماژول‌های کوچک و تک‌منظوره؛ بدون کد تکراری بین اپ‌ها.
2. **پرفورمنس** — TTFB/LCP سریع، bundle کوچک، کوئری‌های بهینه‌ی دیتابیس.
3. **سئو (SEO)** — SSR/ISR درست، متاتگ‌ها، داده‌ی ساختاریافته، sitemap (چون فروشگاه عمومی است).
4. **امنیت و درستی** — ولیدیشن در مرزهای سیستم، transaction برای نوشتن‌های چندمرحله‌ای.
5. **قابل تکرار بودن** — همه‌چیز با Docker و یک‌سری دستور ثابت از ریشه اجرا شود.

## ساختار مونوریپو (ساختار هدف)

```
nimoura/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Nuxt 4 storefront (public site, SSR)
│   └── admin/        # Nuxt 4 admin panel (SPA mode is fine, no SEO needed)
├── packages/
│   ├── shared-types/ # DTO shapes, enums, API contracts shared by all apps
│   ├── ui/           # Shared Vue components (PrimeVue wrappers, design tokens)
│   ├── utils/        # Pure helpers (price/date formatting, Jalali dates, slugify)
│   ├── eslint-config/
│   └── tsconfig/
├── docker/           # Dockerfiles per app + compose files
├── turbo.json
├── pnpm-workspace.yaml
├── docker-compose.yml          # dev
├── docker-compose.prod.yml     # production
└── CLAUDE.md
```

پکیج‌منیجر: **pnpm** workspaces همراه با **Turborepo**. هرگز lockfile مربوط به npm یا yarn را وارد پروژه نکن.

## استک فنی

| بخش | استک |
|------|-------|
| `apps/api` | NestJS، TypeORM، PostgreSQL، class-validator / class-transformer |
| `apps/web` | Nuxt 4، Vue 3 (Composition API، `<script setup lang="ts">`)، Tailwind CSS 4، PrimeVue، Pinia، VueUse |
| `apps/admin` | همان استک فرانت‌اند `web` |
| زیرساخت | Docker، docker compose، کانتینر PostgreSQL |

## دستورهای رایج (از ریشه‌ی ریپو اجرا شوند)

```bash
pnpm install
pnpm dev                       # turbo run dev (all apps)
pnpm --filter api dev          # a single app
pnpm build                     # turbo run build
pnpm lint
pnpm typecheck
pnpm test
docker compose up -d           # full dev stack
```

اگر دستوری از بالا هنوز وجود ندارد، آن را در `package.json` یا `turbo.json` مناسب بساز و از اسکریپت‌های موقت و یک‌بارمصرف استفاده نکن.

## قواعد کار Claude

- **اول تحلیل، بعد تغییر.** برای هر کار غیرساده اول برنامه را توضیح بده و منتظر تأیید من بمان.
- **تغییرات کوچک و قابل بازبینی.** هر تغییر فقط یک دغدغه داشته باشد. هرگز refactor را با فیچر یا رفع باگ قاطی نکن.
- **هنگام refactor رفتار برنامه نباید خراب شود.** اگر کدی که جابه‌جا می‌کنی تست ندارد، همین را بگو و اول یک تست حداقلی پیشنهاد بده.
- **به این‌ها دست نزن:** فایل‌های `.env*`، secret ها و کانفیگ‌های production. فقط `.env.example` را ویرایش کن.
- **بدون وابستگی (dependency) جدید** مگر اینکه دلیلش را بگویی و بررسی کنی که ابزار موجود (VueUse، PrimeVue یا قابلیت‌های خود Node) کار را انجام نمی‌دهد.
- **هیچ کد مرده، بلوک کامنت‌شده یا `console.log`** باقی نگذار. فایل‌ها و importهای بلااستفاده‌ای که حین کار می‌بینی را حذف کن و گزارش بده.
- اگر چیزی مبهم است، به‌جای حدس زدن یک سؤال روشن بپرس.
- بعد از هر تسک گزارش بده: چه چیزی تغییر کرد، چه چیزی باید دستی تست شود، و چه چیزی باقی مانده.

## قواعد بکند (`apps/api`)

**ساختار**
- برای هر دامنه یک ماژول NestJS (`products`، `orders`، `categories`، `users`، `banners`، `uploads`، `torob` و...).
- لایه‌بندی: `controller` (فقط HTTP) ← `service` (منطق کسب‌وکار) ← `repository`/TypeORM (داده). کنترلرها منطق کسب‌وکار ندارند؛ سرویس‌ها `req`/`res` نمی‌خوانند.
- endpoint های ادمین در کنترلرهای جداگانه با guard صریح هستند (مثل `AdminOrdersController`) و با کنترلرهای عمومی قاطی نمی‌شوند.
- ارتباط بین ماژول‌ها از طریق سرویس‌های export شده انجام می‌شود، نه import مستقیم entity از داخل ماژول دیگر.

**داده و تراکنش**
- هر عملیاتی که در بیش از یک جدول می‌نویسد (سفارش + آیتم‌ها + پرداخت + ارسال، تغییرات موجودی) باید از transaction با `DataSource` (‏`queryRunner`) و commit/rollback/release درست استفاده کند.
- عملیات مربوط به سیستم‌های بیرونی (FTP، پرداخت، ترب) باید با دیتابیس هماهنگ بماند: هنگام شکست یک طرف از مرحله‌ی جبرانی (compensating، به سبک saga) استفاده کن.
- از N+1 پرهیز کن: `relations` یا `QueryBuilder` صریح بنویس و فقط ستون‌های لازم را select کن. برای ستون‌هایی که در `WHERE`/`ORDER BY`/کلید خارجی استفاده می‌شوند ایندکس بگذار.
- endpoint های لیستی همیشه pagination داشته باشند. هرگز لیست نامحدود برنگردان.
- تغییرات schema فقط با **migration**؛ `synchronize: true` جز روی دیتابیس‌های محلیِ موقت ممنوع است.

**ولیدیشن و قرارداد API**
- بدنه/کوئری هر درخواست یک DTO با `class-validator` است؛ `ValidationPipe` سراسری را با `whitelist: true`، `forbidNonWhitelisted: true` و `transform: true` فعال کن.
- وقتی entity فیلدهای داخلی دارد هرگز مستقیم برنگردانش؛ به response DTO مپ کن.
- ساختار یکسان برای خطاها با exception filter سراسری. ساختار یکسان برای لیست‌ها (`items`، `total`، `page`، `limit`).
- کانفیگ با `@nestjs/config` و اعتبارسنجی schema متغیرهای محیطی هنگام شروع اپ.

**آپلود**
- فایل‌ها را با magic bytes اعتبارسنجی کن، نه فقط پسوند/mimetype؛ از لیست مجاز پسوندها استفاده کن.
- تصاویر را با Sharp پردازش کن (تغییر اندازه، WebP/AVIF)، همزمانی را با `p-limit` محدود کن و هنگام شکست پاکسازی انجام بده.

**امنیت و عملیات**
- Helmet، لیست مجاز CORS، rate limiting روی احراز هویت و endpoint های حساس، پسوردهای hash شده، انقضا/refresh صریح JWT.
- endpoint ‏`/health` برای healthcheck داکر. لاگ ساختاریافته و بدون داده‌ی حساس.

## قواعد فرانت‌اند (`apps/web`، `apps/admin`)

**ساختار**
- از ساختار پوشه‌ی `app/` نوکست ۴ استفاده کن. هر جا مفید است بر اساس فیچر سازماندهی کن (`components/product/`، `components/checkout/` و...).
- کامپوننت‌ها: `<script setup lang="ts">`، ‏`defineProps` / `defineEmits` تایپ‌شده، هر کدام یک مسئولیت. اگر کامپوننتی از حدود ۲۵۰ خط گذشت، بشکنش.
- منطق در **composable** ها زندگی می‌کند (`useCart`، `useProducts` و...)، نه داخل کامپوننت‌ها. server state با `useFetch`/`useAsyncData` و کلید صریح؛ state سراسری سمت کلاینت فقط وقتی واقعاً مشترک است در **Pinia**.
- همه‌ی فراخوانی‌های API از یک لایه‌ی تایپ‌شده می‌گذرند (composable یا proxy با Nuxt server route). رشته‌های خام `$fetch` را بین کامپوننت‌ها پخش نکن.
- تایپ‌ها و توابع مشترک از `packages/*` می‌آیند، نه کپی‌شده بین `web` و `admin`.

**استایل**
- Tailwind CSS 4 با توکن‌های تم که در CSS تعریف می‌شوند (`@theme`)؛ بدون رنگ hex ثابت داخل کامپوننت‌ها.
- کامپوننت‌های PrimeVue هماهنگ با توکن‌ها تم شوند؛ کتابخانه‌ی UI دوم اضافه نکن.
- **اول RTL**: به‌جای `ml/mr/left/right` از کلاس‌های منطقی استفاده کن (`ms-*`، `me-*`، `ps-*`، `pe-*`، `text-start`، `start-0`). اسلایدرها، جهت swipe، آیکون‌ها (فلش و chevron) و progress/stepper ها را در RTL بررسی کن.
- ارقام فارسی و تاریخ شمسی از طریق توابع مشترک فرمت‌دهی، نه به‌صورت موردی در هر کامپوننت.

**امن بودن در SSR**
- هیچ چیزی که به `window`، `document`، `localStorage` یا `navigator` دست می‌زند نباید هنگام SSR اجرا شود. از `onMounted`، `import.meta.client` یا `<ClientOnly>` استفاده کن.
- از hydration mismatch دوری کن: در render از `Math.random()`/`Date.now()` استفاده نکن؛ تشخیص دستگاه با یک composable امن برای SSR (مثلاً بر پایه‌ی user-agent).

**پرفورمنس (سایت اصلی)**
- از `<NuxtImg>`/`<NuxtPicture>` با WebP/AVIF، width/height صریح، `loading="lazy"` برای پایین صفحه و `fetchpriority="high"` برای تصویر LCP استفاده کن.
- کامپوننت‌های سنگین، کاروسل‌ها، لایت‌باکس و پلیر ویدیو را lazy-load کن (پیشوند `Lazy` / `defineAsyncComponent`). کامپوننت‌های PrimeVue فقط on-demand ایمپورت شوند.
- از route rules استفاده کن: prerender یا ISR/SWR برای صفحات نیمه‌ثابت (خانه، دسته‌بندی‌ها)، SSR برای صفحات محصول، SPA برای ادمین و حساب کاربری.
- bundle را کنترل کن: خروجی `nuxi analyze` را مرور کن؛ برای کار کوچک کتابخانه‌ی بزرگ نیاور.
- هدف: Core Web Vitals در محدوده‌ی «خوب» روی موبایل (‏LCP < 2.5s، ‏CLS < 0.1، ‏INP < 200ms).

**سئو (فقط `apps/web`)**
- در هر صفحه‌ی عمومی `useSeoMeta` + `useHead`: عنوان و توضیح یکتا، canonical، Open Graph.
- داده‌ی ساختاریافته JSON-LD: ‏`Product` (قیمت، موجودی، امتیاز)، ‏`BreadcrumbList`، ‏`Organization`.
- Sitemap و robots (‏`@nuxtjs/sitemap`، ‏`@nuxtjs/robots`)، slug های تمیز و سازگار با فارسی، و `lang="fa"` و `dir="rtl"` روی `<html>`.
- صفحات ادمین و حساب کاربری `noindex` هستند.

**دسترس‌پذیری**
- HTML معنایی، label برای همه‌ی inputها، focus مرئی، alt فارسی برای تصاویر، و دیالوگ/drawer قابل دسترس با کیبورد.

## قواعد Docker

- برای هر اپ یک Dockerfile چندمرحله‌ای در `docker/` (‏deps ← build ← runtime حداقلی)، کاربر غیر root، و `.dockerignore` دقیق.
- سرویس‌های compose: ‏`postgres` (با named volume و healthcheck)، ‏`api`، ‏`web`، ‏`admin` و در صورت نیاز یک reverse proxy (Nginx/Traefik) برای production.
- از `depends_on` با `condition: service_healthy` استفاده کن. کانفیگ فقط از طریق متغیرهای محیطی / فایل‌های `.env` که در git نیستند؛ برای هر اپ `.env.example` commit شود.
- compose توسعه سورس را mount می‌کند (hot reload)؛ compose پروداکشن فقط از image های build شده استفاده می‌کند.
- از `turbo prune --docker` استفاده کن تا build ها کوچک و cache-friendly بمانند.

## قراردادهای Git

- یک branch برای هر تسک: `refactor/<scope>`، `feat/<scope>`، `fix/<scope>`.
- Conventional Commits به انگلیسی: `refactor(api): split orders service`.
- هرگز مستقیم روی `main` commit نزن. تاریخچه‌ی مشترک را بازنویسی نکن.
- هر branch قبل از «تمام شدن» باید build، lint و typecheck را رد کند.

## تعریف «تمام شدن» (برای هر تسک)

- [ ] build و typecheck روی اپ‌های درگیر موفق باشد
- [ ] lint موفق باشد و کد بلااستفاده باقی نمانده باشد
- [ ] رگرسیون رفتاری نداشته باشد (تست یا چک‌لیست دستی مستند)
- [ ] برای هر تغییر UI، RTL و موبایل بررسی شده باشد
- [ ] هیچ secret یا تغییری در `.env` commit نشده باشد
- [ ] خلاصه‌ی کوتاه نوشته شده باشد: چه تغییر کرد و چه چیزی باید تأیید شود

## مشکلات شناخته‌شده (بعد از اولین تحلیل پر شود)

<!-- Claude: بعد از ممیزی اولیه، یافته‌های مشخص را اینجا فهرست کن (ماژول‌های تکراری،
     ساختارهای ناهماهنگ API، کامپوننت‌های بیش‌ازحد بزرگ، ایندکس‌های ناموجود و...)
     تا همه‌چیز در یک‌جا پیگیری شود. -->

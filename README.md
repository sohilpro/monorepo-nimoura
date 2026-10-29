# 🌸 فروشگاه اینترنتی نیمورا (Nimoura Monorepo)

پروژه مونو‌ریپوی مدرن، ماژولار و بهینه‌سازی‌شده برای فروشگاه اینترنتی لوازم آرایشی و زیبایی **نیمورا**.

---

## 🏗️ ساختار مونو‌ریپو

```
monorepo-nimoura/
├── apps/
│   ├── api/                   # بکند NestJS 11 + TypeORM + PostgreSQL (@nimoura/api)
│   ├── web/                   # استورفرانت اصلی Nuxt 4 با SSR و سئو (@nimoura/web)
│   └── admin/                 # پنل مدیریت Nuxt 4 در حالت SPA (@nimoura/admin)
├── packages/
│   ├── shared-types/          # تایپ‌ها، مدل‌ها و Enumهای مشترک (@nimoura/shared-types)
│   ├── utils/                 # توابع خالص فرمت قیمت، تاریخ شمسی، اسلاگ (@nimoura/utils)
│   ├── ui/                    # توکن‌های Tailwind 4 و تم PrimeVue (@nimoura/ui)
│   ├── tsconfig/              # کانفیگ‌های پایه TypeScript (@nimoura/tsconfig)
│   └── eslint-config/         # قوانین یکپارچه ESLint (@nimoura/eslint-config)
├── docker/
│   ├── api.Dockerfile         # داکرفایل چندمرحله‌ای بکند (کاربر non-root)
│   ├── web.Dockerfile         # داکرفایل چندمرحله‌ای استورفرانت
│   ├── admin.Dockerfile       # داکرفایل چندمرحله‌ای پنل ادمین
│   └── nginx/
│       └── nginx.conf         # ریورس پروکسی و لودبالانسر Nginx
├── docker-compose.yml         # کامپوز توسعه (Postgres با healthcheck، هات‌لود)
├── docker-compose.prod.yml    # کامپوز پروداکشن (ایمیج‌های بیلد شده، Nginx)
├── turbo.json                 # پایپ‌لاین کش و بیلد موازی Turborepo
├── package.json               # ورک‌اسپیس npm
└── .env.example               # نمونه متغیرهای محیطی
```

---

## 🚀 راه‌اندازی سریع با npm و Turborepo

### ۱. نصب پیش‌نیازها و وابستگی‌ها
```bash
# نصب پکیج‌ها و اتصال خودکار ورک‌اسپیس‌ها
npm install
```

### ۲. تنظیم متغیرهای محیطی
یک فایل `.env` بر اساس `.env.example` در ریشه بسازید:
```bash
cp .env.example .env
```

### ۳. اجرای همزمان تمام برنامه‌ها در حالت توسعه
```bash
npm run dev
```

### ۴. اجرای یک برنامه خاص
```bash
# فقط بکند
npm run dev --workspace=@nimoura/api

# فقط استورفرانت
npm run dev --workspace=@nimoura/web

# فقط پنل ادمین
npm run dev --workspace=@nimoura/admin
```

### ۵. سایر دستورات
```bash
npm run build      # بیلد بهینه تمام پکیج‌ها با Turborepo
npm run lint       # بررسی کدها
npm run typecheck  # بررسی استاتیک تایپ‌ها در سراسر مونو‌ریپو
npm run test       # اجرای تست‌های یونیت
```

---

## 🐳 اجرای کانتینری با Docker

### محیط توسعه (Development Stack)
شامل دیتابیس PostgreSQL 16 همراه با Healthcheck خودکار و اتصال سرویس‌ها:
```bash
docker compose up -d
```
* **سایت فروشگاه:** http://localhost:3000
* **پنل مدیریت:** http://localhost:3001
* **اندپوینت سلامت API:** http://localhost:4000/api/v1/health
* **مستندات Swagger استور:** http://localhost:4000/docs/store
* **مستندات Swagger ادمین:** http://localhost:4000/docs/admin

### محیط پروداکشن (Production Stack)
شامل کانتینرهای بهینه با ایمیج‌های چندمرحله‌ای، کاربر ایمن غیر روت و ریورس پروکسی Nginx:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
در محیط پروداکشن، Nginx تمام ترافیک پورت ۸۰/۴۴۳ را به صورت خودکار به سرویس‌های مربوطه هدایت می‌کند:
* `/api/*` و `/uploads/*` به بکند
* `/admin/*` به پنل مدیریت
* `/` به فرانت‌استور (SSR)

---

## 🛡️ ویژگی‌های کلیدی پیاده‌سازی شده
1. **Type Safety سراسری:** تایپ‌ها و انتیتی‌ها به صورت همگام در `@nimoura/shared-types` قرار دارند.
2. **امنیت بالا:** حذف سکرت‌های هاردکد شده، اعتبارسنجی متغیرهای محیطی هنگام استارت، و حفاظت از پنل ادمین با گارد دسترسی و هدر `noindex`.
3. **سئو استاندارد:** کشینگ SWR، داده‌های ساختاریافته JSON-LD (محصول، دسته‌بندی و سازمان) و تولید متاتگ‌های Open Graph.
4. **پرفورمنس:** کش بیلد Turborepo، حذف کدهای مرده CSS و ایمپورت اشتراکی توکن‌ها و کامپوننت‌ها.

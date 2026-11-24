<template>
  <main class="min-h-screen bg-nimoura-base pb-16 sm:pb-24">
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۱. هدر صفحه، بردکرامب و باکس جستجو (Breadcrumb, Ambient Hero & Live Search) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <header class="relative overflow-hidden border-b border-nimoura-primary/10 bg-linear-to-b from-[#F9EDEE] via-[#FFF5F2] to-nimoura-base pt-4 pb-12 sm:pb-16">
      <!-- هاله‌های نوری دکوراتیو (Ambient Glow Orbs) -->
      <div class="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-nimoura-primary/15 blur-3xl" />
      <div class="pointer-events-none absolute top-1/2 -left-20 size-72 rounded-full bg-nimoura-accent/20 blur-3xl" />

      <div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <!-- بردکرامب ناوبری -->
        <UtilsBreadCrumb :items="breadcrumbItems" class="mb-6 sm:mb-8" />

        <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- ستون محتوای هیرو -->
          <div class="space-y-4 text-center lg:col-span-7 lg:text-start sm:space-y-6">
            <!-- بج طلایی معرفی -->
            <div class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md">
              <i class="pi pi-question-circle text-xs" />
              <span>پاسخ سریع به تمامی ابهامات و پرسش‌های شما</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1 class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl">
              پرسش‌های متداول؛
              <span class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent">
                راهنمای جامع خرید از نیمورا
              </span>
            </h1>

            <!-- توضیحات مقدمه -->
            <p class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose">
              در این بخش پاسخ به رایج‌ترین سوالات همراهان عزیز درباره نحوه انتخاب و ثبت سفارش، شیوه‌های ارسال و بسته‌بندی، سقف ارسال رایگان، روش‌های پرداخت آنلاین، تضمین ۱۰۰٪ اصالت و شرایط گارانتی ۷ روزه مرجوعی گردآوری شده است تا خریدی آسوده، شفاف و مطمئن را تجربه فرمایید.
            </p>

            <!-- فیلد جستجوی زنده در سوالات -->
            <div class="relative mx-auto max-w-lg lg:mx-0">
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-nimoura-primary">
                <i class="pi pi-search text-base" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="کلمه مورد نظر خود را جستجو کنید (مثال: ارسال رایگان، مرجوعی، تخفیف، اصالت)..."
                class="w-full rounded-2xl border border-nimoura-primary/30 bg-white py-3.5 pr-10 pl-10 text-xs text-nimoura-text-900 shadow-sm transition-all focus:border-nimoura-primary focus:outline-none focus:ring-4 focus:ring-nimoura-primary/15 sm:text-sm"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-nimoura-text-400 hover:text-nimoura-text-700"
                @click="searchQuery = ''"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>

            <!-- ۴ شاخص دسته‌بندی سریع -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in faqHighlights"
                :key="idx"
                class="flex flex-col items-center rounded-2xl border border-nimoura-primary/15 bg-white/90 p-3 text-center shadow-2xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-nimoura-primary/40 lg:items-start lg:text-start sm:p-4"
              >
                <div class="mb-2 flex size-9 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
                  <i :class="`pi ${stat.icon} text-base`" />
                </div>
                <span class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm">{{ stat.title }}</span>
                <span class="text-[11px] text-nimoura-text-500">{{ stat.subtitle }}</span>
              </div>
            </div>
          </div>

          <!-- ستون بنر / تصویر هیرو -->
          <div class="lg:col-span-5">
            <!-- 📷 PLACEHOLDER: بنر شاخص هدر سوالات متداول -->
            <div
              class="group relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-nimoura-primary/30 bg-linear-to-br from-white/95 via-nimoura-primary/5 to-nimoura-accent/10 p-6 text-center shadow-sm transition-all duration-300 hover:border-nimoura-primary/60 hover:shadow-md"
              aria-label="محل قرارگیری تصویر بنر سوالات متداول"
            >
              <div class="flex size-16 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-nimoura-primary/20 transition-transform duration-300 group-hover:scale-105">
                <i class="pi pi-question-circle text-2xl text-nimoura-primary" />
              </div>
              <p class="mt-4 font-vazir text-sm font-bold text-nimoura-text-800">
                محل قرارگیری تصویر شاخص / راهنمای خریداران
              </p>
              <p class="mt-1 text-xs text-nimoura-text-500">
                ابعاد پیشنهادی: ۷۰۰ × ۵۰۰ پیکسل (تصویرسازی سه‌بعدی یا اینفوگرافیک پرسش و پاسخ)
              </p>
              <span class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-nimoura-primary/10 px-3 py-1 text-[11px] font-medium text-nimoura-primary">
                <i class="pi pi-camera text-[10px]" />
                Image Placeholder
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۲. فیلتر دسته‌بندی موضوعی سوالات (Category Filter Chips) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-8 px-4 sm:mt-12 sm:px-6 lg:px-8" aria-label="فیلتر دسته‌بندی موضوعی سوالات">
      <div class="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-nimoura-primary/15 bg-white/90 p-3 shadow-2xs backdrop-blur-sm sm:gap-2.5 sm:p-4">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          :class="[
            'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm',
            activeCategory === cat.id
              ? 'bg-nimoura-primary text-white shadow-xs'
              : 'border border-nimoura-text-100 bg-nimoura-base/50 text-nimoura-text-700 hover:border-nimoura-primary/40 hover:bg-nimoura-primary/10 hover:text-nimoura-primary'
          ]"
          @click="activeCategory = cat.id"
        >
          <i :class="`pi ${cat.icon} text-xs`" />
          <span>{{ cat.label }}</span>
          <span
            :class="[
              'rounded-full px-1.5 py-0.2 text-[10px]',
              activeCategory === cat.id
                ? 'bg-white/20 text-white'
                : 'bg-nimoura-primary/10 text-nimoura-primary'
            ]"
          >
            {{ getCategoryCount(cat.id) }}
          </span>
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۳. لیست سوالات با PrimeVue Accordion (FAQ Accordion List) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-8 px-4 sm:mt-12 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10 lg:p-12">
        <!-- وضعیت جستجو / نتایج -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-2">
            <span class="font-modam text-base font-bold text-nimoura-text-900 sm:text-xl">
              {{ currentCategoryTitle }}
            </span>
            <Tag :value="`${filteredFaqs.length} پرسش`" severity="secondary" class="text-xs" />
          </div>

          <div v-if="searchQuery" class="flex items-center gap-2 text-xs text-nimoura-text-600">
            <span>نتیجه جستجو برای: «<strong>{{ searchQuery }}</strong>»</span>
            <button
              type="button"
              class="text-xs font-bold text-nimoura-primary underline hover:text-nimoura-velvet"
              @click="searchQuery = ''"
            >
              پاک کردن جستجو
            </button>
          </div>
        </div>

        <!-- پیام عدم یافتن نتیجه در صورت جستجوی بدون نتیجه -->
        <div
          v-if="filteredFaqs.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div class="flex size-16 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
            <i class="pi pi-search-minus text-2xl" />
          </div>
          <h3 class="mt-4 font-vazir text-base font-bold text-nimoura-text-900 sm:text-lg">
            متاسفانه پرسشی متناسب با عبارت جستجوی شما یافت نشد
          </h3>
          <p class="mt-1 max-w-md text-xs text-nimoura-text-500 sm:text-sm">
            می‌توانید با کلمات کلیدی دیگری جستجو کنید یا مستقیماً از طریق پشتیبانی آنلاین یا تیکت، سوال خود را با کارشناسان نیمورا در میان بگذارید.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-nimoura-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-nimoura-primary/90"
            @click="searchQuery = ''; activeCategory = 'all'"
          >
            <span>نمایش همه سوالات</span>
            <i class="pi pi-refresh text-xs" />
          </button>
        </div>

        <!-- کامپوننت PrimeVue Accordion -->
        <Accordion
          v-else
          :value="activeAccordionValue"
          class="space-y-3"
        >
          <AccordionPanel
            v-for="(faq, idx) in filteredFaqs"
            :key="faq.id"
            :value="faq.id"
            class="overflow-hidden rounded-2xl border border-nimoura-text-100/90 transition-all duration-200 hover:border-nimoura-primary/30"
          >
            <AccordionHeader class="font-vazir text-sm font-bold text-nimoura-text-800 transition-colors sm:text-base">
              <div class="flex items-center gap-2.5">
                <span class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary text-xs">
                  {{ idx + 1 }}
                </span>
                <span class="leading-snug">{{ faq.question }}</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="pt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose">
                <p>{{ faq.answer }}</p>
                <div v-if="faq.link" class="mt-3 pt-2">
                  <NuxtLink
                    :to="faq.link.href"
                    class="inline-flex items-center gap-1.5 text-xs font-bold text-nimoura-primary hover:underline"
                  >
                    <span>{{ faq.link.label }}</span>
                    <i class="pi pi-arrow-left text-[10px]" />
                  </NuxtLink>
                </div>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. باکس پشتیبانی و پاسخگویی اختصاصی (Support CTA) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-[#F6E9EB] via-[#FFF8F4] to-[#F6E9EB] p-6 shadow-sm sm:p-10">
        <div class="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-nimoura-primary/10 blur-3xl" />

        <div class="grid items-center gap-8 lg:grid-cols-12">
          <div class="space-y-3 text-center lg:col-span-8 lg:text-start">
            <Tag value="پاسخگویی سریع و صمیمانه" severity="contrast" class="text-xs" />

            <h2 class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl">
              پاسخ پرسش خود را پیدا نکردید؟
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              اگر پرسش شما در میان موارد بالا قرار نداشت یا نیازمند راهنمایی بیشتر درباره وضعیت سفارش یا انتخاب محصولات متناسب با پوست خود هستید، تیم پشتیبانی نیمورا همواره در کنار شماست.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4">
              <!-- دکمه ثبت تیکت -->
              <Button
                as="router-link"
                to="/profile/tickets"
                icon="pi pi-ticket"
                label="ثبت تیکت آنلاین در پنل"
                class="bg-nimoura-primary! border-nimoura-primary! text-white! rounded-xl! font-vazir! text-xs! sm:text-sm! px-5! py-3!"
              />

              <!-- تماس تلفنی -->
              <NuxtLink
                to="tel:09036039314"
                class="inline-flex items-center gap-2 rounded-xl border border-nimoura-primary/30 bg-white px-4 py-3 text-xs font-bold text-nimoura-text-800 shadow-2xs transition-all hover:bg-nimoura-primary/10 sm:text-sm"
              >
                <i class="pi pi-phone text-nimoura-primary" />
                <span dir="ltr">09036039314</span>
              </NuxtLink>

              <!-- واتساپ -->
              <NuxtLink
                to="https://wa.me/989021027574"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white px-4 py-3 text-xs font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 sm:text-sm"
              >
                <i class="pi pi-whatsapp text-emerald-600 text-sm" />
                <span>پشتیبانی واتساپ</span>
              </NuxtLink>

              <!-- صفحه تماس با ما -->
              <NuxtLink
                to="/contact-us"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-nimoura-primary hover:underline"
              >
                <span>مشاهده سایر راه‌های ارتباطی</span>
                <i class="pi pi-arrow-left text-[10px]" />
              </NuxtLink>
            </div>
          </div>

          <!-- 📷 PLACEHOLDER: بنر پشتیبانی و همراهی مشتریان -->
          <div class="lg:col-span-4">
            <div
              class="group flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-nimoura-primary/30 bg-white/80 p-4 text-center transition-all hover:border-nimoura-primary/60"
              aria-label="محل تصویر مرکز پاسخگویی نیمورا"
            >
              <div class="flex size-12 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
                <i class="pi pi-headphones text-xl" />
              </div>
              <p class="mt-2 font-vazir text-xs font-bold text-nimoura-text-800">
                محل تصویر مرکز پشتیبانی و مشاوره بیوتی نیمورا
              </p>
              <span class="mt-1 text-[11px] text-nimoura-text-400">ابعاد: ۵۰۰ × ۳۵۰ پیکسل</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// ═════════════════════════════════════════════════════════════════════════════
// دیتای بردکرامب و آدرس‌ها
// ═════════════════════════════════════════════════════════════════════════════
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.ir';
const canonicalUrl = `${siteUrl}/faq`;

const breadcrumbItems = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'سوالات متداول' },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص کلیدی بالای صفحه
// ═══════════════════════════════════════════════════════════════════════════
const faqHighlights = [
  {
    icon: 'pi-shopping-bag',
    title: 'سفارش و تحویل',
    subtitle: 'پیگیری، زمان‌بندی و ارسال',
  },
  {
    icon: 'pi-credit-card',
    title: 'پرداخت و تخفیف',
    subtitle: 'درگاه‌های امن و کیف پول',
  },
  {
    icon: 'pi-verified',
    title: 'اصالت ۱۰۰٪ کالا',
    subtitle: 'استعلام بچ‌کد و انقضا',
  },
  {
    icon: 'pi-refresh',
    title: 'مرجوعی و گارانتی',
    subtitle: 'مهلت ۷ روزه و استرداد وجه',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// دسته‌بندی‌های موضوعی سوالات
// ═══════════════════════════════════════════════════════════════════════════
const categories = [
  { id: 'all', label: 'همه سوالات', icon: 'pi-list' },
  { id: 'orders', label: 'سفارش و پیگیری', icon: 'pi-shopping-bag' },
  { id: 'shipping', label: 'ارسال و تحویل', icon: 'pi-send' },
  { id: 'payment', label: 'پرداخت و کیف پول', icon: 'pi-wallet' },
  { id: 'authenticity', label: 'اصالت و کیفیت کالا', icon: 'pi-verified' },
  { id: 'returns', label: 'مرجوعی و گارانتی', icon: 'pi-refresh' },
  { id: 'account', label: 'حساب و امنیت', icon: 'pi-user' },
];

const activeCategory = ref('all');
const searchQuery = ref('');

// ═════════════════════════════════════════════════════════════════════════════
// بانک جامع سوالات و پاسخ‌ها (FAQ Data)
// ═══════════════════════════════════════════════════════════════════════════
const allFaqs = [
  // ── دسته سفارش و پیگیری ──
  {
    id: 'orders-1',
    category: 'orders',
    question: 'چگونه در فروشگاه اینترنتی نیمورا سفارش خود را ثبت کنم؟',
    answer: 'برای ثبت سفارش کافیست وارد سایت شده، محصول یا محصولات مورد نظر خود را انتخاب کرده و بر روی دکمه «افزودن به سبد خرید» کلیک فرمایید. سپس با ورود به سبد خرید و طی مراحل ساده شامل وارد کردن شماره همراه، ثبت آدرس پستی و پرداخت آنلاین از طریق درگاه‌های امن، سفارش شما نهایی شده و کد پیگیری صادر می‌گردد.',
  },
  {
    id: 'orders-2',
    category: 'orders',
    question: 'آیا برای خرید کالا حتماً باید در سایت حساب کاربری داشته باشم؟',
    answer: 'بله. عضویت در سایت نیمورا از طریق شماره تلفن همراه و دریافت کد تایید یکبار مصرف (OTP) تنها در چند ثانیه انجام می‌شود. این فرآیند جهت صدور فاکتور رسمی الکترونیکی، ثبت آدرس دقیق جهت ارسال پستی، بهره‌مندی از خدمات گارانتی و شارژ کیف پول الزامی است.',
  },
  {
    id: 'orders-3',
    category: 'orders',
    question: 'آیا بعد از ثبت سفارش می‌توانم اقلام، آدرس یا زمان تحویل را ویرایش کنم؟',
    answer: 'تا زمانی که وضعیت سفارش در پنل کاربری شما «در انتظار بررسی» باشد، می‌توانید از طریق تماس با پشتیبانی نیمورا درخواست ویرایش آدرس یا اقلام را ثبت فرمایید. در صورتی که بسته بسته‌بندی شده و تحویل شرکت پست شده باشد، امکان تغییر اطلاعات مقدور نخواهد بود.',
  },
  {
    id: 'orders-4',
    category: 'orders',
    question: 'آیا امکان ثبت سفارش به صورت تلفنی یا پیام در شبکه‌های اجتماعی وجود دارد؟',
    answer: 'جهت جلوگیری از هرگونه خطای انسانی در ثبت آدرس، صدور فاکتور رسمی و اختصاص تخفیف‌های سیستمی، کلیه سفارش‌ها باید مستقیماً از طریق وب‌سایت نیمورا ثبت گردند. با این حال همکاران ما در واتساپ و تلفن در تمام مراحل ثبت سفارش به عنوان راهنما در کنار شما هستند.',
  },

  // ── دسته ارسال و تحویل ──
  {
    id: 'shipping-1',
    category: 'shipping',
    question: 'هزینه ارسال سفارش چقدر است و چگونه ارسال رایگان می‌شود؟',
    answer: 'هزینه ارسال پستی برای تمامی سفارش‌ها طبق تعرفه استاندارد شرکت ملی پست محاسبه می‌گردد. با این حال، اگر مجموع سبد خرید شما به مبلغ ۴٬۰۰۰٬۰۰۰ تومان یا بیشتر برسد، هزینه ارسال به طور کامل رایگان شده و توسط نیمورا پرداخت می‌شود.',
    link: { label: 'مشاهده قوانین ارسال و پرداخت', href: '/shipping-pay' },
  },
  {
    id: 'shipping-2',
    category: 'shipping',
    question: 'سفارش من چند روز پس از ثبت به دستم می‌رسد؟',
    answer: 'تمامی سفارش‌ها ظرف حداکثر ۲۴ ساعت کاری در انبار پردازش و تحویل شرکت پست می‌شوند. زمان تحویل پست پیشتاز برای شهر تهران ۲۴ الی ۴۸ ساعت و برای سایر شهرستان‌ها ۲ الی ۴ روز کاری است. همچنین برای خریداران تهران و کرج امکان هماهنگی ارسال با پیک درون‌شهری در همان‌روز نیز فراهم است.',
  },
  {
    id: 'shipping-3',
    category: 'shipping',
    question: 'چگونه می‌توانم بسته پستی خود را به صورت لحظه‌ای رهگیری کنم؟',
    answer: 'به محض تحویل مرسوله به باجه پستی، یک کد رهگیری ۲۴ رقمی پستی از طریق پیامک برای شما ارسال می‌شود. شما می‌توانید با وارد کردن این کد در سامانه tracking.post.ir یا مراجعه به بخش «سفارش‌های من» در پنل کاربری، وضعیت ثانیه‌به‌ثانیه بسته را مشاهده فرمایید.',
  },
  {
    id: 'shipping-4',
    category: 'shipping',
    question: 'آیا بسته‌بندی اقلام حساس و شکستنی مانند سرم‌های شیشه‌ای و پالت‌های پودری ایمن است؟',
    answer: 'بله، کاملاً. نیمورا پروتکل استاندارد بسته‌بندی ضدضربه دارد؛ هر محصول با چند لایه نایلون حباب‌دار بالشتکی (Bubble Wrap) پوشانده شده، درب ظروف جهت عدم نشتی آب‌بندی گردیده و در کارتن‌های ۵ لایه مستحکم پستی با چسب امنیتی قرار می‌گیرد. همچنین در صورت هرگونه آسیب در حین حمل، ضمانت جبران خسارت نیمورا حامی شماست.',
  },
  {
    id: 'shipping-5',
    category: 'shipping',
    question: 'آیا می‌توانم سفارش را به عنوان هدیه برای شخص دیگری ارسال کنم؟',
    answer: 'بله. در مرحله تسویه حساب (Checkout) می‌توانید تیک گزینه «گیرنده شخص دیگری است» را فعال کرده و نام، شماره تماس و آدرس شخص مورد نظر را وارد نمایید. مرسوله با بسته‌بندی شکیل و بدون درج فاکتور قیمت‌دار مستقیماً برای ایشان ارسال می‌گردد.',
  },

  // ── دسته پرداخت و کیف پول ──
  {
    id: 'payment-1',
    category: 'payment',
    question: 'از چه روش‌هایی می‌توانم هزینه سفارش خود را پرداخت کنم؟',
    answer: 'شما می‌توانید هزینه سفارش را از طریق درگاه‌های آنلاین امن زرین‌پال (پشتیبانی از تمامی کارت‌های عضو شتاب)، درگاه پرداخت ترب‌پی (TorobPay)، و همچنین به صورت اعتباری از طریق موجودی کیف پول کاربری نیمورا پرداخت فرمایید.',
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: 'آیا امکان پرداخت در محل (پس‌کرایه / COD) وجود دارد؟',
    answer: 'خیر. به دلیل ضوابط بهداشتی انبارداری اقلام آرایشی و موازین ناوگان پستی، تسویه تمامی سفارش‌ها به صورت اینترنتی و در بستر امن شبکه شاپرک پیش از ارسال صورت می‌پذیرد تا کالا در سریع‌ترین زمان ممکن تحویل پست گردد.',
  },
  {
    id: 'payment-3',
    category: 'payment',
    question: 'اگر هنگام پرداخت آنلاین پول از حسابم کسر شد اما سفارش ثبت نشد چه کنم؟',
    answer: 'در موارد نادری که به دلیل اختلال ارتباطی اینترنت سفارش نهایی نشود، وجه کسر شده در شبکه بین‌بانکی شاپرک بلوکه شده و نهایتاً ظرف حداکثر ۷۲ ساعت کاری خودکار به حسابتان بازمی‌گردد. در غیر این صورت، با ارسال شماره پیگیری به پشتیبانی، موضوع بلافاصله استعلام خواهد شد.',
  },
  {
    id: 'payment-4',
    category: 'payment',
    question: 'چگونه می‌توانم از کدهای تخفیف، بن‌های خرید یا کد معرف استفاده کنم؟',
    answer: 'در مرحله بازبینی و تکمیل سفارش، کادری مخصوص درج کد تخفیف تعبیه شده است. پس از وارد کردن کد و کلیک بر روی دکمه اعمال، مبلغ تخفیف بلافاصله از جمع کل فاکتور کسر می‌شود. توجه فرمایید در هر فاکتور تنها امکان استفاده از یک کد تخفیف وجود دارد.',
  },
  {
    id: 'payment-5',
    category: 'payment',
    question: 'کیف پول کاربری نیمورا چیست و چگونه می‌توانم از بونوس هدیه آن استفاده کنم؟',
    answer: 'کیف پول یک اعتبار نقدی درون‌برنامه‌ای است که در مواردی نظیر مرجوعی کالا، پاداش وفاداری خرید اول، یا کمپین‌های مناسبتی شارژ می‌شود. هنگام شارژ کیف پول در پروموشن‌ها، تا ۳٪ اعتبار هدیه اضافه نیز به حسابتان تعلق می‌گیرد که در خریدهای بعدی قابل خرج است.',
  },

  // ── دسته اصالت و کیفیت کالا ──
  {
    id: 'authenticity-1',
    category: 'authenticity',
    question: 'آیا تمامی محصولات عرضه‌شده در نیمورا کاملاً اورجینال هستند؟',
    answer: 'بله، ۱۰۰٪ و بدون هیچ استثنایی. تمامی محصولات موجود در فروشگاه نیمورا مستقیماً از نمایندگی‌های رسمی، واردکنندگان قانونی معتبر و کمپانی‌های مبدا تامین می‌شوند. ضمانت بازگشت وجه در صورت هرگونه عدم اصالت، تعهد قطعی ما به همراهان است.',
    link: { label: 'مطالعه منشور اصالت درباره ما', href: '/about-us' },
  },
  {
    id: 'authenticity-2',
    category: 'authenticity',
    question: 'چگونه می‌توانم از تاریخ انقضا و بچ‌کد (Batch Code) محصولات مطمئن شوم؟',
    answer: 'تمامی محصولات دارای تاریخ انقضای معتبر و تازه هستند. شما می‌توانید بچ‌کد چاپ‌شده روی محصول یا زیر کارتن را در سامانه‌های جهانی استعلام اصالت و تاریخ تولید (مانند CheckFresh و CheckCosmetic) استعلام فرمایید.',
  },
  {
    id: 'authenticity-3',
    category: 'authenticity',
    question: 'محصولات در چه شرایط محیطی و دمایی انبارداری می‌شوند؟',
    answer: 'انبار مرکزی نیمورا مجهز به سامانه هوشمند کنترل دما، رطوبت بهینه و تهویه ۲۴ ساعته متناسب با استانداردهای داروسازی و سازمان غذا و دارو است تا ترکیبات فعال، آنتی‌اکسیدان‌ها و بافت کرم‌ها و سرم‌ها در بالاترین سطح اثربخشی حفظ شوند.',
  },

  // ── دسته مرجوعی و گارانتی ──
  {
    id: 'returns-1',
    category: 'returns',
    question: 'مهلت و شرایط بازگرداندن کالا (مرجوعی) در نیمورا چگونه است؟',
    answer: 'خریداران محترم طبق قوانین تا ۷ روز پس از دریافت بسته فرصت دارند در صورت وجود مغایرت کالا، شکستگی ناشی از حمل پستی، یا انصراف از خرید (به شرط دست‌نخورده ماندن کامل پلمپ و سلفون بهداشتی) درخواست مرجوعی خود را ثبت فرمایند.',
    link: { label: 'راهنمای کامل رویه بازگرداندن کالا', href: '/return-policy' },
  },
  {
    id: 'returns-2',
    category: 'returns',
    question: 'چرا لوازم آرایشی و بهداشتی باز شده یا تست‌شده قابل مرجوعی نیستند؟',
    answer: 'مطابق موازین رسمی وزارت بهداشت، محصولات آرایشی و مراقبتی به دلیل تماس مستقیم با بافت پوست، چشم و مو، جزو اقلام استریل و سلامت‌محور تلقی می‌شوند و پس از باز شدن پلمپ یا سلفون، به هیچ عنوان قابلیت فروش مجدد ندارند. این قانون ضامن دریافت کالای کاملاً بکر و بهداشتی برای همه خریداران است.',
  },
  {
    id: 'returns-3',
    category: 'returns',
    question: 'در صورت شکستگی یا آسیب دیدن کالا در حین جابجایی پستی چه اقدامی باید انجام دهم؟',
    answer: 'کافیست ظرف حداکثر ۲۴ ساعت اولیه پس از تحویل، از کارتن مرسوله و کالای آسیب‌دیده عکس و ویدیوی واضح تهیه فرمایید و در بخش تیکت‌های پشتیبانی یا پیام‌رسان واتساپ ارسال نمایید. نیمورا بلافاصله کالای جایگزین را ارسال کرده یا مبلغ را مسترد می‌دارد.',
  },
  {
    id: 'returns-4',
    category: 'returns',
    question: 'استرداد وجه مرجوعی چقدر طول می‌کشد و هزینه پست با چه کسی است؟',
    answer: 'پس از تایید واحد کنترل کیفیت (QC) انبار ظرف ۲۴ تا ۴۸ ساعت، وجه ظرف ۲۴ الی ۷۲ ساعت به شماره شبا خریدار واریز می‌گردد. در صورت قصور نیمورا، تمامی هزینه‌های پستی با نیمورا بوده و در صورت انصراف سلیقه‌ای با پلمپ سالم، هزینه پست برگشت با مشتری خواهد بود.',
  },

  // ── دسته حساب کاربری و امنیت ──
  {
    id: 'account-1',
    category: 'account',
    question: 'چگونه می‌توانم آدرس، شماره تماس یا مشخصات پروفایل خود را ویرایش کنم؟',
    answer: 'با کلیک بر روی آیکون پروفایل و ورود به حساب کاربری، می‌توانید در بخش «اطلاعات حساب» نام و مشخصات خود را ویرایش کنید و در بخش «آدرس‌ها» نشانی‌های جدید پستی خود را اضافه یا حذف نمایید.',
  },
  {
    id: 'account-2',
    category: 'account',
    question: 'در صورت عدم دریافت کد تایید پیامکی (OTP) چه اقدامی باید انجام دهم؟',
    answer: 'ابتدا مطمئن شوید خط تلفن همراه شما در محدوده پوشش آنتن‌دهی قرار دارد و پیامک‌های تبلیغاتی روی خط مسدود نشده باشند. پس از پایان شمارش معکوس تایمر (معمولاً ۲ دقیقه)، می‌توانید بر روی دکمه «ارسال مجدد کد» کلیک فرمایید.',
  },
  {
    id: 'account-3',
    category: 'account',
    question: 'آیا اطلاعات هویتی و سوابق خریدهای من در نیمورا امن هستند؟',
    answer: 'بله، کاملاً. وب‌سایت نیمورا از پروتکل‌های رمزنگاری پیشرفته SSL 256-Bit استفاده می‌کند و متعهد است اطلاعات هویتی، آدرس‌ها و تاریخچه سفارشات خریداران را محرمانه نگه دارد و در اختیار هیچ نهاد یا شخص ثالثی قرار ندهد.',
    link: { label: 'مطالعه منشور قوانین و حریم خصوصی', href: '/rules' },
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// فیلتر هوشمند سوالات بر اساس دسته‌بندی و عبارت جستجو
// ═══════════════════════════════════════════════════════════════════════════
const filteredFaqs = computed(() => {
  return allFaqs.filter((faq) => {
    // فیلتر دسته
    const matchesCategory =
      activeCategory.value === 'all' || faq.category === activeCategory.value;

    // فیلتر جستجو
    const query = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
});

const currentCategoryTitle = computed(() => {
  if (searchQuery.value) return 'نتایج جستجوی سوالات';
  const cat = categories.find((c) => c.id === activeCategory.value);
  return cat ? cat.label : 'همه سوالات';
});

function getCategoryCount(catId: string): number {
  if (catId === 'all') return allFaqs.length;
  return allFaqs.filter((f) => f.category === catId).length;
}

const activeAccordionValue = computed(() => {
  if (filteredFaqs.value.length > 0) {
    return filteredFaqs.value[0].id;
  }
  return '';
});

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: 'سوالات متداول | راهنمای کامل خرید، ارسال و اصالت در فروشگاه نیمورا (Nimoura)',
  description:
    'پاسخ به تمامی سوالات متداول خریداران درباره نحوه ثبت سفارش، رهگیری مرسولات پستی، ارسال رایگان، روش‌های پرداخت آنلاین، تضمین اصالت و شرایط مرجوعی در فروشگاه اینترنتی نیمورا.',
  keywords:
    'سوالات متداول نیمورا, راهنمای خرید نیمورا, پیگیری سفارش نیمورا, هزینه پست نیمورا, اصالت کالاهای نیمورا, سوالات رایج خرید اینترنتی لوازم آرایشی, گارانتی مرجوعی نیمورا',
  ogTitle: 'سوالات متداول و راهنمای جامع خرید از فروشگاه نیمورا',
  ogDescription:
    'پاسخ سریع به تمامی پرسش‌ها درباره ارسال رایگان، پرداخت آنلاین، تست اصالت و شرایط مرجوعی کالا در نیمورا.',
  ogImage: `${siteUrl}/og-image.webp`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogSiteName: 'Nimoura | نیمورا',
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
  twitterTitle: 'سوالات متداول | فروشگاه اینترنتی نیمورا',
  twitterDescription:
    'راهنمای جامع پاسخ به پرسش‌های رایج درباره ارسال، پرداخت، اصالت و پیگیری سفارشات در نیمورا.',
  twitterImage: `${siteUrl}/og-image.webp`,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1',
  author: 'فروشگاه اینترنتی نیمورا',
});

// ═══════════════════════════════════════════════════════════════════════════
// استراکچرد دیتاهای اسکیما (Schema.org JSON-LD Structured Data)
// ۱. WebPage Schema
// ۲. BreadcrumbList Schema
// ۳. FAQPage Schema (Google Rich Snippets)
// ═══════════════════════════════════════════════════════════════════════════
useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    // ۱. WebPage Schema
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'سوالات متداول فروشگاه اینترنتی نیمورا',
        description:
          'پاسخ به سوالات پرتکرار خریداران در زمینه ثبت سفارش، شیوه‌های ارسال، پرداخت آنلاین، تضمین اصالت و مرجوعی کالا در نیمورا.',
        url: canonicalUrl,
        inLanguage: 'fa-IR',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Nimoura',
          url: siteUrl,
        },
      }),
    },
    // ۲. BreadcrumbList Schema
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'سوالات متداول',
            item: canonicalUrl,
          },
        ],
      }),
    },
    // ۳. FAQPage Schema (Google Rich Snippets)
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: allFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }),
    },
  ],
});
</script>

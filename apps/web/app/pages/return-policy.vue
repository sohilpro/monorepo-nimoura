<template>
  <main class="min-h-screen bg-nimoura-base pb-16 sm:pb-24">
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۱. هدر صفحه و بردکرامب (Breadcrumb & Ambient Hero) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <header
      class="relative overflow-hidden border-b border-nimoura-primary/10 bg-linear-to-b from-[#F9EDEE] via-[#FFF5F2] to-nimoura-base pt-4 pb-12 sm:pb-16"
    >
      <!-- هاله‌های نوری دکوراتیو (Ambient Glow Orbs) -->
      <div
        class="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-nimoura-primary/15 blur-3xl"
      />
      <div
        class="pointer-events-none absolute top-1/2 -left-20 size-72 rounded-full bg-nimoura-accent/20 blur-3xl"
      />

      <div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <!-- بردکرامب ناوبری -->
        <UtilsBreadCrumb :items="breadcrumbItems" class="mb-6 sm:mb-8" />

        <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- ستون محتوای هیرو (سمت راست در RTL) -->
          <div
            class="space-y-4 text-center lg:col-span-7 lg:text-start sm:space-y-6"
          >
            <!-- بج طلایی گارانتی -->
            <div
              class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md"
            >
              <i class="pi pi-sparkles text-xs" />
              <span>ضمانت اصالت و سلامت محصولات نیمورا</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1
              class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl"
            >
              رویه بازگرداندن کالا و
              <span
                class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent"
              >
                ضمانت ۷ روزه مرجوعی
              </span>
            </h1>

            <!-- توضیحات مقدمه -->
            <p
              class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose"
            >
              در فروشگاه اینترنتی نیمورا، رضایت خاطر، اعتماد پایدار و آرامش خیال
              شما از خرید محصولات اصیل آرایشی و مراقبت پوستی اولویت نخست ماست.
              تمامی مرسولات پیش از ارسال تحت دقیق‌ترین کنترل‌های کیفی قرار
              می‌گیرند؛ با این حال جهت اطمینان صددرصدی، امکان مرجوعی تا ۷ روز
              مطابق با شفاف‌ترین استانداردهای بهداشتی و قانونی برای شما فراهم
              شده است.
            </p>

            <!-- ۴ شاخص و مزیت کلیدی (Highlights) -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in quickStats"
                :key="idx"
                class="flex flex-col items-center rounded-2xl border border-nimoura-primary/15 bg-white/90 p-3 text-center shadow-2xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-nimoura-primary/40 lg:items-start lg:text-start sm:p-4"
              >
                <div
                  class="mb-2 flex size-9 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary"
                >
                  <i :class="`pi ${stat.icon} text-base`" />
                </div>
                <span
                  class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm"
                  >{{ stat.title }}</span
                >
                <span class="text-[11px] text-nimoura-text-500">{{
                  stat.subtitle
                }}</span>
              </div>
            </div>
          </div>

          <!-- ستون بنر / تصویر هیرو (سمت چپ در RTL) -->
          <div class="lg:col-span-5">
            <!-- 📷 تصویر بنر شاخص هدر صفحه مرجوعی با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/og-image.webp"
                alt="تصویر بنر رویه بازگرداندن کالا"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۲. بخش موازین بهداشتی لوازم آرایشی و بهداشتی (Health & Safety First) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-10 px-4 sm:mt-14 sm:px-6 lg:px-8">
      <!-- پیام هشدار بهداشتی با طراحی شکیل پرایم‌ویو -->
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-white via-[#FFF9F6] to-white p-5 shadow-xs sm:p-8"
      >
        <div
          class="pointer-events-none absolute -left-12 -bottom-12 size-48 rounded-full bg-nimoura-primary/10 blur-2xl"
        />

        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 sm:size-14"
          >
            <i class="pi pi-shield text-2xl" />
          </div>

          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2
                class="font-vazir text-base font-bold text-nimoura-text-900 sm:text-xl"
              >
                توجه ویژه به الزامات بهداشتی محصولات آرایشی، مراقبت پوستی و مو
              </h2>
              <Tag
                value="الزام قانونی و بهداشتی"
                severity="warn"
                class="text-[11px]"
              />
            </div>

            <p
              class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
            >
              به دلیل ارتباط مستقیم لوازم آرایشی و محصولات مراقبت از پوست و مو
              با سلامت فردی، مطابق با دستورالعمل‌های رسمی سازمان غذا و دارو و
              موازین وزارت بهداشت،
              <strong class="text-nimoura-text-900 font-bold"
                >تنها محصولاتی قابلیت مرجوعی دارند که پلمپ، سلفون کارخانه‌ای و
                برچسب اطمینان بهداشتی آن‌ها به هیچ عنوان باز یا دست‌کاری نشده
                باشد</strong
              >. این قانون سخت‌گیرانه ضامن سلامت شما و دریافت کالای ۱۰۰٪ بکر و
              استفاده‌نشده توسط تمامی خریداران محترم نیمورا است.
            </p>
          </div>
        </div>

        <Divider class="my-6 border-nimoura-primary/10" />

        <!-- ستون‌های مقایسه‌ای: چه کالاهایی قابل مرجوعی هستند و چه کالاهایی نیستند؟ -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- ستون کالاهای قابل مرجوعی (سبز) -->
          <div
            class="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 sm:p-6"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2 text-emerald-700">
                <i class="pi pi-check-circle text-lg" />
                <h3 class="font-vazir text-sm font-bold sm:text-base">
                  موارد مشمول ضمانت و بازگشت کالا
                </h3>
              </div>
              <Tag
                value="مجاز جهت مرجوعی"
                severity="success"
                class="text-[11px]"
              />
            </div>

            <ul
              class="space-y-2.5 text-xs text-nimoura-text-700 sm:text-sm sm:space-y-3"
            >
              <li
                v-for="(item, i) in acceptedConditions"
                :key="i"
                class="flex items-start gap-2.5 leading-relaxed"
              >
                <i class="pi pi-check mt-1 shrink-0 text-emerald-600 text-xs" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- ستون کالاهای غیرقابل مرجوعی (قرمز) -->
          <div
            class="rounded-2xl border border-rose-500/20 bg-rose-50/40 p-4 sm:p-6"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2 text-rose-700">
                <i class="pi pi-times-circle text-lg" />
                <h3 class="font-vazir text-sm font-bold sm:text-base">
                  موارد غیرقابل بازگشت و مرجوعی
                </h3>
              </div>
              <Tag
                value="غیرقابل مرجوعی"
                severity="danger"
                class="text-[11px]"
              />
            </div>

            <ul
              class="space-y-2.5 text-xs text-nimoura-text-700 sm:text-sm sm:space-y-3"
            >
              <li
                v-for="(item, i) in rejectedConditions"
                :key="i"
                class="flex items-start gap-2.5 leading-relaxed"
              >
                <i class="pi pi-times mt-1 shrink-0 text-rose-600 text-xs" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 📷 PLACEHOLDER: تصویر راهنمای بررسی پلمپ کالا -->
        <div class="mt-6">
          <div class="mt-4">
            <!-- 📷 تصویر / اینفوگرافیک راهنمای بررسی پلمپ اصالت و جعبه محصول با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md aspect-16/5"
            >
              <NuxtImg
                src="/images/seal-verification.webp"
                alt="راهنمای بررسی پلمپ اصالت و جعبه محصول"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۳. چهار شرط اصلی پذیرش مرجوعی (Core Return Conditions Cards) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-10">
        <span
          class="text-xs font-bold tracking-wider text-nimoura-primary uppercase"
          >دستورالعمل جامع</span
        >
        <h2
          class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
        >
          در چه شرایطی می‌توانید کالا را مرجوع کنید؟
        </h2>
        <p
          class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
        >
          چنانچه هر یک از شرایط زیر برای سفارش شما رخ دهد، نیمورا با کمال احترام
          در کنار شماست.
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(card, idx) in returnReasonCards"
          :key="idx"
          class="group flex flex-col justify-between rounded-3xl border border-nimoura-text-100/80 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md sm:p-6"
        >
          <div>
            <div
              class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/15 transition-transform duration-300 group-hover:scale-110"
            >
              <i :class="`pi ${card.icon} text-xl`" />
            </div>

            <h3
              class="font-vazir text-base font-bold text-nimoura-text-900 sm:text-lg"
            >
              {{ card.title }}
            </h3>

            <p
              class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed"
            >
              {{ card.desc }}
            </p>
          </div>

          <div class="mt-5 border-t border-nimoura-text-100/60 pt-3">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-nimoura-primary"
            >
              <i class="pi pi-clock text-[10px]" />
              {{ card.timeframe }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. فرآیند ۵ مرحله‌ای بازگرداندن کالا (Return Process Timeline) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10 lg:p-12"
      >
        <div class="mb-8 text-center sm:mb-12">
          <Tag
            value="ساده، سریع و بی‌دغدغه"
            severity="secondary"
            class="mb-2 text-xs"
          />
          <h2
            class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            مراحل گام‌به‌گام ثبت و بازگشت کالا
          </h2>
          <p
            class="mx-auto mt-2 max-w-2xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            از ثبت درخواست تا دریافت وجه، کل فرآیند در کمتر از چند روز کاری با
            همراهی کامل پشتیبانی نیمورا انجام می‌شود.
          </p>
        </div>

        <!-- تایم‌لاین مراحل با PrimeVue Timeline -->
        <Timeline
          :value="stepItems"
          align="alternate"
          class="custom-timeline hidden md:block"
        >
          <template #marker="slotProps">
            <span
              class="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-nimoura-primary to-nimoura-velvet text-white shadow-sm ring-4 ring-nimoura-primary/15 transition-transform duration-200 hover:scale-110"
            >
              <i :class="`pi ${slotProps.item.icon} text-sm`" />
            </span>
          </template>

          <template #content="slotProps">
            <div
              class="rounded-2xl border border-nimoura-text-100/80 bg-nimoura-base/60 p-5 shadow-2xs transition-all duration-200 hover:border-nimoura-primary/30 hover:bg-white"
            >
              <div class="mb-1 flex items-center justify-between gap-2">
                <h3
                  class="font-vazir text-base font-bold text-nimoura-text-800"
                >
                  {{ slotProps.item.title }}
                </h3>
                <span
                  class="rounded-lg bg-nimoura-primary/10 px-2 py-0.5 text-xs font-bold text-nimoura-primary"
                >
                  {{ slotProps.item.step }}
                </span>
              </div>
              <p
                class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed"
              >
                {{ slotProps.item.description }}
              </p>
              <div v-if="slotProps.item.action" class="mt-3">
                <NuxtLink
                  :to="slotProps.item.action.href"
                  class="inline-flex items-center gap-1.5 text-xs font-bold text-nimoura-primary hover:underline"
                >
                  <span>{{ slotProps.item.action.label }}</span>
                  <i class="pi pi-arrow-left text-[10px]" />
                </NuxtLink>
              </div>
            </div>
          </template>
        </Timeline>

        <!-- نمای موبایل مراحل (عمودی ریسپانسیو) -->
        <div class="space-y-4 md:hidden">
          <div
            v-for="item in stepItems"
            :key="item.step"
            class="relative flex gap-4 rounded-2xl border border-nimoura-text-100/80 bg-nimoura-base/50 p-4 shadow-2xs"
          >
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-nimoura-primary to-nimoura-velvet text-white shadow-xs"
            >
              <i :class="`pi ${item.icon} text-sm`" />
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-vazir text-sm font-bold text-nimoura-text-800">
                  {{ item.title }}
                </h3>
                <span
                  class="rounded bg-nimoura-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-nimoura-primary"
                >
                  {{ item.step }}
                </span>
              </div>
              <p class="text-xs leading-relaxed text-nimoura-text-600">
                {{ item.description }}
              </p>
              <div v-if="item.action" class="pt-2">
                <NuxtLink
                  :to="item.action.href"
                  class="inline-flex items-center gap-1 text-xs font-bold text-nimoura-primary"
                >
                  <span>{{ item.action.label }}</span>
                  <i class="pi pi-arrow-left text-[10px]" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- 📷 PLACEHOLDER: تصویر یا اینفوگرافیک مراحل مرجوعی -->
        <div class="mt-8 pt-4">
          <div class="mt-4">
            <!-- 📷 تصویر / اینفوگرافیک روند ارسال و تست QC انبار نیمورا با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md aspect-21/6"
            >
              <NuxtImg
                src="/images/logistics-infographic.webp"
                alt="روند ارسال و تست QC انبار نیمورا"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۵. شفافیت هزینه‌ها و نحوه استرداد وجه (Shipping Fees & Refund) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- کارت ۱: هزینه‌های ارسال و پست مرجوعی -->
        <div
          class="flex flex-col justify-between rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8"
        >
          <div>
            <div
              class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary"
            >
              <i class="pi pi-truck text-xl" />
            </div>

            <h3
              class="font-vazir text-lg font-bold text-nimoura-text-900 sm:text-xl"
            >
              هزینه ارسال مرجوعی به عهده چه کسی است؟
            </h3>

            <div
              class="mt-4 space-y-3 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-4"
            >
              <div
                class="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-3.5"
              >
                <span class="font-bold text-emerald-800"
                  >در صورت بروز مغایرت، خرابی یا اشتباه از سوی نیمورا:</span
                >
                <p class="mt-1 text-emerald-950">
                  تمامی هزینه‌های ارسال مجدد و هزینه پستی مرجوع کردن کالا به طور
                  کامل بر عهده نیمورا است. تنها کافیست تصویر فیش پستی پیشتاز را
                  برای همکاران پشتیبانی ارسال فرمایید تا همراه با وجه کالا واریز
                  شود.
                </p>
              </div>

              <div
                class="rounded-xl border border-amber-500/20 bg-amber-50/50 p-3.5"
              >
                <span class="font-bold text-amber-800"
                  >در صورت انصراف سلیقه‌ای مشتری (پلمپ باز نشده):</span
                >
                <p class="mt-1 text-amber-950">
                  در صورتی که کالا کاملاً پلمپ باشد و خریدار محترم پیش از باز
                  کردن سلفون از خرید خود منصرف شود، هزینه پست و بازگرداندن کالا
                  به عهده خریدار خواهد بود و اصل مبلغ کالا مسترد می‌گردد.
                </p>
              </div>
            </div>
          </div>

          <div
            class="mt-6 flex items-center gap-2 text-xs text-nimoura-text-500"
          >
            <i class="pi pi-info-circle text-nimoura-primary" />
            <span
              >ارسال مرسولات تنها از طریق پست پیشتاز به آدرس رسمی انبار نیمورا
              مورد تایید است.</span
            >
          </div>
        </div>

        <!-- کارت ۲: نحوه و زمان‌بندی بازگشت وجه (Refund Methods) -->
        <div
          class="flex flex-col justify-between rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8"
        >
          <div>
            <div
              class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary"
            >
              <i class="pi pi-wallet text-xl" />
            </div>

            <h3
              class="font-vazir text-lg font-bold text-nimoura-text-900 sm:text-xl"
            >
              نحوه و زمان‌بندی استرداد وجه به خریدار
            </h3>

            <p
              class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm"
            >
              پس از رسیدن مرسوله به انبار نیمورا و بررسی سلامت فیزیکی توسط
              کارشناسان کنترل کیفی ظرف ۲۴ الی ۴۸ ساعت، به دو روش می‌توانید وجه
              خود را دریافت فرمایید:
            </p>

            <div class="mt-4 space-y-3 sm:space-y-4">
              <!-- روش اول: شماره شبا -->
              <div
                class="flex items-start gap-3 rounded-2xl border border-nimoura-text-100 bg-nimoura-base/60 p-4"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary"
                >
                  <i class="pi pi-credit-card text-sm" />
                </div>
                <div>
                  <h4
                    class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm"
                  >
                    واریز مستقیم به شماره شبا بانکی (پایا / ساتنا)
                  </h4>
                  <p class="mt-0.5 text-xs text-nimoura-text-600">
                    مبلغ دقیق ظرف ۲۴ تا ۷۲ ساعت کاری پس از تایید نهایی به شماره
                    شبای به نام صاحب حساب کاربری واریز می‌گردد.
                  </p>
                </div>
              </div>

              <!-- روش دوم: کیف پول با بونوس هدیه -->
              <div
                class="flex items-start gap-3 rounded-2xl border border-nimoura-primary/25 bg-nimoura-primary/5 p-4"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary text-white"
                >
                  <i class="pi pi-gift text-sm" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4
                      class="font-vazir text-xs font-bold text-nimoura-primary sm:text-sm"
                    >
                      شارژ آنی کیف پول + ۳٪ اعتبار هدیه
                    </h4>
                    <Tag
                      value="پیشنهاد ویژه"
                      severity="success"
                      class="text-[10px]"
                    />
                  </div>
                  <p class="mt-0.5 text-xs text-nimoura-text-600">
                    در صورت تمایل، کیف پول حساب شما بلافاصله پس از تایید شارژ
                    شده و ۳٪ مبلغ به عنوان هدیه وفاداری به آن افزوده می‌شود.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-6 flex items-center gap-2 text-xs text-nimoura-text-500"
          >
            <i class="pi pi-check text-emerald-600" />
            <span
              >رسید تراکنش بانکی پس از واریز از طریق پیامک به شماره همراه شما
              ارسال می‌شود.</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۶. سوالات متداول با PrimeVue Accordion (FAQ Section) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10"
      >
        <div class="mb-8 text-center sm:mb-10">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary"
          >
            <i class="pi pi-question-circle" />
            <span>پاسخ به ابهامات متداول</span>
          </div>
          <h2
            class="mt-2 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            پرسش‌های متداول درباره مرجوعی و بازگشت کالا
          </h2>
          <p
            class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            اگر پاسخ سوال خود را در زیر پیدا نکردید، همکاران پشتیبانی مشتاقانه
            پاسخگوی شما خواهند بود.
          </p>
        </div>

        <!-- PrimeVue Accordion Component -->
        <Accordion value="faq-0" class="space-y-3">
          <AccordionPanel
            v-for="(faq, idx) in returnFaqs"
            :key="idx"
            :value="`faq-${idx}`"
            class="overflow-hidden rounded-2xl border border-nimoura-text-100/90 transition-all duration-200 hover:border-nimoura-primary/30"
          >
            <AccordionHeader
              class="font-vazir text-sm font-bold text-nimoura-text-800 transition-colors sm:text-base"
            >
              <div class="flex items-center gap-2.5">
                <i class="pi pi-info-circle text-nimoura-primary text-sm" />
                <span>{{ faq.question }}</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div
                class="pt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
              >
                <p>{{ faq.answer }}</p>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۷. جعبه پشتیبانی و تماس سریع (Customer Support CTA) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-[#F6E9EB] via-[#FFF8F4] to-[#F6E9EB] p-6 shadow-sm sm:p-10"
      >
        <div
          class="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-nimoura-primary/10 blur-3xl"
        />

        <div class="grid items-center gap-8 lg:grid-cols-12">
          <div class="space-y-3 text-center lg:col-span-8 lg:text-start">
            <Tag value="پاسخگویی سریع" severity="contrast" class="text-xs" />

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl"
            >
              نیاز به راهنمایی بیشتری دارید؟ تیم پشتیبانی در کنار شماست
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              اگر در خصوص مرجوع کردن سفارش خود سوالی دارید یا می‌خواهید وضعیت
              بسته ارسالی را پیگیری نمایید، می‌توانید از طریق راه‌های ارتباطی
              زیر مستقیماً با کارشناسان نیمورا در ارتباط باشید.
            </p>

            <div
              class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4"
            >
              <!-- دکمه ثبت تیکت آنلاین -->
              <Button
                as="router-link"
                to="/profile/tickets"
                icon="pi pi-ticket"
                label="ثبت تیکت مرجوعی آنلاین"
                class="bg-nimoura-primary! border-nimoura-primary! text-white! rounded-xl! font-vazir! text-xs! sm:text-sm! px-4! py-2.5!"
              />

              <!-- تماس تلفنی -->
              <NuxtLink
                to="tel:09036039314"
                class="inline-flex items-center gap-2 rounded-xl border border-nimoura-primary/30 bg-white px-4 py-2.5 text-xs font-bold text-nimoura-text-800 shadow-2xs transition-all hover:bg-nimoura-primary/10 sm:text-sm"
              >
                <i class="pi pi-phone text-nimoura-primary" />
                <span dir="ltr">09036039314</span>
              </NuxtLink>

              <!-- واتساپ -->
              <NuxtLink
                to="https://wa.me/989036039314"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-2xs transition-all hover:bg-emerald-50 sm:text-sm"
              >
                <i class="pi pi-whatsapp text-emerald-600 text-sm" />
                <span>پشتیبانی واتساپ</span>
              </NuxtLink>

              <!-- تلگرام -->
              <NuxtLink
                to="https://t.me/nimoura_ir"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-white px-4 py-2.5 text-xs font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-50 sm:text-sm"
              >
                <i class="pi pi-telegram text-sky-600 text-sm" />
                <span>پشتیبانی تلگرام</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 📷 PLACEHOLDER: تصویر تیم پشتیبانی و همراهی -->
          <div class="lg:col-span-4">
            <!-- 📷 تصویر صمیمی تیم مشاوران و پشتیبانی نیمورا با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/images/supports.webp"
                alt="تیم مشاوران و پشتیبانی نیمورا"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
// ═════════════════════════════════════════════════════════════════════════════
// دیتای بردکرامب و پیکربندی آدرس صفحه
// ═════════════════════════════════════════════════════════════════════════════
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || "https://nimoura.ir";
const canonicalUrl = `${siteUrl}/return-policy`;

const breadcrumbItems = [
  { label: "صفحه اصلی", to: "/" },
  { label: "رویه بازگرداندن کالا" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص سریع بالای صفحه
// ═════════════════════════════════════════════════════════════════════════════
const quickStats = [
  {
    icon: "pi-replay",
    title: "۷ روز مهلت بازگشت",
    subtitle: "از زمان تحویل مرسوله",
  },
  {
    icon: "pi-verified",
    title: "تضمین ۱۰۰٪ اصالت",
    subtitle: "کالای اصل و دارای بارکد معتبر",
  },
  {
    icon: "pi-wallet",
    title: "استرداد سریع وجه",
    subtitle: "ظرف ۲۴ الی ۷۲ ساعت کاری",
  },
  {
    icon: "pi-headphones",
    title: "پشتیبانی و تیکت آنلاین",
    subtitle: "رسیدگی دقیق کارشناسان QC",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// شرایط پذیرش بهداشتی مرجوعی (سبز)
// ═════════════════════════════════════════════════════════════════════════════
const acceptedConditions = [
  "پلمپ اصلی کارخانه، برچسب اطمینان و سلفون بسته‌بندی کاملاً دست‌نخورده و باز نشده باشد.",
  "وجود مغایرت فیزیکی در رنگ، شماره، کد یا برند محصول با سفارش ثبت‌شده قبل از باز شدن وکیوم.",
  "آسیب‌دیدگی، نشتی یا شکستگی ناشی از جابجایی پستی با ثبت گزارش و تصویر بسته در ۲۴ ساعت اولیه.",
  "انقضای نزدیک یا گذشتن تاریخ مصرف محصول در زمان دریافت توسط مشتری گرامی.",
  "ایراد ساختاری و نقص فنی پمپ، افشانه یا درب ظرف (بدون شکستگی یا ضربه عمدی خریدار).",
];

// ═════════════════════════════════════════════════════════════════════════════
// شرایط عدم پذیرش مرجوعی (قرمز)
// ═════════════════════════════════════════════════════════════════════════════
const rejectedConditions = [
  "محصولاتی که پلمپ، سلفون یا برچسب اطمینان بهداشتی آن‌ها باز، مخدوش یا کنده شده باشد.",
  "هرگونه تست یا استفاده حتی در حد یک قطره، سواچ رنگ یا تست بو (به دلیل موازین بهداشت فردی).",
  "آسیب‌های ناشی از نگهداری نامناسب خریدار پس از تحویل (مانند گرمای شدید، نور آفتاب، رطوبت یا ضربه).",
  "مخدوش شدن جعبه اصلی، کنده شدن بارکد، هولوگرام شرکتی و مفقودی اقلام جانبی کالا.",
  "کالاهای هدیه، گیفت‌های تخفیفی جشنواره، و تسترها یا اقلام اشانتیون رایگان.",
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ کارت اصلی شرایط مرجوعی
// ═════════════════════════════════════════════════════════════════════════════
const returnReasonCards = [
  {
    icon: "pi-exclamation-circle",
    title: "مغایرت کالا با سفارش",
    desc: "چنانچه کالای ارسالی با فاکتور شما از نظر رنگ، کد، حجم یا برند تفاوت داشته باشد، بدون هزینه و با اولویت بالا تعویض یا مرجوع می‌گردد.",
    timeframe: "اعلام ظرف حداکثر ۲۴ ساعت پس از تحویل",
  },
  {
    icon: "pi-box",
    title: "شکستگی یا آسیب در حمل",
    desc: "در صورت هرگونه آسیب دیدن بسته در حین ارسال پستی، کافیست عکس کارتن و محصول را قبل از هرگونه دخل و تصرف برای پشتیبانی ارسال فرمایید.",
    timeframe: "اعلام ظرف حداکثر ۲۴ ساعت پس از تحویل",
  },
  {
    icon: "pi-refresh",
    title: "انصراف سلیقه‌ای از خرید",
    desc: "اگر از خرید خود منصرف شده‌اید، تا ۷ روز فرصت دارید کالا را به شرط دست‌نخورده ماندن کامل پلمپ و سلفون جعبه مرجوع نمایید.",
    timeframe: "مهلت قانونی ۷ روزه از زمان تحویل",
  },
  {
    icon: "pi-shield",
    title: "تضمین اصالت و سلامت",
    desc: "تمامی کالاهای نیمورا اصل هستند. در صورت وجود هرگونه مغایرت در اصالت یا تاریخ انقضای معتبر، کالا بلافاصله مرجوع و وجه عودت می‌گردد.",
    timeframe: "تضمین بدون قید و شرط نیمورا",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// مراحل گام‌به‌گام تایم‌لاین مرجوعی
// ═════════════════════════════════════════════════════════════════════════════
const stepItems = [
  {
    step: "گام اول",
    icon: "pi-file-edit",
    title: "ثبت درخواست مرجوعی در سایت",
    description:
      "وارد حساب کاربری خود شوید، به بخش تیکت‌های پشتیبانی بروید و درخواست خود را با موضوع «مرجوعی کالا» ثبت کنید یا با شماره پشتیبانی تماس بگیرید.",
    action: {
      label: "ورود به پنل و ثبت تیکت",
      href: "/profile/tickets",
    },
  },
  {
    step: "گام دوم",
    icon: "pi-camera",
    title: "ارسال تصاویر و فیلم از وضعیت کالا",
    description:
      "تصویر واضح از محصول، پلمپ دست‌نخورده، جعبه و بارکد آن را در تیکت یا پیام‌رسان بارگذاری نمایید تا کارشناسان مرجوعی بررسی اولیه را انجام دهند.",
  },
  {
    step: "گام سوم",
    icon: "pi-check-circle",
    title: "دریافت تاییدیه و کد رهگیری مرجوعی",
    description:
      "پس از تایید اولیه، پیامک یا پیام تایید همراه با آدرس انبار مرکزی نیمورا و کد اختصاصی مرجوعی برای شما ارسال می‌شود.",
  },
  {
    step: "گام چهارم",
    icon: "pi-send",
    title: "بسته‌بندی ایمن و ارسال پستی",
    description:
      "کالا را به همراه فاکتور داخل جعبه مناسب قرار داده و از طریق پست پیشتاز به آدرس انبار ارسال فرمایید و کد پیگیری مرسوله پستی را ثبت نمایید.",
  },
  {
    step: "گام پنجم",
    icon: "pi-search",
    title: "کارشناسی فنی و تست سلامت (QC)",
    description:
      "پس از دریافت بسته در انبار نیمورا، واحد کنترل کیفیت ظرف ۲۴ الی ۴۸ ساعت کاری سلامت فیزیکی و عدم باز شدن پلمپ را بررسی و تایید می‌نماید.",
  },
  {
    step: "گام ششم",
    icon: "pi-wallet",
    title: "واریز وجه یا شارژ اعتبار کیف پول",
    description:
      "وجه کالا ظرف ۲۴ تا ۷۲ ساعت کاری به شماره شبا شما واریز می‌شود، یا در صورت تمایل کیف پولتان با ۳٪ اعتبار هدیه اضافه شارژ می‌گردد.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// سوالات متداول مرجوعی (FAQ)
// ═════════════════════════════════════════════════════════════════════════════
const returnFaqs = [
  {
    question: "چند روز پس از تحویل سفارش فرصت دارم درخواست مرجوعی را ثبت کنم؟",
    answer:
      "طبق قوانین تجارت الکترونیک و سیاست مشتری‌مداری نیمورا، شما حداکثر تا ۷ روز پس از دریافت بسته توسط مامور پست فرصت دارید درخواست مرجوعی خود را در پنل کاربری ثبت نمایید یا با پشتیبانی تماس بگیرید. البته در صورت شکستگی یا آسیب دیدگی در حمل، اعلام مورد ظرف ۲۴ ساعت اولیه الزامی است.",
  },
  {
    question:
      "آیا در صورت باز کردن سلفون یا پلمپ کرم، ریمل یا رژلب امکان بازگشت وجود دارد؟",
    answer:
      "خیر. طبق ضوابط بهداشتی وزارت بهداشت و ماهیت محصولات آرایشی و مراقبت پوستی، به محض باز شدن سلفون، لیبل یا پلمپ محافظ بهداشتی، کالا از حالت استریل خارج شده و به هیچ وجه قابل فروش یا بازگشت نیست. تنها در صورتی که پلمپ دست‌نخورده باشد یا محصول دارای ایراد فنی کارخانه‌ای (مانند نقص پمپ قبل از مصرف) باشد، بررسی خواهد شد.",
  },
  {
    question:
      "اگر سفارش من در حین جابجایی پستی دچار شکستگی یا نشتی شده باشد چه کنم؟",
    answer:
      "بلافاصله پس از باز کردن جعبه پستی، حداکثر ظرف ۲۴ ساعت از کالای آسیب‌دیده و جعبه مرسوله عکس و فیلم واضح تهیه نمایید و در بخش تیکت‌ها برای ما ارسال کنید. نیمورا با اولویت ویژه کالای جایگزین را برای شما ارسال کرده یا کل مبلغ پرداختی را عودت می‌دهد.",
  },
  {
    question: "هزینه پست برای بازگرداندن کالا بر عهده چه کسی است؟",
    answer:
      "اگر مرجوعی به دلیل قصور یا اشتباه نیمورا (مغایرت، خرابی فیزیکی در ارسال یا تاریخ مصرف نامعتبر) باشد، تمامی هزینه‌های پستی به عهده نیمورا بوده و با ارائه فیش پست پیشتاز به حسابتان بازگردانده می‌شود. اما اگر به دلیل انصراف سلیقه‌ای مشتری با پلمپ سالم باشد، هزینه پست برگشت با خریدار محترم خواهد بود.",
  },
  {
    question: "روند استرداد وجه به حساب بانکی من چقدر طول می‌کشد؟",
    answer:
      "پس از دریافت کالا در انبار مرکزی نیمورا و تایید کارشناسی واحد کنترل کیفیت ظرف ۲۴ تا ۴۸ ساعت، دستور واریز وجه صادر شده و حداکثر ظرف ۲۴ الی ۷۲ ساعت کاری مبلغ به شماره شبای ثبت‌شده به نام صاحب اکانت واریز می‌گردد.",
  },
  {
    question:
      "آیا به جای عودت وجه می‌توانم کالای دیگری جایگزین کنم یا کیف پولم را شارژ کنم؟",
    answer:
      "بله، کاملاً! شما می‌توانید انتخاب کنید که مبلغ کالا بلافاصله به کیف پول حساب شما در نیمورا افزوده شود. با انتخاب این گزینه، ۳٪ اعتبار اضافه به عنوان هدیه تشویقی نیز به کیف پول شما اضافه می‌شود تا در خریدهای بعدی از آن استفاده فرمایید.",
  },
  {
    question: "چگونه می‌توانم وضعیت درخواست مرجوعی خود را پیگیری کنم؟",
    answer:
      "پس از ثبت تیکت در پنل کاربری، در تمامی مراحل (تایید اولیه، دریافت بسته در انبار، کارشناسی کنترل کیفیت و واریز وجه) آخرین وضعیت از طریق پیامک و پنل کاربری به شما اطلاع‌رسانی خواهد شد. همچنین می‌توانید در بخش تیکت‌ها به صورت آنلاین با کارشناس مربوطه گفتگو کنید.",
  },
  {
    question: "آیا برای مرجوع کردن کالا وجود فاکتور یا جعبه اصلی الزامی است؟",
    answer:
      "بله. کالا باید حتماً در جعبه اصلی خود همراه با تمامی متعلقات، برچسب‌ها، بارکد و فاکتور خرید داخل یک کارتن پستی مناسب قرار گیرد تا در مسیر برگشت دچار ضربه یا آسیب نشود.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: "رویه بازگرداندن کالا و ضمانت ۷ روزه مرجوعی | فروشگاه نیمورا",
  description:
    "راهنمای کامل رویه و شرایط بازگرداندن کالا در نیمورا؛ ضمانت ۷ روز بازگشت وجه، موازین بهداشتی لوازم آرایشی، قوانین استرداد هزینه و مراحل ثبت تیکت مرجوعی.",
  keywords:
    "رویه بازگرداندن کالا, قوانین مرجوعی لوازم آرایشی, ضمانت بازگشت وجه, مرجوعی نیمورا, شرایط پس دادن محصولات آرایشی, انصراف از خرید نیمورا, گارانتی اصالت نیمورا",
  ogTitle: "رویه بازگرداندن کالا و ضمانت ۷ روزه مرجوعی | نیمورا",
  ogDescription:
    "راهنمای جامع شرایط و رویه مرجوعی کالا، ضوابط بهداشتی محصولات آرایشی و استرداد وجه در نیمورا.",
  ogImage: `${siteUrl}/og-image.webp`,
  ogUrl: canonicalUrl,
  ogType: "article",
  ogSiteName: "Nimoura | نیمورا",
  ogLocale: "fa_IR",
  twitterCard: "summary_large_image",
  twitterTitle: "رویه بازگرداندن کالا و ضمانت ۷ روزه مرجوعی | نیمورا",
  twitterDescription:
    "راهنمای جامع شرایط و رویه مرجوعی کالا در فروشگاه لوازم آرایشی و زیبایی نیمورا.",
  twitterImage: `${siteUrl}/og-image.webp`,
  robots: "index, follow, max-image-preview:large, max-snippet:-1",
  author: "فروشگاه اینترنتی نیمورا",
});

// ═════════════════════════════════════════════════════════════════════════════
// استراکچرد دیتاهای اسکیما (Schema.org JSON-LD Structured Data)
// ۱. اسکیما WebPage
// ۲. اسکیما BreadcrumbList
// ۳. اسکیما FAQPage (برای اخذ ریچ اسنیپت آکاردئونی در گوگل)
// ۴. اسکیما MerchantReturnPolicy (استاندارد رسمی جدید مرجوعی تجارت الکترونیک گوگل)
// ═════════════════════════════════════════════════════════════════════════════
useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
  script: [
    // ۱. WebPage Schema
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "رویه بازگرداندن کالا و ضمانت ۷ روزه مرجوعی | فروشگاه نیمورا",
        description:
          "راهنمای کامل رویه و شرایط بازگرداندن کالا در نیمورا؛ ضمانت ۷ روز بازگشت وجه، موازین بهداشتی لوازم آرایشی و مراحل استرداد وجه.",
        url: canonicalUrl,
        inLanguage: "fa-IR",
        isPartOf: {
          "@type": "WebSite",
          name: "Nimoura",
          url: siteUrl,
        },
      }),
    },
    // ۲. BreadcrumbList Schema
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "صفحه اصلی",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "رویه بازگرداندن کالا",
            item: canonicalUrl,
          },
        ],
      }),
    },
    // ۳. FAQPage Schema (Google Rich Snippets)
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: returnFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }),
    },
    // ۴. MerchantReturnPolicy Schema (Google Merchant Policy)
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MerchantReturnPolicy",
        name: "قوانین و رویه مرجوعی فروشگاه نیمورا",
        applicableCountry: "IR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        refundType: "https://schema.org/FullRefund",
        customerRemorseReturnFees:
          "https://schema.org/ReturnFeesCustomerResponsibility",
        itemDefectReturnFees: "https://schema.org/FreeReturn",
        itemCondition: "https://schema.org/NewCondition",
        restockingFee: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "IRR",
        },
      }),
    },
  ],
});
</script>

<style scoped>
/* خط پیوند بین گام‌ها در تایم‌لاین */
:deep(.p-timeline-event-connector) {
  background-color: rgba(183, 110, 121, 0.25);
  width: 2px;
}

/* فاصله‌گذاری المان‌های تایم‌لاین */
:deep(.p-timeline-event) {
  min-height: 100px;
}
</style>

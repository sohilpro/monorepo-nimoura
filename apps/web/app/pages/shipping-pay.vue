<template>
  <main class="min-h-screen bg-nimoura-base pb-16 sm:pb-24">
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۱. هدر صفحه، بردکرامب و هیرو بخش (Breadcrumb & Ambient Hero) -->
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
          <!-- ستون متن و معرفی هیرو -->
          <div
            class="space-y-4 text-center lg:col-span-7 lg:text-start sm:space-y-6"
          >
            <!-- بج طلایی -->
            <div
              class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md"
            >
              <i class="pi pi-shield text-xs" />
              <span>ارسال سریع سراسری و پرداخت امن بانکی شاپرک</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1
              class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl"
            >
              روش‌های
              <span
                class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent"
              >
                ارسال و پرداخت
              </span>
              سفارشات نیمورا
            </h1>

            <!-- توضیحات مقدمه -->
            <p
              class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose"
            >
              در فروشگاه آنلاین زیبایی و مراقبت پوستی نیمورا، سرعت، ایمنی در
              تحویل و آرامش در پرداخت، تعهد اصلی ما به شماست. تمامی مرسولات با
              بالاترین استانداردهای ضدضربه بسته‌بندی شده و از طریق معتبرترین
              شرکت‌های حمل‌ونقل ارسال می‌گردند. در این راهنما به طور شفاف با
              تمامی روش‌های ارسال، شرایط ارسال رایگان، بسته‌بندی ضد نشت و
              گزینه‌های متنوع پرداخت آنلاین آشنا می‌شوید.
            </p>

            <!-- ۴ شاخص کلیدی ارسال و پرداخت -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in heroHighlights"
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

          <!-- ستون بنر / تصویر هیرو -->
          <div class="lg:col-span-5">
            <!-- 📷 تصویر بنر اصلی روش‌های ارسال و پرداخت با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/images/shipping-pay.webp"
                alt="بنر شاخص روش‌های ارسال و پرداخت"
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
    <!-- ۲. بنر ویژه ارسال رایگان (Free Shipping Special Highlight) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-10 px-4 sm:mt-12 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/25 bg-linear-to-r from-[#F6E9EB] via-white to-[#F6E9EB] p-5 shadow-xs sm:p-7"
      >
        <div
          class="flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div class="flex items-center gap-4 text-center md:text-start">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-nimoura-primary to-nimoura-velvet text-white shadow-sm ring-4 ring-nimoura-primary/15"
            >
              <i class="pi pi-gift text-2xl" />
            </div>
            <div class="space-y-1">
              <div
                class="flex flex-wrap items-center justify-center gap-2 md:justify-start"
              >
                <h2
                  class="font-vazir text-base font-bold text-nimoura-text-900 sm:text-lg"
                >
                  هدیه ویژه نیمورا: ارسال ۱۰۰٪ رایگان به سراسر کشور
                </h2>
                <Tag
                  value="سفارش‌های بالای ۴ میلیون تومان"
                  severity="success"
                  class="text-xs"
                />
              </div>
              <p class="text-xs text-nimoura-text-600 sm:text-sm">
                سبد خرید خود را با محصولات دلخواه به ۴٬۰۰۰٬۰۰۰ تومان برسانید تا
                هزینه پست پیشتاز به صورت خودکار برای شما رایگان محاسبه شود.
              </p>
            </div>
          </div>

          <NuxtLink
            to="/products"
            class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-nimoura-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-nimoura-primary/90 sm:text-sm"
          >
            <span>مشاهده همه محصولات</span>
            <i class="pi pi-arrow-left text-xs" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۳. شیوه‌های ارسال سفارش (Shipping Methods Cards) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-10">
        <span
          class="text-xs font-bold tracking-wider text-nimoura-primary uppercase"
          >تحویل سریع و مطمئن</span
        >
        <h2
          class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
        >
          روش‌های ارسال مرسولات در نیمورا
        </h2>
        <p
          class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
        >
          بسته به موقعیت جغرافیایی و زمان‌بندی مورد نیاز خود، بهترین شیوه تحویل
          را انتخاب کنید.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="(method, idx) in shippingMethods"
          :key="idx"
          class="group flex flex-col justify-between rounded-3xl border border-nimoura-text-100/80 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md"
        >
          <div>
            <div class="mb-4 flex items-center justify-between">
              <div
                class="flex size-13 items-center justify-center rounded-2xl bg-linear-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/20 transition-transform duration-300 group-hover:scale-105"
              >
                <i :class="`pi ${method.icon} text-2xl`" />
              </div>
              <Tag
                :value="method.badge"
                :severity="method.badgeSeverity"
                class="text-[11px]"
              />
            </div>

            <h3 class="font-vazir text-lg font-bold text-nimoura-text-900">
              {{ method.title }}
            </h3>

            <p
              class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed"
            >
              {{ method.description }}
            </p>

            <!-- ویژگی‌های روش ارسال -->
            <ul
              class="mt-4 space-y-2 border-t border-nimoura-text-100/70 pt-4 text-xs text-nimoura-text-700"
            >
              <li class="flex items-center gap-2">
                <i class="pi pi-clock text-nimoura-primary text-[11px]" />
                <span
                  ><strong>زمان تحویل:</strong> {{ method.deliveryTime }}</span
                >
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-map-marker text-nimoura-primary text-[11px]" />
                <span><strong>پوشش‌دهی:</strong> {{ method.coverage }}</span>
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-tag text-nimoura-primary text-[11px]" />
                <span><strong>هزینه:</strong> {{ method.cost }}</span>
              </li>
            </ul>
          </div>

          <div
            class="mt-5 rounded-xl bg-nimoura-base/80 p-3 text-[11px] text-nimoura-text-500"
          >
            <i class="pi pi-info-circle text-nimoura-primary ml-1" />
            <span>{{ method.note }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. استانداردهای بسته‌بندی ضدضربه و ایمن اقلام آرایشی (Packaging Safety) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-white via-[#FFF8F4] to-white p-6 shadow-xs sm:p-10"
      >
        <div
          class="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-nimoura-primary/10 blur-3xl"
        />

        <div class="grid items-center gap-8 lg:grid-cols-12">
          <!-- ستون توضیحات بسته‌بندی -->
          <div class="space-y-4 lg:col-span-7">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20"
            >
              <i class="pi pi-shield" />
              <span>استاندارد بسته‌بندی VIP نیمورا</span>
            </div>

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
            >
              بسته‌بندی ایمن و ضدضربه؛ سلامت صددرصدی اقلام شکننده
            </h2>

            <p
              class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
            >
              محصولات آرایشی و مراقبت پوستی از جمله کرم‌پودرهای شیشه‌ای،
              پالت‌های سایه فشرده، سرم‌ها، لوسیون‌های پمپی و عطرها نیازمند
              بسته‌بندی بسیار دقیق و مراقبت ویژه هستند. به همین دلیل تمامی
              سفارشات ارسالی نیمورا تحت پروتکل‌های زیر آماده‌سازی می‌شوند:
            </p>

            <div class="grid gap-3 pt-2 sm:grid-cols-2">
              <div
                v-for="(item, i) in packagingFeatures"
                :key="i"
                class="flex items-start gap-3 rounded-2xl border border-nimoura-text-100 bg-white p-3.5 shadow-2xs"
              >
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary"
                >
                  <i :class="`pi ${item.icon} text-xs`" />
                </div>
                <div>
                  <h4
                    class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm"
                  >
                    {{ item.title }}
                  </h4>
                  <p class="text-[11px] text-nimoura-text-500 leading-relaxed">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- ستون بنر / تصویر بسته‌بندی -->
          <div class="lg:col-span-5">
            <!-- 📷 تصویر راهنمای بسته‌بندی استاندارد و ضدضربه نیمورا با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/images/nimoura-packaging.webp"
                alt="بسته‌بندی شیک و ضدضربه نیمورا"
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
    <!-- ۵. شیوه‌های پرداخت امن (Payment Methods Cards) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-10">
        <span
          class="text-xs font-bold tracking-wider text-nimoura-primary uppercase"
          >پرداخت مطمئن شاپرک</span
        >
        <h2
          class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
        >
          روش‌های پرداخت در فروشگاه نیمورا
        </h2>
        <p
          class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
        >
          تراکنش‌های آنلاین در بستر رمزنگاری‌شده و مورد تایید شبکه رسمی شاپرک
          بانک مرکزی انجام می‌پذیرد.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="(pay, idx) in paymentMethods"
          :key="idx"
          class="group flex flex-col justify-between rounded-3xl border border-nimoura-text-100/80 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md"
        >
          <div>
            <div class="mb-4 flex items-center justify-between">
              <div
                class="flex size-13 items-center justify-center rounded-2xl bg-linear-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/20 transition-transform duration-300 group-hover:scale-105"
              >
                <i :class="`pi ${pay.icon} text-2xl`" />
              </div>
              <Tag
                :value="pay.badge"
                :severity="pay.badgeSeverity"
                class="text-[11px]"
              />
            </div>

            <h3 class="font-vazir text-lg font-bold text-nimoura-text-900">
              {{ pay.title }}
            </h3>

            <p
              class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed"
            >
              {{ pay.description }}
            </p>

            <ul
              class="mt-4 space-y-2 border-t border-nimoura-text-100/70 pt-4 text-xs text-nimoura-text-700"
            >
              <li
                v-for="(feat, fIdx) in pay.features"
                :key="fIdx"
                class="flex items-center gap-2"
              >
                <i class="pi pi-check text-emerald-600 text-[11px]" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div
            class="mt-5 rounded-xl bg-nimoura-base/80 p-3 text-[11px] text-nimoura-text-500"
          >
            <i class="pi pi-lock text-nimoura-primary ml-1" />
            <span>{{ pay.securityNote }}</span>
          </div>
        </article>
      </div>

      <!-- بنر گواهی امنیتی و زرین‌پال -->
      <div
        class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-nimoura-primary/15 bg-white p-4 sm:p-5"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"
          >
            <i class="pi pi-verified text-xl" />
          </div>
          <div>
            <span
              class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm"
            >
              ضمانت بازگشت خودکار وجه در صورت بروز خطای بانکی
            </span>
            <p class="text-[11px] text-nimoura-text-500">
              اگر در حین تراکنش، وجه از حساب شما کسر گردید اما سفارش نهایی نشد،
              مبلغ ظرف حداکثر ۷۲ ساعت طبق ضوابط شبکه شاپرک خودکار به حسابتان
              بازمی‌گردد.
            </p>
          </div>
        </div>

        <div
          class="flex items-center gap-2 text-xs font-bold text-nimoura-primary"
        >
          <i class="pi pi-shield" />
          <span>پروتکل امن SSL 256-Bit</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۶. مسیر سفر سفارش شما در نیمورا (Order Journey Timeline) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10 lg:p-12"
      >
        <div class="mb-8 text-center sm:mb-12">
          <Tag
            value="از کلیک تا تحویل درب منزل"
            severity="secondary"
            class="mb-2 text-xs"
          />
          <h2
            class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            سفر سفارش شما؛ مرحله به مرحله تا تحویل
          </h2>
          <p
            class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            ببینید چگونه سفارش شما از لحظه پرداخت آنلاین، در انبار هوشمند نیمورا
            آماده و روانه مقصد می‌شود.
          </p>
        </div>

        <!-- تایم‌لاین دسکتاپ با PrimeVue Timeline -->
        <Timeline
          :value="orderSteps"
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
            </div>
          </template>
        </Timeline>

        <!-- نمای موبایل مراحل -->
        <div class="space-y-4 md:hidden">
          <div
            v-for="item in orderSteps"
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
            </div>
          </div>
        </div>

        <!-- 📷 PLACEHOLDER: اینفوگرافیک مراحل انبارداری و ارسال -->
        <div class="mt-8 pt-4">
          <!-- 📷 تصویر / اینفوگرافیک فرآیند هوشمند پردازش و لجستیک نیمورا با NuxtImg -->
          <div
            class="relative w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md aspect-21/6"
          >
            <NuxtImg
              src="/images/logistics-infographic.webp"
              alt="فرآیند هوشمند پردازش و لجستیک نیمورا"
              class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              format="webp"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۷. راهنمای رهگیری آنلاین سفارشات پستی (Tracking Portal Card) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/20 bg-linear-to-br from-[#FFF9F6] to-white p-6 shadow-xs sm:p-8"
      >
        <div class="grid items-center gap-6 md:grid-cols-12">
          <div class="space-y-2 md:col-span-8">
            <div
              class="inline-flex items-center gap-1.5 text-xs font-bold text-nimoura-primary"
            >
              <i class="pi pi-search" />
              <span>رصد ۲۴ ساعته مرسوله</span>
            </div>
            <h3
              class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl"
            >
              چگونه مرسوله پستی خود را رهگیری کنم؟
            </h3>
            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              به محض تحویل بسته به شرکت پست، یک کد رهگیری ۲۴ رقمی اختصاصی از
              طریق پیامک برای شما ارسال می‌شود. همچنین در پنل کاربری در بخش
              سفارشات، وضعیت بسته در هر لحظه قابل مشاهده است. با وارد کردن این
              کد در سامانه رسمی شرکت پست می‌توانید موقعیت دقیق بسته خود را
              مشاهده فرمایید.
            </p>
          </div>

          <div
            class="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col lg:flex-row"
          >
            <NuxtLink
              to="https://tracking.post.ir"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-nimoura-velvet px-4 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-nimoura-dark sm:text-sm"
            >
              <i class="pi pi-external-link text-xs" />
              <span>سامانه رهگیری پست</span>
            </NuxtLink>

            <NuxtLink
              to="/profile/orders"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-nimoura-primary/30 bg-white px-4 py-3 text-xs font-bold text-nimoura-primary shadow-xs transition-all hover:bg-nimoura-primary/10 sm:text-sm"
            >
              <i class="pi pi-user text-xs" />
              <span>سفارش‌های من</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۸. سوالات متداول با PrimeVue Accordion (FAQ Section) -->
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
            <span>پاسخ به ابهامات رایج</span>
          </div>
          <h2
            class="mt-2 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            پرسش‌های متداول درباره ارسال و پرداخت
          </h2>
          <p
            class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            تمامی آنچه در مورد زمان‌بندی، هزینه‌ها، بسته‌بندی و درگاه‌های پرداخت
            باید بدانید.
          </p>
        </div>

        <!-- PrimeVue Accordion -->
        <Accordion value="faq-0" class="space-y-3">
          <AccordionPanel
            v-for="(faq, idx) in shippingFaqs"
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
    <!-- ۹. باکس پشتیبانی و راهنمایی مستقیم (Customer Support CTA) -->
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
            <Tag
              value="پشتیبانی همه روزه"
              severity="contrast"
              class="text-xs"
            />

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl"
            >
              سوالی درباره سفارش، ارسال یا پرداخت دارید؟
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              تیم پشتیبانی نیمورا در تمامی ساعات کاری آماده پاسخگویی به پرسش‌های
              شما، تغییر آدرس پیش از ارسال یا پیگیری وضعیت مرسوله پستی است.
            </p>

            <div
              class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4"
            >
              <!-- دکمه ثبت تیکت -->
              <Button
                as="router-link"
                to="/profile/tickets"
                icon="pi pi-ticket"
                label="ارسال تیکت به واحد پشتیبانی"
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

          <!-- 📷 PLACEHOLDER: تصویر تیم پشتیبانی لجستیک -->
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
// دیتای بردکرامب و آدرس‌ها
// ═════════════════════════════════════════════════════════════════════════════
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || "https://nimoura.ir";
const canonicalUrl = `${siteUrl}/shipping-pay`;

const breadcrumbItems = [
  { label: "صفحه اصلی", to: "/" },
  { label: "روش‌های ارسال و پرداخت" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص کلیدی بالای صفحه
// ═════════════════════════════════════════════════════════════════════════════
const heroHighlights = [
  {
    icon: "pi-truck",
    title: "ارسال رایگان",
    subtitle: "خریدهای بالای ۴ میلیون تومان",
  },
  {
    icon: "pi-box",
    title: "بسته‌بندی ضدضربه",
    subtitle: "محافظ ویژه اقلام شکننده و مایع",
  },
  {
    icon: "pi-credit-card",
    title: "درگاه‌های امن شاپرک",
    subtitle: "پرداخت سریع با زرین‌پال و ترب‌پی",
  },
  {
    icon: "pi-search",
    title: "پیگیری لحظه‌ای",
    subtitle: "کد رهگیری ۲۴ رقمی پستی",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// روش‌های ارسال سفارش
// ═════════════════════════════════════════════════════════════════════════════
const shippingMethods = [
  {
    icon: "pi-send",
    title: "پست پیشتاز سراسری",
    badge: "محبوب‌ترین شیوه",
    badgeSeverity: "success",
    description:
      "ارسال به تمامی شهرها، شهرستان‌ها و روستاهای سراسر ایران توسط شبکه شرکت ملی پست جمهوری اسلامی ایران با بالاترین امنیت.",
    deliveryTime: "۲ تا ۴ روز کاری پس از تحویل به پست",
    coverage: "۱۰۰٪ نقاط کشور (سراسری)",
    cost: "طبق تعرفه استاندارد (رایگان بالای ۴ م.ت)",
    note: "کد رهگیری ۲۴ رقمی به محض خروج از انبار از طریق پیامک برای خریدار ارسال می‌شود.",
  },
  {
    icon: "pi-bolt",
    title: "ارسال سریع درون‌شهری (پیک)",
    badge: "ارسال فوری",
    badgeSeverity: "warn",
    description:
      "ارسال اختصاصی با پیک امن برای مشتریان مناطق ۲۲‌گانه تهران و کرج جهت دریافت در همان روز یا بازه زمانی منتخب خریدار.",
    deliveryTime: "همان روز یا حداکثر ۲۴ ساعت کاری",
    coverage: "شهر تهران و مناطق منتخب کرج",
    cost: "محاسبه بر اساس مسافت پیک شهری",
    note: "هماهنگی دقیق ساعت تحویل پیش از اعزام سفیر توسط پشتیبانی انجام می‌شود.",
  },
  {
    icon: "pi-gift",
    title: "ارسال طلایی و رایگان نیمورا",
    badge: "هدیه ویژه خریداران",
    badgeSeverity: "contrast",
    description:
      "تمامی سفارش‌هایی که مجموع سبد خرید آن‌ها به ۴ میلیون تومان و بالاتر برسد، به صورت کاملاً رایگان با بسته‌بندی ویژه VIP ارسال می‌گردند.",
    deliveryTime: "مطابق بازه پست پیشتاز (۲ تا ۴ روز)",
    coverage: "تمام نقاط کشور بدون استثنا",
    cost: "۰ تومان (کاملاً رایگان)",
    note: "تخفیف هزینه ارسال به طور هوشمند و خودکار در مرحله نهایی فاکتور اعمال می‌شود.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ویژگی‌های بسته‌بندی ایمن
// ═══════════════════════════════════════════════════════════════════════════
const packagingFeatures = [
  {
    icon: "pi-shield",
    title: "پوشش چندلایه ضربه‌گیر نایلونی (Bubble Wrap)",
    desc: "احاطه کامل شیشه‌های عطر، کرم‌پودرها و سرم‌ها با عایق‌های بالشتکی هوا.",
  },
  {
    icon: "pi-check",
    title: "مقاوم‌سازی درب ظروف و جلوگیری از نشتی",
    desc: "چسب‌بندی بهداشتی محفظه‌ها جهت پیشگیری از هرگونه نشتی مایعات حین ارتعاش.",
  },
  {
    icon: "pi-box",
    title: "کارتن‌های مستحکم ۵ لایه صنعتی",
    desc: "جعبه‌های ویژه با ضخامت بالا مقاوم در برابر فشارهای جانبی ناوگان پستی.",
  },
  {
    icon: "pi-exclamation-triangle",
    title: "لیبل ویژه هشدار اقلام حساس و شکستنی",
    desc: "چسب و برچسب‌های شبرنگ جهت حمل محتاطانه توسط متصدیان جابجایی کالا.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// روش‌های پرداخت امن
// ═════════════════════════════════════════════════════════════════════════════
const paymentMethods = [
  {
    icon: "pi-credit-card",
    title: "درگاه آنلاین زرین‌پال (شبکه شتاب)",
    badge: "درگاه اصلی و پیش‌فرض",
    badgeSeverity: "success",
    description:
      "پرداخت فوری با کلیه کارت‌های عضو شتاب بانکی از طریق امن‌ترین پروتکل شاپرک همراه با رمز دوم پویا.",
    features: [
      "پشتیبانی از تمامی بانک‌های کشور",
      "تایید و ثبت آنی سفارش بدون فوت وقت",
      "امنیت با استاندارد رمزنگاری SSL 256-Bit",
      "امکان دانلود و مشاهده فوری رسید دیجیتال",
    ],
    securityNote: "دارای نماد رسمی اعتماد الکترونیک زرین‌پال (TrustCode).",
  },
  {
    icon: "pi-send",
    title: "پرداخت آنلاین ترب‌پی (TorobPay)",
    badge: "سریع و بدون کارمزد",
    badgeSeverity: "info",
    description:
      "امکان پرداخت مستقیم از طریق درگاه یکپارچه ترب‌پی برای کاربرانی که از موتور جستجوی ترب اقدام به خرید می‌نمایند.",
    features: [
      "پرداخت سریع با حساب کاربری ترب",
      "هماهنگ با سفارشات ثبت‌شده از پنل ترب",
      "بدون کارمزد مازاد تراکنش",
      "رهگیری هوشمند وضعیت خرید",
    ],
    securityNote: "اتصال مستقیم به شبکه پرداخت مورد تایید ترب.",
  },
  {
    icon: "pi-wallet",
    title: "کیف پول نیمورا و کدهای تخفیف",
    badge: "بونوس نقدی هدیه",
    badgeSeverity: "warn",
    description:
      "استفاده از مانده اعتبار کیف پول کاربری همراه با اعمال کوپن‌های تخفیف و کدهای معرف برای کاهش مبلغ خرید.",
    features: [
      "کسر آنی مانده کیف پول از فاکتور",
      "امکان پرداخت ترکیبی (کیف پول + درگاه بانکی)",
      "دریافت ۳٪ اعتبار هدیه در جشنواره‌ها",
      "اعمال آسان کدهای معرف و جشنواره",
    ],
    securityNote: "اعتبار کیف پول بدون تاریخ انقضا در حسابتان محفوظ است.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// مراحل ۵ گانه سفر سفارش
// ═════════════════════════════════════════════════════════════════════════════
const orderSteps = [
  {
    step: "مرحله اول",
    icon: "pi-shopping-cart",
    title: "ثبت سفارش و پرداخت آنلاین موفق",
    description:
      "سفارش شما در سیستم هوشمند نیمورا ثبت شده و پیامک تایید سفارش به همراه فاکتور رسمی الکترونیکی برایتان ارسال می‌شود.",
  },
  {
    step: "مرحله دوم",
    icon: "pi-search",
    title: "کنترل کیفیت (QC) و بررسی سلامت کالا",
    description:
      "کارشناسان انبار تاریخ انقضا، بارکد اصالت و پلمپ تک‌تک محصولات انتخابی شما را با دقت چک می‌کنند.",
  },
  {
    step: "مرحله سوم",
    icon: "pi-box",
    title: "بسته‌بندی ایمن با نایلون حباب‌دار و کارتن محکم",
    description:
      "کالاها با فوم‌های ضدضربه و عایق‌های رطوبتی در کارتن‌های مقاوم بسته‌بندی و پلمپ امنیتی می‌شوند.",
  },
  {
    step: "مرحله چهارم",
    icon: "pi-send",
    title: "تحویل به شرکت پست و ارسال پیامک رهگیری",
    description:
      "بسته به متصدی پست پیشتاز تحویل داده شده و کد پیگیری ۲۴ رقمی پیامک می‌گردد تا موقعیت بسته را ثانیه‌به‌ثانیه رصد کنید.",
  },
  {
    step: "مرحله پنجم",
    icon: "pi-home",
    title: "تحویل مرسوله در سلامت کامل درب منزل شما",
    description:
      "مامور محترم پست بسته را درب منزل یا محل کار به شما تحویل می‌دهد؛ اکنون زمان لذت بردن از زیبایی است!",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// پرسش‌های متداول ارسال و پرداخت (FAQ)
// ═════════════════════════════════════════════════════════════════════════════
const shippingFaqs = [
  {
    question: "هزینه ارسال سفارش چقدر است و چگونه ارسال رایگان می‌شود؟",
    answer:
      "هزینه ارسال پستی برای تمامی سفارش‌ها بر اساس نرخ استاندارد و مصوب شرکت پست محاسبه می‌گردد. با این حال، اگر مجموع سبد خرید شما به مبلغ ۴٬۰۰۰٬۰۰۰ تومان یا بیشتر برسد، هزینه ارسال به طور کامل رایگان شده و توسط نیمورا پرداخت می‌شود.",
  },
  {
    question: "سفارش من پس از ثبت نهایی چند روزه به دستم می‌رسد؟",
    answer:
      "تمامی سفارش‌ها ظرف ۲۴ ساعت کاری در انبار پردازش و تحویل شرکت پست می‌شوند. زمان تحویل پست پیشتاز برای تهران ۲۴ الی ۴۸ ساعت و برای سایر شهرستان‌ها ۲ تا ۴ روز کاری است. برای سفارش‌های شهر تهران و کرج نیز امکان هماهنگی تحویل همان‌روز با پیک شهری وجود دارد.",
  },
  {
    question: "چگونه می‌توانم وضعیت بسته ارسالی را لحظه‌به‌لحظه رهگیری کنم؟",
    answer:
      "به محض تحویل مرسوله به باجه پستی، یک کد رهگیری ۲۴ رقمی اختصاصی از طریق پیامک برای شماره همراه شما ارسال می‌شود. با وارد کردن این کد در سامانه رسمی شرکت پست به نشانی tracking.post.ir یا با مراجعه به بخش «سفارش‌های من» در پروفایل کاربری نیمورا، وضعیت دقیق بسته را مشاهده فرمایید.",
  },
  {
    question: "آیا امکان پرداخت در محل (پس‌کرایه یا COD) وجود دارد؟",
    answer:
      "خیر. به دلیل الزامات ثبت سفارش اقلام آرایشی و موازین شرکت پست در انبارداری بهداشتی، تسویه تمامی سفارش‌ها به صورت اینترنتی و از طریق درگاه‌های امن زرین‌پال یا ترب‌پی پیش از ارسال انجام می‌پذیرد تا کالا بدون تاخیر مستقیماً ارسال گردد.",
  },
  {
    question:
      "اگر هنگام پرداخت اینترنتی پول از حسابم کسر شد اما سفارش ثبت نشد چه کنم؟",
    answer:
      "نگران نباشید؛ در موارد نادری که به دلیل قطعی موقت اینترنت تراکنش ناتمام بماند، مبلغ کسر شده در شبکه بین‌بانکی شاپرک مسدود شده و نهایتاً ظرف حداکثر ۷۲ ساعت کاری خودکار به حسابتان برمی‌گردد. در صورت عدم بازگشت، پشتیبانی نیمورا با دریافت شماره پیگیری تراکنش بلافاصله مورد را با بانک پیگیری خواهد کرد.",
  },
  {
    question:
      "آیا لوازم آرایشی حساس مانند پالت سایه یا کرم شیشه‌ای در جابجایی پستی نمی‌شکنند؟",
    answer:
      "خیر، به هیچ وجه نگران نباشید. نیمورا پروتکل بسته‌بندی ویژه‌ای برای اقلام شکستنی دارد؛ هر محصول با چند لایه نایلون حباب‌دار ضربه‌گیر ضخیم پیچیده شده و داخل کارتن‌های مستحکم با چسب امنیتی قرار می‌گیرد. با این وجود، اگر به هر دلیلی مشکلی رخ دهد، ضمانت مرجوعی ۷ روزه نیمورا خسارت را کاملاً جبران خواهد کرد.",
  },
  {
    question: "آیا می‌توانم سفارش را برای شخص دیگری هدیه ارسال کنم؟",
    answer:
      "بله، در مرحله تکمیل سفارش (Checkout) می‌توانید تیک گزینه «گیرنده شخص دیگری است» را فعال نموده و نام، شماره تماس و آدرس دقیق هدیه‌گیرنده را وارد کنید تا مرسوله بدون درج فاکتور قیمت‌دار مستقیماً به دست ایشان برسد.",
  },
  {
    question: "چگونه می‌توانم از کد تخفیف یا موجودی کیف پول خود استفاده کنم؟",
    answer:
      "در مرحله تسویه حساب، کادری جهت وارد کردن کد تخفیف یا کد معرف تعبیه شده است. پس از کلیک بر روی دکمه اعمال، مبلغ تخفیف بلافاصله از فاکتور کسر می‌شود. همچنین اگر در کیف پول خود موجودی داشته باشید، می‌توانید گزینه پرداخت از اعتبار کیف پول را انتخاب فرمایید.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: "روش‌های ارسال و پرداخت | راهنمای جامع خرید امن از فروشگاه نیمورا",
  description:
    "راهنمای کامل انواع روش‌های ارسال پستی و سریع، هزینه و سقف ارسال رایگان، بسته‌بندی ضدضربه و روش‌های پرداخت آنلاین امن شاپرک در فروشگاه اینترنتی نیمورا.",
  keywords:
    "روش های ارسال نیمورا, روش های پرداخت نیمورا, ارسال رایگان لوازم آرایشی, پرداخت آنلاین زرین پال, ترب پی, پست پیشتاز, رهگیری مرسوله پستی, خرید امن لوازم آرایشی, هزینه پست لوازم آرایشی",
  ogTitle: "روش‌های ارسال و پرداخت | نیمورا",
  ogDescription:
    "راهنمای جامع انواع روش‌های ارسال پستی، ارسال رایگان بالای ۴ میلیون تومان، بسته‌بندی ایمن و درگاه‌های پرداخت امن شاپرک در نیمورا.",
  ogImage: `${siteUrl}/og-image.webp`,
  ogUrl: canonicalUrl,
  ogType: "article",
  ogSiteName: "Nimoura | نیمورا",
  ogLocale: "fa_IR",
  twitterCard: "summary_large_image",
  twitterTitle: "روش‌های ارسال و پرداخت | نیمورا",
  twitterDescription:
    "راهنمای جامع روش‌های ارسال پستی، بسته‌بندی ضدضربه و پرداخت امن آنلاین در فروشگاه لوازم آرایشی و زیبایی نیمورا.",
  twitterImage: `${siteUrl}/og-image.webp`,
  robots: "index, follow, max-image-preview:large, max-snippet:-1",
  author: "فروشگاه اینترنتی نیمورا",
});

// ═════════════════════════════════════════════════════════════════════════════
// استراکچرد دیتاهای اسکیما (Schema.org JSON-LD Structured Data)
// ۱. WebPage Schema
// ۲. BreadcrumbList Schema
// ۳. FAQPage Schema (Google Rich Snippets)
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
        name: "روش‌های ارسال و پرداخت | راهنمای جامع خرید امن از فروشگاه نیمورا",
        description:
          "راهنمای کامل انواع روش‌های ارسال پستی و سریع، هزینه و سقف ارسال رایگان، بسته‌بندی ضدضربه و روش‌های پرداخت آنلاین امن در نیمورا.",
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
            name: "روش‌های ارسال و پرداخت",
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
        mainEntity: shippingFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
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

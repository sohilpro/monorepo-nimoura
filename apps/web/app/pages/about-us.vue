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
          <!-- ستون محتوای هیرو -->
          <div
            class="space-y-4 text-center lg:col-span-7 lg:text-start sm:space-y-6"
          >
            <!-- بج طلایی معرفی -->
            <div
              class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md"
            >
              <i class="pi pi-sparkles text-xs" />
              <span>داستان، رسالت و اشتیاق بی‌پایان به زیبایی اصیل</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1
              class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl"
            >
              درباره
              <span
                class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent"
              >
                نیمورا (Nimoura)
              </span>
              ؛ درخشش سلامت و اصالت
            </h1>

            <!-- توضیحات مقدمه -->
            <p
              class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose"
            >
              نیمورا فراتر از یک فروشگاه آنلاین، روایتی از پیوند علم مراقبت
              پوستی، ظرافت هنر آرایش و فناوری‌های نوآورانه مدرن است. ما با این
              باور متولد شدیم که هر فرد شایسته دستیابی به باکیفیت‌ترین و
              اصیل‌ترین محصولات زیبایی جهان با عادلانه‌ترین قیمت و شفاف‌ترین
              اطلاعات است. از فرمولاسیون‌های تست‌شده تا تجربه خرید در نخستین
              فروشگاه سه‌بعدی آرایشی ایران، در تمام مسیر همراه زیبایی طبیعی شما
              هستیم.
            </p>

            <!-- ۴ شاخص و آمار برجسته نیمورا -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in aboutHighlights"
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
            <!-- 📷 تصویر بنر شاخص هدر درباره ما با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/images/about-us.webp"
                alt="داستان و هویت برند نیمورا"
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
    <!-- ۲. داستان شکل‌گیری نیمورا (Our Story) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-white p-6 shadow-xs sm:p-10 lg:p-12"
      >
        <div
          class="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-nimoura-primary/10 blur-3xl"
        />

        <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- ستون متن داستان برند -->
          <div class="space-y-4 lg:col-span-7">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary"
            >
              <i class="pi pi-bookmark" />
              <span>فصل آغازین یک رویا</span>
            </div>

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
            >
              داستان ما؛ پاسخی به دغدغه اصالت در دنیای زیبایی
            </h2>

            <div
              class="space-y-3 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-4 sm:leading-loose"
            >
              <p>
                داستان نیمورا از یک دغدغه عمیق و واقعی شکل گرفت: در دنیایی که
                بازار محصولات آرایشی و مراقبتی مملو از کالاهای فیک، تاریخ‌گذشته
                و نامطمئن شده بود، یافتن محصولی اصیل که واقعاً با سلامت پوست
                سازگار باشد به یک چالش فرساینده تبدیل گشته بود. ما باور داشتیم
                مراقبت از پوست، یک انتخاب لوکس نیست؛ بلکه یک حق اساسی برای حفظ
                شادابی، سلامت و اعتمادبه‌نفس هر انسان است.
              </p>
              <p>
                در سال ۱۳۹۹، گروهی از مشتاقان بیوتی، داروسازان و متخصصان فناوری
                گرد هم آمدند تا بستری امن، شفاف و الهام‌بخش بیافرینند. نام
                <strong class="text-nimoura-primary font-bold">«نیمورا»</strong>
                با الهام از حس درخشش، زیبایی ماندگار و وقار برگزیده شد تا نماد
                تعهدی استوار به اصالت باشد.
              </p>
              <p>
                امروز، نیمورا زنجیره‌ای قابل اعتماد از معتبرترین برندهای جهانی و
                برگزیده‌ترین تولیدکنندگان داخلی است که با حذف واسطه‌های نامعتبر
                و پایبندی به دقیق‌ترین ضوابط کنترل کیفی (QC)، مطمئن‌ترین تجربه
                خرید آنلاین لوازم آرایشی را رقم می‌زند.
              </p>
            </div>
          </div>

          <!-- ستون تصویر ماموریت -->

          <!-- 📷 تصویر داستان برند و استودیو نیمورا با NuxtImg -->
          <div class="lg:col-span-5">
            <!-- 📷 تصویر داستان برند و استودیو نیمورا با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/og-image.webp"
                alt="داستان برند و استودیو نیمورا"
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
    <!-- ۳. ماموریت و چشم‌انداز نیمورا (Mission & Vision) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- کارت ماموریت ما -->
        <div
          class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-br from-white via-[#FFF8F4] to-white p-6 shadow-xs sm:p-8"
        >
          <div
            class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary"
          >
            <i class="pi pi-compass text-2xl" />
          </div>

          <span class="text-xs font-bold text-nimoura-primary uppercase"
            >هدف وجودی ما</span
          >
          <h3
            class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl"
          >
            ماموریت ما (Our Mission)
          </h3>

          <p
            class="mt-3 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
          >
            ماموریت ما دموکراتیزه کردن دسترسی به سالم‌ترین و باکیفیت‌ترین
            کالاهای آرایشی و مراقبت پوستی اصل جهان برای هموطنان است. ما در پی
            آنیم که با آگاهی‌بخشی علمی، نقد و بررسی‌های بی‌طرفانه، و ارتقای
            استاندارد بسته‌بندی و تحویل، هر خرید را به تجربه‌ای لذت‌بخش و
            آرامش‌بخش برای خانواده‌های ایرانی تبدیل کنیم.
          </p>

          <ul
            class="mt-4 space-y-2 border-t border-nimoura-primary/10 pt-4 text-xs text-nimoura-text-700"
          >
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-emerald-600 text-xs" />
              <span
                >ارائه ۱۰۰٪ کالای اورجینال با تاریخ انقضای معتبر و طولانی</span
              >
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-emerald-600 text-xs" />
              <span
                >قیمت‌گذاری شفاف، عادلانه و حمایت از بودجه مصرف‌کنندگان</span
              >
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-check text-emerald-600 text-xs" />
              <span>مشاوره تخصصی و رایگان روتین پوستی متناسب با نوع پوست</span>
            </li>
          </ul>
        </div>

        <!-- کارت چشم‌انداز ما -->
        <div
          class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-br from-white via-[#FFF8F4] to-white p-6 shadow-xs sm:p-8"
        >
          <div
            class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-nimoura-velvet text-white"
          >
            <i class="pi pi-eye text-2xl" />
          </div>

          <span class="text-xs font-bold text-nimoura-primary uppercase"
            >افق پیش‌رو</span
          >
          <h3
            class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl"
          >
            چشم‌انداز ما (Our Vision)
          </h3>

          <p
            class="mt-3 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
          >
            چشم‌انداز نیمورا، تبدیل شدن به الهام‌بخش‌ترین و پیشرفته‌ترین
            اکوسیستم زیبایی و سلامت دیجیتال در خاورمیانه است؛ جایی که هوش مصنوعی
            در تحلیل سلامت پوست، تکنولوژی شبیه‌سازی سه‌بعدی و اصالت بی‌چون‌وچرا
            به هم می‌پیوندند تا تعریفی نوین از خرید مدرن لوازم آرایشی و مراقبتی
            به ارمغان آورند.
          </p>

          <ul
            class="mt-4 space-y-2 border-t border-nimoura-primary/10 pt-4 text-xs text-nimoura-text-700"
          >
            <li class="flex items-center gap-2">
              <i class="pi pi-sparkles text-nimoura-primary text-xs" />
              <span>پیشگامی در خرید مجازی و فروشگاه سه‌بعدی تعاملی</span>
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-sparkles text-nimoura-primary text-xs" />
              <span>توسعه بزرگ‌ترین مرجع دانش علمی زیبایی در مجله نیمورا</span>
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-sparkles text-nimoura-primary text-xs" />
              <span>پوشش جامع لاین‌های درمانی، ارگانیک و Cruelty-Free</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. ارزش‌های بنیادین نیمورا (Core Values Grid) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-10">
        <span
          class="text-xs font-bold tracking-wider text-nimoura-primary uppercase"
          >اصول تزلزل‌ناپذیر</span
        >
        <h2
          class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
        >
          ارزش‌های بنیادین خانواده نیمورا
        </h2>
        <p
          class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
        >
          چهار ستون استواری که تمام تصمیمات، انتخاب محصولات و تعاملات ما بر
          آن‌ها بنا نهاده شده‌اند.
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(val, idx) in coreValues"
          :key="idx"
          class="group flex flex-col justify-between rounded-3xl border border-nimoura-text-100/80 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md sm:p-6"
        >
          <div>
            <div
              class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/15 transition-transform duration-300 group-hover:scale-110"
            >
              <i :class="`pi ${val.icon} text-xl`" />
            </div>

            <h3
              class="font-vazir text-base font-bold text-nimoura-text-900 sm:text-lg"
            >
              {{ val.title }}
            </h3>

            <p
              class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed"
            >
              {{ val.desc }}
            </p>
          </div>

          <div class="mt-5 border-t border-nimoura-text-100/60 pt-3">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-nimoura-primary"
            >
              <i class="pi pi-check-circle text-[10px]" />
              {{ val.highlight }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۵. نوآوری اختصاصی: فروشگاه سه‌بعدی نیمورا (3D Store Innovation) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl border border-nimoura-primary/25 bg-linear-to-r from-[#2E2636] via-[#3B2F45] to-[#2E2636] p-6 text-white shadow-lg sm:p-10 lg:p-12"
      >
        <div
          class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-nimoura-primary/20 blur-3xl"
        />
        <div
          class="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-nimoura-accent/20 blur-3xl"
        />

        <div
          class="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
        >
          <!-- ستون معرفی فروشگاه سه بعدی -->
          <div class="space-y-4 text-center lg:col-span-7 lg:text-start">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-nimoura-accent ring-1 ring-white/20 backdrop-blur-md"
            >
              <i class="pi pi-box" />
              <span>پیشگام تکنولوژی در ایران</span>
            </div>

            <h2
              class="font-modam text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
            >
              اولین تجربه خرید در
              <span class="text-nimoura-accent">فروشگاه سه‌بعدی آرایشی</span>
              کشور
            </h2>

            <p
              class="text-xs leading-relaxed text-nimoura-text-100 sm:text-sm sm:leading-loose"
            >
              نیمورا با افتخار نخستین پلتفرم ایرانی است که امکان گشت‌وگذار
              تعاملی در یک فروشگاه مجازی سه‌بعدی (3D Virtual Store) را برای
              علاقه‌مندان به لوازم آرایشی و بهداشتی فراهم آورده است. بدون نیاز
              به نصب هیچ‌گونه نرم‌افزار جانبی، مستقیماً در مرورگر خود میان
              قفسه‌ها قدم بزنید، محصولات را به صورت سه‌بعدی و ۳۶۰ درجه بررسی
              کنید و خریدی آینده‌نگرانه را تجربه فرمایید.
            </p>

            <div
              class="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start sm:gap-4"
            >
              <NuxtLink
                to="/store-3d"
                class="inline-flex items-center gap-2 rounded-xl bg-nimoura-primary px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-nimoura-primary/90 hover:scale-105 sm:text-sm"
              >
                <i class="pi pi-eye text-sm" />
                <span>ورود به فروشگاه سه‌بعدی (Store 3D)</span>
              </NuxtLink>

              <NuxtLink
                to="/products"
                class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 sm:text-sm"
              >
                <span>مشاهده کاتالوگ محصولات</span>
                <i class="pi pi-arrow-left text-xs" />
              </NuxtLink>
            </div>
          </div>

          <!-- ستون بنر فروشگاه سه بعدی -->
          <div class="lg:col-span-5">
            <!-- 📷 PLACEHOLDER: بنر پیش‌نمایش فروشگاه سه‌بعدی -->
            <div
              class="group flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-nimoura-accent/40 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:border-nimoura-accent"
              aria-label="محل تصویر نمای داخلی فروشگاه سه بعدی نیمورا"
            >
              <div
                class="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-nimoura-accent ring-1 ring-white/20 transition-transform group-hover:scale-110"
              >
                <i class="pi pi-desktop text-2xl" />
              </div>
              <p
                class="mt-4 font-vazir text-xs font-bold text-white sm:text-sm"
              >
                محل اسکرین‌شات یا بنر محیط سه‌بعدی 3D Store
              </p>
              <p class="mt-1 text-[11px] text-nimoura-text-200">
                ابعاد پیشنهادی: ۸۰۰ × ۵۰۰ پیکسل (رندر ۳D از قفسه‌ها و سالن
                زیبایی)
              </p>
              <span
                class="mt-3 inline-flex items-center gap-1 rounded-full bg-nimoura-accent/20 px-3 py-1 text-[10px] font-semibold text-nimoura-accent"
              >
                Virtual Reality Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۶. مسیر رشد و تاریخچه نیمورا (Timeline با PrimeVue) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10 lg:p-12"
      >
        <div class="mb-8 text-center sm:mb-12">
          <Tag
            value="سفر نیمورا از رویا تا واقعیت"
            severity="secondary"
            class="mb-2 text-xs"
          />
          <h2
            class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            نقاط عطف مسیر رشد و بالندگی ما
          </h2>
          <p
            class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            هر سال، گامی رو به جلو در ارتقای کیفیت خدمات و رضایت همراهان
            وفادارمان.
          </p>
        </div>

        <!-- تایم‌لاین دسکتاپ با PrimeVue Timeline -->
        <Timeline
          :value="milestoneSteps"
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
                  class="rounded-lg bg-nimoura-primary/10 px-2.5 py-0.5 text-xs font-bold text-nimoura-primary"
                >
                  {{ slotProps.item.year }}
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
            v-for="item in milestoneSteps"
            :key="item.year"
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
                  {{ item.year }}
                </span>
              </div>
              <p class="text-xs leading-relaxed text-nimoura-text-600">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۷. منشور کنترل کیفیت و ضمانت اصالت (QC Pledge) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl border border-nimoura-primary/20 bg-linear-to-br from-white via-[#FFF9F6] to-white p-6 shadow-xs sm:p-10"
      >
        <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- ستون تصویر QC -->
          <div class="lg:col-span-5 order-2 lg:order-1">
            <!-- 📷 تصویر تست کیفیت و بررسی بارکد اصالت با NuxtImg -->
            <div
              class="relative w-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md aspect-4/3"
            >
              <NuxtImg
                src="/images/authenticity.webp"
                alt="تست کیفیت و بررسی اصالت کالا"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>

          <!-- ستون توضیحات منشور اصالت -->
          <div class="space-y-4 lg:col-span-7 order-1 lg:order-2">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20"
            >
              <i class="pi pi-shield-check" />
              <span>فرآیند ۳ مرحله‌ای سنجش اصالت</span>
            </div>

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
            >
              تعهد اخلاقی و عملی به اصالت ۱۰۰٪ کالا
            </h2>

            <p
              class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose"
            >
              در نیمورا هیچ کالایی بدون عبور از فیلتر سه‌گانه وارد قفسه‌ها
              نمی‌شود. ما تفاوت میان محصول اصل و فیک را مسئله‌ای حیاتی برای
              سلامت پوست مشتریان می‌دانیم. به همین جهت:
            </p>

            <div class="space-y-3 pt-1">
              <div
                v-for="(step, sIdx) in qcSteps"
                :key="sIdx"
                class="flex items-start gap-3 rounded-2xl border border-nimoura-text-100 bg-white p-3.5 shadow-2xs"
              >
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary font-bold text-xs"
                >
                  {{ sIdx + 1 }}
                </div>
                <div>
                  <h4
                    class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm"
                  >
                    {{ step.title }}
                  </h4>
                  <p
                    class="text-[11px] text-nimoura-text-500 leading-relaxed mt-0.5"
                  >
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۸. سوالات متداول درباره نیمورا (PrimeVue Accordion FAQ) -->
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
            <span>پاسخ به پرسش‌های رایج</span>
          </div>
          <h2
            class="mt-2 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl"
          >
            سوالات متداول درباره فروشگاه نیمورا
          </h2>
          <p
            class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm"
          >
            پاسخ به سوالاتی که همواره کاربران گرامی درباره نحوه تامین، اصالت و
            خرید از ما جویا می‌شوند.
          </p>
        </div>

        <!-- PrimeVue Accordion -->
        <Accordion value="faq-0" class="space-y-3">
          <AccordionPanel
            v-for="(faq, idx) in aboutFaqs"
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
    <!-- ۹. دعوت به همراهی و باکس ارتباطی (Join Us CTA) -->
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
            <Tag value="خانواده نیمورا" severity="contrast" class="text-xs" />

            <h2
              class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl"
            >
              همراه ما در مسیر درخشش و زیبایی باشید
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              اگر پرسشی درباره محصولات دارید، نیازمند مشاوره انتخاب روتین پوستی
              هستید یا قصد همکاری تجاری دارید، تیم مشتاق نیمورا همیشه در دسترس
              شماست.
            </p>

            <div
              class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4"
            >
              <!-- دکمه تماس با ما -->
              <Button
                as="router-link"
                to="/contact-us"
                icon="pi pi-envelope"
                label="ارتباط با امور مشتریان"
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

              <!-- اینستاگرام -->
              <NuxtLink
                to="https://www.instagram.com/nimoura.ir"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 shadow-2xs transition-all hover:bg-rose-50 sm:text-sm"
              >
                <i class="pi pi-instagram text-rose-600 text-sm" />
                <span>اینستاگرام نیمورا</span>
              </NuxtLink>

              <!-- تلگرام -->
              <NuxtLink
                to="https://t.me/nimoura_ir"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-white px-4 py-2.5 text-xs font-bold text-sky-700 shadow-2xs transition-all hover:bg-sky-50 sm:text-sm"
              >
                <i class="pi pi-telegram text-sky-600 text-sm" />
                <span>کانال تلگرام</span>
              </NuxtLink>
            </div>
          </div>

          <!-- 📷 PLACEHOLDER: تصویر تیم و فضای صمیمی نیمورا -->
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
const canonicalUrl = `${siteUrl}/about-us`;

const breadcrumbItems = [
  { label: "صفحه اصلی", to: "/" },
  { label: "درباره ما" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص کلیدی بالای صفحه
// ═══════════════════════════════════════════════════════════════════════════
const aboutHighlights = [
  {
    icon: "pi-users",
    title: "۵۰٬۰۰۰+ مشتری وفادار",
    subtitle: "همراهان عزیز خانواده نیمورا",
  },
  {
    icon: "pi-verified",
    title: "تضمین ۱۰۰٪ اصالت",
    subtitle: "کالای اصل با بچ‌کد قابل استعلام",
  },
  {
    icon: "pi-star",
    title: "۲۰۰+ برند برتر جهانی",
    subtitle: "لاین‌های تخصصی پوستی و آرایشی",
  },
  {
    icon: "pi-box",
    title: "نخستین استور ۳بعدی",
    subtitle: "نوآوری خرید واقعیت مجازی",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ارزش‌های بنیادین نیمورا
// ═════════════════════════════════════════════════════════════════════════════
const coreValues = [
  {
    icon: "pi-shield",
    title: "اصالت قطعی و تزلزل‌ناپذیر",
    desc: "سیاست عدم مماشات با کالای غیراصل. هر محصول مستقیماً از مبادی تاییدشده و با هولوگرام و بچ‌کد معتبر به دست مشتری می‌رسد.",
    highlight: "ضمانت بازگشت بدون قید و شرط",
  },
  {
    icon: "pi-heart",
    title: "سلامت‌محوری و ایمنی پوست",
    desc: "اولویت اول ما سلامت فردی شماست. تنها محصولاتی عرضه می‌شوند که دارای استانداردهای درماتولوژی و تاریخ مصرف تازه باشند.",
    highlight: "انبارداری در دمای استاندارد",
  },
  {
    icon: "pi-desktop",
    title: "نوآوری در تجربه خرید دیجیتال",
    desc: "پیشگامی در ارائه فروشگاه سه‌بعدی تعاملی، موتور جستجوی هوشمند و دسته‌بندی علمی برای تسهیل بی‌نقص‌ترین انتخاب.",
    highlight: "تلفیق فناوری و زیبایی",
  },
  {
    icon: "pi-globe",
    title: "پایداری و احترام به طبیعت",
    desc: "حمایت از برندهای بدون تست حیوانی (Cruelty-Free)، کاهش ضایعات پلاستیکی و استفاده از بسته‌بندی‌های بازیافت‌پذیر.",
    highlight: "دوستدار محیط زیست",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// نقاط عطف مسیر رشد و تایم‌لاین
// ═════════════════════════════════════════════════════════════════════════════
const milestoneSteps = [
  {
    year: "۱۳۹۹",
    icon: "pi-flag",
    title: "تولد ایده و آغاز رویای نیمورا",
    description:
      "شکل‌گیری هسته اولیه نیمورا با هدف عرضه مستقیم و بدون واسطه برگزیده‌ترین محصولات مراقبت پوستی و آرایشی اورجینال.",
  },
  {
    year: "۱۴۰۰",
    icon: "pi-shopping-bag",
    title: "راه‌اندازی پلتفرم آنلاین و مشاوره تخصصی",
    description:
      "رونمایی از وب‌سایت رسمی با سیستم هوشمند ثبت سفارش، سیستم پیگیری لحظه‌ای و تشکیل دپارتمان مشاوره پوست و زیبایی.",
  },
  {
    year: "۱۴۰۱",
    icon: "pi-send",
    title: "توسعه انبارداری استاندارد و ارسال سراسری",
    description:
      "استقرار پروتکل‌های بسته‌بندی چندلایه ضدضربه و امکان ارسال امن به تمامی شهرها و روستاهای سراسر کشور با پست پیشتاز.",
  },
  {
    year: "۱۴۰۲",
    icon: "pi-gift",
    title: "باشگاه مشتریان وفادار و ۲۰۰+ برند برتر",
    description:
      "گسترش سبد کالایی به بیش از ۲۰۰ برند جهانی، راه‌اندازی سیستم کش‌بک، کیف پول اعتباری و طرح تخفیف‌های ویژه.",
  },
  {
    year: "۱۴۰۳",
    icon: "pi-box",
    title: "رونمایی از نخستین استور ۳بعدی و مجله زیبایی",
    description:
      "ایجاد تحول در تجارت الکترونیک زیبایی با عرضه فروشگاه سه‌بعدی واقعیت مجازی و تولید محتوای غنی در مجله نیمورا.",
  },
  {
    year: "امروز و فردا",
    icon: "pi-sparkles",
    title: "توسعه مستمر در کنار ده‌ها هزار همراه وفادار",
    description:
      "تلاش شبانه‌روزی برای خلق تجربه‌ای فراتر از انتظار و تداوم همراهی صمیمانه با همراهان عزیز نیمورا در سراسر ایران.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// مراحل کنترل کیفیت
// ═════════════════════════════════════════════════════════════════════════════
const qcSteps = [
  {
    title: "استعلام بچ‌کد و بارکد رسمی سازنده",
    desc: "تطبیق سری ساخت و تاریخ تولید کالا در سامانه‌های معتبر بین‌المللی پیش از ورود به چرخه فروش.",
  },
  {
    title: "سنجش سلامت فیزیکی و پلمپ بهداشتی",
    desc: "بررسی دقیق سلفون، لیبل اطمینان و عدم وجود هرگونه نشتی یا نقص فیزیکی در ظروف و پمپ‌ها.",
  },
  {
    title: "بسته‌بندی ضربه‌گیر ویژه محموله‌های آرایشی",
    desc: "استفاده از پوشش بالشتک‌های هوا (Bubble Wrap) و کارتن‌های ۵ لایه مستحکم برای رسیدن کالا در کمال سلامت.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// پرسش‌های متداول درباره ما (FAQ)
// ═════════════════════════════════════════════════════════════════════════════
const aboutFaqs = [
  {
    question:
      "آیا تمامی کالاهای عرضه شده در فروشگاه نیمورا کاملاً اورجینال هستند؟",
    answer:
      "بله، بدون هیچ‌گونه استثنا. نیمورا تمامی محصولات خود را مستقیماً از نمایندگی‌های رسمی، واردکنندگان قانونی معتبر و برندهای اصلی تامین می‌کند. تضمین ۱۰۰٪ اصالت کالا و امکان مرجوعی ۷ روزه، پشتوانه این ادعای ماست.",
  },
  {
    question: "چگونه می‌توانم از تاریخ انقضا و اصالت محصول مطمئن شوم؟",
    answer:
      "تمامی محصولات نیمورا دارای تاریخ انقضای معتبر و تازه هستند. شما می‌توانید بچ‌کد (Batch Code) درج‌شده در زیر ظروف یا جعبه محصولات را در سامانه‌های جهانی بررسی اصالت (نظیر CheckFresh و CheckCosmetic) استعلام فرمایید.",
  },
  {
    question: "آیا نیمورا امکان خرید یا مراجعه حضوری نیز دارد؟",
    answer:
      "نیمورا یک فروشگاه تماماً اینترنتی و دیجیتال است. این مدل کاری به ما امکان می‌دهد بدون تحمیل هزینه‌های سنگین فروشگاه‌داری فیزیکی، کالاها را با بهترین قیمت ممکن، بسته‌بندی حرفه‌ای و ارسال فوری در اختیار هموطنان عزیز در سراسر کشور قرار دهیم.",
  },
  {
    question: "محصولات در چه شرایطی انبارداری و نگهداری می‌شوند؟",
    answer:
      "انبار مرکزی نیمورا مجهز به سیستم کنترل دما، رطوبت استاندارد و تهویه ۲۴ ساعته متناسب با موازین سازمان غذا و دارو است تا ساختار شیمیایی و اثربخشی کرم‌ها، سرم‌ها و عطرها در شرایط کاملاً بهینه حفظ شود.",
  },
  {
    question: "فروشگاه سه‌بعدی (3D Store) نیمورا چیست و چطور کار می‌کند؟",
    answer:
      "فروشگاه سه‌بعدی نیمورا یک محیط تعاملی و سه‌بعدی مجازی است که با استفاده از موتور گرافیکی مدرن طراحی شده است. شما می‌توانید با کیبورد یا لمس صفحه در فضای یک بوتیک زیبایی قدم بزنید و کالاها را بررسی نمایید.",
  },
  {
    question: "آیا امکان دریافت مشاوره تخصصی قبل از خرید وجود دارد؟",
    answer:
      "بله، کارشناسان مشاوره پوست و زیبایی نیمورا از طریق تیکت آنلاین در پنل کاربری، واتساپ و شماره تماس آماده راهنمایی شما در انتخاب مناسب‌ترین محصولات بر اساس نوع پوست و بودجه‌تان هستند.",
  },
  {
    question:
      "چطور می‌توانم برای همکاری‌های تجاری یا بازرگانی با نیمورا در ارتباط باشم؟",
    answer:
      "تولیدکنندگان، واردکنندگان رسمی و برندهای معتبر می‌توانند درخواست همکاری تجاری خود را از طریق صفحه «تماس با ما» یا ایمیل رسمی بازرگانی نیمورا ارسال فرمایند تا همکاران ما در اسرع وقت پیگیری نمایند.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: "درباره ما | داستان، رسالت و هویت فروشگاه اینترنتی نیمورا (Nimoura)",
  description:
    "آشنایی با فروشگاه اینترنتی نیمورا؛ مرجع تخصصی خرید آنلاین لوازم آرایشی و بهداشتی اورجینال، رسالت سلامت‌محور، تضمین ۱۰۰٪ اصالت و تجربه نوین خرید سه‌بعدی.",
  keywords:
    "درباره نیمورا, فروشگاه اینترنتی نیمورا, خرید لوازم آرایشی اصل, تاریخچه نیمورا, اصالت لوازم آرایشی, فروشگاه ۳ بعدی نیمورا, nimoura, داستان برند نیمورا",
  ogTitle: "درباره فروشگاه اینترنتی لوازم آرایشی و زیبایی نیمورا",
  ogDescription:
    "روایتی از اصالت، علم مراقبت پوستی و فناوری نوین؛ با فروشگاه تخصصی نیمورا بیشتر آشنا شوید.",
  ogImage: `${siteUrl}/og-image.webp`,
  ogUrl: canonicalUrl,
  ogType: "website",
  ogSiteName: "Nimoura | نیمورا",
  ogLocale: "fa_IR",
  twitterCard: "summary_large_image",
  twitterTitle: "درباره ما | فروشگاه آنلاین نیمورا",
  twitterDescription:
    "آشنایی با رسالت، ارزش‌ها و تعهد ۱۰۰٪ اصالت کالا در فروشگاه لوازم آرایشی نیمورا.",
  twitterImage: `${siteUrl}/og-image.webp`,
  robots: "index, follow, max-image-preview:large, max-snippet:-1",
  author: "فروشگاه اینترنتی نیمورا",
});

// ═══════════════════════════════════════════════════════════════════════════
// استراکچرد دیتاهای اسکیما (Schema.org JSON-LD Structured Data)
// ۱. AboutPage Schema
// ۲. Organization Schema
// ۳. BreadcrumbList Schema
// ۴. FAQPage Schema (Google Rich Snippets)
// ═══════════════════════════════════════════════════════════════════════════
useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
  script: [
    // ۱. AboutPage Schema
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "درباره فروشگاه اینترنتی نیمورا",
        description:
          "آشنایی با فروشگاه اینترنتی نیمورا، مرجع تخصصی خرید آنلاین لوازم آرایشی و مراقبت پوستی اورجینال با تضمین ۱۰۰٪ اصالت.",
        url: canonicalUrl,
        inLanguage: "fa-IR",
        mainEntity: {
          "@type": "Organization",
          name: "Nimoura",
          alternateName: "نیمورا",
          url: siteUrl,
          logo: `${siteUrl}/logo/favicon_256x256.png`,
          sameAs: [
            "https://www.instagram.com/nimoura.ir",
            "https://t.me/nimoura_ir",
          ],
        },
      }),
    },
    // ۲. Organization Schema
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Nimoura",
        alternateName: "فروشگاه اینترنتی نیمورا",
        url: siteUrl,
        logo: `${siteUrl}/logo/favicon_256x256.png`,
        description:
          "فروشگاه آنلاین محصولات آرایشی، بهداشتی و مراقبت پوست و مو با ضمانت اصالت کالا.",
        telephone: "+989036039314",
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+989036039314",
            contactType: "customer service",
            areaServed: "IR",
            availableLanguage: ["Persian"],
          },
        ],
      }),
    },
    // ۳. BreadcrumbList Schema
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
            name: "درباره ما",
            item: canonicalUrl,
          },
        ],
      }),
    },
    // ۴. FAQPage Schema (Google Rich Snippets)
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: aboutFaqs.map((faq) => ({
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

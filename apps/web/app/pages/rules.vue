<template>
  <main class="min-h-screen bg-nimoura-base pb-16 sm:pb-24">
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۱. هدر صفحه و بردکرامب (Breadcrumb & Ambient Hero) -->
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
            <!-- بج رسمی قوانین -->
            <div class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md">
              <i class="pi pi-book text-xs" />
              <span>منشور حقوق مشتریان و چارچوب شفاف همکاری</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1 class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl">
              قوانین و مقررات
              <span class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent">
                فروشگاه آنلاین نیمورا
              </span>
            </h1>

            <!-- توضیحات مقدمه -->
            <p class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose">
              به فروشگاه اینترنتی لوازم آرایشی و زیبایی نیمورا خوش آمدید. استفاده شما از امکانات وب‌سایت، ایجاد حساب کاربری، و ثبت سفارش به معنای آگاهی کامل و پذیرش بی قید و شرط تمامی شرایط و مقررات مندرج در این صفحه است. اصول کاری نیمورا کاملاً منطبق با قانون تجارت الکترونیکی، قانون حمایت از مصرف‌کننده، و ضوابط بهداشتی سازمان غذا و دارو تدوین گردیده است.
            </p>

            <!-- ۴ شاخص و تعهد کلیدی -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in ruleHighlights"
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
            <!-- 📷 PLACEHOLDER: بنر شاخص هدر صفحه قوانین و مقررات -->
            <div
              class="group relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-nimoura-primary/30 bg-linear-to-br from-white/95 via-nimoura-primary/5 to-nimoura-accent/10 p-6 text-center shadow-sm transition-all duration-300 hover:border-nimoura-primary/60 hover:shadow-md"
              aria-label="محل قرارگیری تصویر بنر قوانین و مقررات"
            >
              <div class="flex size-16 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-nimoura-primary/20 transition-transform duration-300 group-hover:scale-105">
                <i class="pi pi-file-check text-2xl text-nimoura-primary" />
              </div>
              <p class="mt-4 font-vazir text-sm font-bold text-nimoura-text-800">
                محل قرارگیری بنر شاخص قوانین و مقررات
              </p>
              <p class="mt-1 text-xs text-nimoura-text-500">
                ابعاد پیشنهادی: ۷۰۰ × ۵۰۰ پیکسل (وکتور سه‌بعدی منشور اخلاقی یا کتاب قانون)
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
    <!-- ۲. ناوبری سریع سرفصل‌های قوانین (Quick Navigation Chips) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <nav class="container mx-auto mt-8 px-4 sm:mt-10 sm:px-6 lg:px-8" aria-label="دسترسی سریع به فصول قوانین">
      <div class="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-nimoura-primary/15 bg-white/80 p-3 shadow-2xs backdrop-blur-sm sm:gap-2.5 sm:p-4">
        <a
          v-for="(chapter, cIdx) in chapters"
          :key="cIdx"
          :href="`#${chapter.id}`"
          class="inline-flex items-center gap-1.5 rounded-xl border border-nimoura-text-100 bg-nimoura-base/50 px-3 py-1.5 text-xs font-semibold text-nimoura-text-700 transition-all hover:border-nimoura-primary/40 hover:bg-nimoura-primary/10 hover:text-nimoura-primary"
        >
          <i :class="`pi ${chapter.icon} text-[11px]`" />
          <span>{{ chapter.navTitle }}</span>
        </a>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۳. فصول جامع و تفصیلی شرایط و قوانین (Chapters Grid) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <div class="container mx-auto mt-10 space-y-8 px-4 sm:mt-14 sm:space-y-12 sm:px-6 lg:px-8">
      <!-- ── فصل اول: تعاریف و اصول عمومی ── -->
      <section
        id="general"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-compass text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل اول</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                تعاریف، اصول کلی و ساعات اداری
              </h2>
            </div>
          </div>
          <Tag value="ماده ۱ تا ۵" severity="secondary" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            <strong class="font-bold text-nimoura-text-900">۱-۱. تعاریف اولیه:</strong>
            «فروشگاه اینترنتی نیمورا» به نشانی اینترنتی nimoura.ir به عنوان ارائه‌دهنده خدمات و کالاهای تخصصی آرایشی و مراقبتی شناخته می‌شود. «کاربر یا خریدار» به هر شخص حقیقی یا حقوقی اطلاق می‌شود که با مشخصات هویتی و شماره تماس معتبر در سایت ثبت‌نام نموده و از خدمات ثبت سفارش استفاده می‌کند.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۱-۲. ارتباطات الکترونیکی:</strong>
            هنگامی که شما از سرویس‌های نیمورا استفاده می‌کنید یا سفارش خود را ثبت می‌نمایید، این ارتباطات به صورت الکترونیکی (پیامک، ایمیل، تیکت کاربری و فاکتور دیجیتال) صورت می‌پذیرد. کلیه پیام‌ها، اطلاعیه‌ها و پاسخ‌هایی که از مجاری رسمی نیمورا برای شما ارسال می‌شوند، جنبه ابلاغیه قانونی و معتبر دارند.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۱-۳. روزهای کاری و پاسخگویی:</strong>
            روزهای کاری نیمورا از روز شنبه تا چهارشنبه از ساعت ۹:۰۰ الی ۱۸:۰۰ و روزهای پنج‌شنبه از ساعت ۹:۰۰ الی ۱۴:۰۰ (به استثنای تعطیلات رسمی تقویم کشور) می‌باشد. ثبت سفارش در تمامی روزهای هفته و در ۲۴ ساعت شبانه‌روز امکان‌پذیر بوده و پردازش در نخستین ساعات کاری روز بعد انجام می‌گردد.
          </p>
        </div>
      </section>

      <!-- ── فصل دوم: حساب کاربری، امنیت و حریم خصوصی ── -->
      <section
        id="account-privacy"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-lock text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل دوم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                حساب کاربری، امنیت رمز عبور و حریم خصوصی
              </h2>
            </div>
          </div>
          <Tag value="ماده ۶ تا ۹" severity="success" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            <strong class="font-bold text-nimoura-text-900">۲-۱. ثبت اطلاعات صحیح:</strong>
            مسئولیت صحت و دقت اطلاعات فردی وارد شده از جمله نام، نام خانوادگی، شماره تماس همراه و نشانی دقیق پستی بر عهده کاربر است. ورود اطلاعات نادرست یا ناقص ممکن است به عدم امکان تحویل مرسوله توسط پست و تحمیل هزینه‌های ارسال مجدد منجر گردد.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۲-۲. حفاظت از کدهای یکبار مصرف (OTP):</strong>
            ورود به حساب کاربری نیمورا از طریق رمز یکبار مصرف پیامکی انجام می‌شود. خریدار موظف به حفظ و صیانت از کدهای دریافتی بوده و هرگونه فعالیتی که از طریق شماره موبایل تاییدشده انجام شود، منتسب به صاحب خط تلقی خواهد شد.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۲-۳. تعهد قطعی به حریم خصوصی:</strong>
            نیمورا متعهد است اطلاعات خصوصی کاربران (شامل شماره همراه، آدرس‌ها، تاریخچه خریدها و پیام‌ها) را محرمانه تلقی کرده و به هیچ عنوان آن را در اختیار افراد یا سازمان‌های تبلیغاتی ثالث قرار ندهد، مگر با حکم مستقیم مراجع قضایی ذی‌صلاح.
          </p>
        </div>
      </section>

      <!-- ── فصل سوم: ثبت، پردازش و ارسال سفارش ── -->
      <section
        id="orders"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-shopping-bag text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل سوم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                ثبت سفارش، نهایی‌سازی و فرآیند ارسال
              </h2>
            </div>
          </div>
          <Tag value="ماده ۱۰ تا ۱۴" severity="secondary" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            <strong class="font-bold text-nimoura-text-900">۳-۱. نهایی‌سازی و صدور فاکتور:</strong>
            افزودن کالا به سبد خرید به منزله رزرو قطعی موجودی کالا نیست. سفارش تنها پس از پرداخت آنلاین موفقیت‌آمیز و صدور شناسه پیگیری قطعی شده و وارد فرآیند بسته‌بندی انبار می‌گردد.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۳-۲. موجودی و اتمام کالا:</strong>
            نیمورا همواره تلاش می‌کند موجودی کالاها را در دقیق‌ترین حالت به‌روز نگه دارد. با این حال در موارد استثنایی که به دلیل تقاضای همزمان یا مغایرت انبار کالایی ناموجود شود، حق لغو سفارش برای نیمورا محفوظ بوده و مبلغ پرداختی ظرف حداکثر ۲۴ الی ۷۲ ساعت به حساب خریدار عودت داده می‌شود.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۳-۳. تحویل مرسوله به گیرنده:</strong>
            تحویل کالا در اماکن عمومی نامشخص (مانند خیابان، کافی‌نت یا هتل) مقدور نیست و نشانی ثبت‌شده باید دقیق و قابل استناد باشد. مامور محترم پست موظف است بسته را با تطبیق نشانی تحویل دهد و در صورت عدم حضور خریدار، مرسوله به باجه معطله پستی انتقال می‌یابد.
          </p>
        </div>
      </section>

      <!-- 📷 PLACEHOLDER: تصویر یا اینفوگرافیک منشور قوانین نیمورا -->
      <div
        class="group flex aspect-21/5 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-nimoura-primary/30 bg-white/70 p-5 text-center transition-all hover:border-nimoura-primary/60"
        aria-label="محل قرارگیری اینفوگرافیک منشور اخلاقی و قوانین خرید"
      >
        <div class="flex items-center gap-2 text-nimoura-primary">
          <i class="pi pi-image text-lg" />
          <span class="font-vazir text-xs font-bold sm:text-sm">محل تصویر / اینفوگرافیک راهنمای منشور اخلاقی و شفافیت خرید در نیمورا</span>
        </div>
        <span class="mt-1 text-[11px] text-nimoura-text-400">ابعاد پیشنهادی: ۹۰۰ × ۲۵۰ پیکسل</span>
      </div>

      <!-- ── فصل چهارم: ضوابط اختصاصی محصولات آرایشی، بهداشتی و سلامت ── -->
      <section
        id="cosmetics-hygiene"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <i class="pi pi-shield text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-amber-700">فصل چهارم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                ضوابط اختصاصی اقلام آرایشی، بهداشتی و مراقبت پوستی
              </h2>
            </div>
          </div>
          <Tag value="ماده ۱۵ تا ۱۹" severity="warn" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <div class="rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4">
            <h3 class="font-vazir text-xs font-bold text-amber-900 sm:text-sm">
              ۴-۱. الزامات استریل و بهداشت عمومی (پلمپ غیرقابل بازگشت):
            </h3>
            <p class="mt-1 text-amber-950">
              با توجه به ضوابط رسمی وزارت بهداشت و سازمان غذا و دارو، کلیه محصولات آرایشی (مانند رژلب، ریمل، کرم‌پودر، رژگونه) و اقلام مراقبت پوستی و مو (نظیر سرم‌ها، ضدآفتاب‌ها، لوسیون‌ها و ماسک‌ها) پس از باز شدن پلمپ، سلفون یا درپوش محافظ به هیچ عنوان قابلیت تعویض یا مرجوعی ندارند. جهت مطالعه کامل به صفحه
              <NuxtLink to="/return-policy" class="font-bold underline">رویه بازگرداندن کالا</NuxtLink>
              مراجعه فرمایید.
            </p>
          </div>

          <p>
            <strong class="font-bold text-nimoura-text-900">۴-۲. تفاوت رنگ و کالیبراسیون نمایشگرها:</strong>
            عکس‌های درج شده برای محصولات با حداکثر تطابق رنگی عکاسی شده‌اند؛ با این وجود به دلیل تفاوت در تنظیمات کنتراست، نور و زاویه دید نمایشگرهای گوناگون گوشی و مانیتور، امکان اختلاف جزئی در تنالیته رنگ واقعی وجود دارد که به عنوان نقص کیفی یا مغایرت کالا تلقی نمی‌گردد.
          </p>

          <p>
            <strong class="font-bold text-nimoura-text-900">۴-۳. مشاوره زیبایی در برابر توصیه پزشکی:</strong>
            اطلاعات، نقد و بررسی‌ها و مشاوره‌های ارائه‌شده در سایت و بخش مجله نیمورا صرفاً جنبه آگاهی‌بخشی و راهنمای زیبایی عمومی دارد. در صورت ابتلا به آلرژی‌های شدید پوستی، اگزما یا بیماری‌های خاص، مشاوره با پزشک متخصص پیش از استفاده از هرگونه محصول آرایشی الزامی است.
          </p>
        </div>
      </section>

      <!-- ── فصل پنجم: قیمت‌گذاری، کدهای تخفیف و جشنواره‌ها ── -->
      <section
        id="pricing-discounts"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-tag text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل پنجم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                سیاست‌های قیمت‌گذاری، کدهای تخفیف و بن‌ها
              </h2>
            </div>
          </div>
          <Tag value="ماده ۲۰ تا ۲۳" severity="secondary" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            <strong class="font-bold text-nimoura-text-900">۵-۱. شفافیت قیمت‌ها:</strong>
            قیمت کلیه محصولات در نیمورا به صورت ریال و تومان به طور شفاف درج گردیده است. قیمت‌ها تحت نظارت و با در نظر گرفتن نوسانات رسمی بازار آرایشی تعیین می‌شوند. پس از ثبت نهایی سفارش، هیچ‌گونه افزایش قیمتی بر روی فاکتور ثبت‌شده اعمال نخواهد شد.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۵-۲. شرایط استفاده از کدهای تخفیف و معرف:</strong>
            کدهای تخفیف، بن‌های خرید و کدهای معرف دارای شرایط، سقف مصرف و مهلت اعتبار مشخص هستند و امکان ادغام چندین کد تخفیف به طور همزمان روی یک سفارش مقدور نیست. ایجاد چند حساب کاربری برای دریافت مکرر هدیه خرید اول مصداق نقض مقررات بوده و سیستم حق غیرفعال‌سازی اکانت‌های متخلف را دارد.
          </p>
        </div>
      </section>

      <!-- ── فصل ششم: مالکیت معنوی، کپی‌رایت و محتوا ── -->
      <section
        id="copyright"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-bookmark text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل ششم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                حقوق مالکیت فکری و کپی‌رایت
              </h2>
            </div>
          </div>
          <Tag value="ماده ۲۴ تا ۲۶" severity="contrast" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            تمامی عناصر، تصاویر اختصاصی، موشن‌ها، مقالات مجله نیمورا، توضیحات محصولات، ساختار ۳بعدی استور، طراحی گرافیکی قالب و نشان تجاری ثبت‌شده «نیمورا» منحصراً متعلق به این مجموعه است. هرگونه کپی‌برداری جزئی یا کلی، بازنشر تجاری، یا اسکرپ خودکار داده‌ها بدون دریافت مجوز کتبی رسمی، پیگرد قانونی طبق قانون حمایت از حقوق پدیدآورندگان به همراه خواهد داشت.
          </p>
        </div>
      </section>

      <!-- ── فصل هفتم: نظرات، ارتباطات و قوه قهریه ── -->
      <section
        id="force-majeure"
        class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-8 lg:p-10"
      >
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
              <i class="pi pi-comments text-xl" />
            </div>
            <div>
              <span class="text-xs font-bold text-nimoura-primary">فصل هفتم</span>
              <h2 class="font-modam text-lg font-bold text-nimoura-text-900 sm:text-2xl">
                ثبت نظرات کاربران و شرایط قوه قهریه (فورس‌ماژور)
              </h2>
            </div>
          </div>
          <Tag value="ماده ۲۷ تا ۳۰" severity="secondary" class="text-xs" />
        </div>

        <div class="space-y-4 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:space-y-5 sm:leading-loose">
          <p>
            <strong class="font-bold text-nimoura-text-900">۷-۱. ضوابط ثبت دیدگاه:</strong>
            بخش نظرات بستری برای تبادل تجربه واقعی مصرف محصولات است. از درج الفاظ غیرمودبانه، انتشار شایعات، تبلیغ سایت‌های دیگر، یا درج اطلاعات شخصی خودداری نمایید. نظرات حاوی موارد نامربوط توسط سیستم مانیتورینگ تایید نخواهند شد.
          </p>
          <p>
            <strong class="font-bold text-nimoura-text-900">۷-۲. قوه قهریه (Force Majeure):</strong>
            تمامی شرایط و قوانین مندرج در شرایط عادی قابل اجراست و در صورت بروز حوادث غیرمترقبه نظیر بلایای طبیعی، سیل، زلزله، اختلالات سراسری خطوط ارتباطی و اینترنت کشور، اعتصابات یا شرایط بحرانی فراتر از کنترل مجموعه، نیمورا هیچ‌گونه مسئولیتی در قبال تاخیرهای ناشی از آن نخواهد داشت؛ با این حال تیم ما نهایت تلاش خود را برای جلب رضایت و احقاق حقوق مشتریان مبذول خواهد داشت.
          </p>
        </div>
      </section>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. سوالات متداول با PrimeVue Accordion (Rules FAQ) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10">
        <div class="mb-8 text-center sm:mb-10">
          <div class="inline-flex items-center gap-2 rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary">
            <i class="pi pi-question-circle" />
            <span>پاسخ به سوالات حقوقی کاربران</span>
          </div>
          <h2 class="mt-2 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl">
            پرسش‌های متداول قوانین و مقررات
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm">
            شفاف‌سازی سوالات رایج کاربران درباره ثبت سفارش، ابطال و موازین خرید اینترنتی.
          </p>
        </div>

        <!-- PrimeVue Accordion -->
        <Accordion value="rule-0" class="space-y-3">
          <AccordionPanel
            v-for="(faq, idx) in rulesFaqs"
            :key="idx"
            :value="`rule-${idx}`"
            class="overflow-hidden rounded-2xl border border-nimoura-text-100/90 transition-all duration-200 hover:border-nimoura-primary/30"
          >
            <AccordionHeader class="font-vazir text-sm font-bold text-nimoura-text-800 transition-colors sm:text-base">
              <div class="flex items-center gap-2.5">
                <i class="pi pi-info-circle text-nimoura-primary text-sm" />
                <span>{{ faq.question }}</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="pt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-loose">
                <p>{{ faq.answer }}</p>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۵. باکس امور مشتریان و شکایات حقوقی (Customer Support CTA) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-[#F6E9EB] via-[#FFF8F4] to-[#F6E9EB] p-6 shadow-sm sm:p-10">
        <div class="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-nimoura-primary/10 blur-3xl" />

        <div class="grid items-center gap-8 lg:grid-cols-12">
          <div class="space-y-3 text-center lg:col-span-8 lg:text-start">
            <Tag value="رسیدگی به شکایات و امور حقوقی" severity="contrast" class="text-xs" />

            <h2 class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl">
              پرسش حقوقی یا شکایتی دارید؟ ما مشتاقانه پاسخگو هستیم
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              واحد رسیدگی به امور مشتریان و امور حقوقی نیمورا به صورت مستقیم آماده دریافت پیشنهادات، انتقادات، یا شکایات خریداران گرامی جهت بررسی و حل سریع موضوعات است.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4">
              <!-- دکمه ثبت تیکت -->
              <Button
                as="router-link"
                to="/profile/tickets"
                icon="pi pi-ticket"
                label="ثبت تیکت رسیدگی به شکایات"
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
                to="https://wa.me/989021027574"
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

          <!-- 📷 PLACEHOLDER: تصویر یا بنر امور حقوقی و پشتیبانی -->
          <div class="lg:col-span-4">
            <div
              class="group flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-nimoura-primary/30 bg-white/80 p-4 text-center transition-all hover:border-nimoura-primary/60"
              aria-label="محل تصویر تیم امور مشتریان و حقوقی نیمورا"
            >
              <div class="flex size-12 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
                <i class="pi pi-shield-check text-xl" />
              </div>
              <p class="mt-2 font-vazir text-xs font-bold text-nimoura-text-800">
                محل تصویر منشور حقوقی و پشتیبانی مشتریان
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
// ═════════════════════════════════════════════════════════════════════════════
// دیتای بردکرامب و آدرس‌ها
// ═════════════════════════════════════════════════════════════════════════════
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.ir';
const canonicalUrl = `${siteUrl}/rules`;

const breadcrumbItems = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'شرایط و قوانین استفاده' },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص کلیدی بالای صفحه
// ═════════════════════════════════════════════════════════════════════════════
const ruleHighlights = [
  {
    icon: 'pi-verified',
    title: 'قانون تجارت الکترونیک',
    subtitle: 'انطباق ۱۰۰٪ با موازین قانونی',
  },
  {
    icon: 'pi-lock',
    title: 'حفظ حریم خصوصی',
    subtitle: 'محرمانگی کامل اطلاعات کاربران',
  },
  {
    icon: 'pi-tag',
    title: 'شفافیت قیمت‌گذاری',
    subtitle: 'بدون هیچ‌گونه هزینه پنهان',
  },
  {
    icon: 'pi-headphones',
    title: 'رسیدگی به شکایات',
    subtitle: 'رسیدگی دقیق واحد امور مشتریان',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// لیست فصول جهت ناوبری سریع
// ═════════════════════════════════════════════════════════════════════════════
const chapters = [
  { id: 'general', navTitle: 'اصول کلی و تعاریف', icon: 'pi-compass' },
  { id: 'account-privacy', navTitle: 'حساب و حریم خصوصی', icon: 'pi-lock' },
  { id: 'orders', navTitle: 'ثبت و ارسال سفارش', icon: 'pi-shopping-bag' },
  { id: 'cosmetics-hygiene', navTitle: 'موازین بهداشتی اقلام آرایشی', icon: 'pi-shield' },
  { id: 'pricing-discounts', navTitle: 'قیمت‌ها و تخفیف‌ها', icon: 'pi-tag' },
  { id: 'copyright', navTitle: 'مالکیت فکری و حق نشر', icon: 'pi-bookmark' },
  { id: 'force-majeure', navTitle: 'نظرات و فورس‌ماژور', icon: 'pi-comments' },
];

// ═════════════════════════════════════════════════════════════════════════════
// سوالات متداول قوانین و مقررات (FAQ)
// ═════════════════════════════════════════════════════════════════════════════
const rulesFaqs = [
  {
    question: 'آیا برای خرید از نیمورا، عضویت در سایت الزامی است؟',
    answer: 'بله. برای ثبت سفارش، صدور فاکتور رسمی الکترونیک، اختصاص کد رهگیری پستی و استفاده از مزایای گارانتی و باشگاه مشتریان، ثبت‌نام با شماره تلفن همراه معتبر و دریافت کد تایید الزامی است.',
  },
  {
    question: 'آیا پس از ثبت نهایی سفارش، امکان لغو یا تغییر اقلام وجود دارد؟',
    answer: 'تا زمانی که وضعیت سفارش در مرحله «در انتظار بررسی» یا پیش از شروع فرآیند بسته‌بندی انبار باشد، می‌توانید از طریق تماس با پشتیبانی درخواست لغو یا ویرایش را ثبت فرمایید. در صورت تحویل مرسوله به شرکت پست، لغو سفارش تنها پس از تحویل و مطابق ضوابط مرجوعی کالا امکان‌پذیر خواهد بود.',
  },
  {
    question: 'در صورت مغایرت قیمت ثبت شده به دلیل اختلال سیستمی، قانون چه حکمی دارد؟',
    answer: 'در مواردی که به دلیل اختلالات فنی سرور قیمت یک کالا با اختلاف فاحش و غیرواقعی درج شود، نیمورا حق لغو سفارش و عودت کامل وجه به حساب خریدار را داراست و ثبت سفارش در این شرایط تعهدی برای ارسال ایجاد نمی‌کند.',
  },
  {
    question: 'چرا لوازم آرایشی و بهداشتی باز شده غیرقابل تعویض هستند؟',
    answer: 'طبق دستورالعمل‌های رسمی سازمان غذا و دارو و وزارت بهداشت، محصولات آرایشی به دلیل تماس مستقیم با بافت پوست، چشم و مو، جزو اقلام حساس سلامت‌محور هستند و پس از باز شدن پلمپ به هیچ وجه امکان بازگشت یا فروش مجدد به شخص دیگر ندارند.',
  },
  {
    question: 'آیا می‌توان از کدهای تخفیف به صورت نامحدود و همزمان استفاده کرد؟',
    answer: 'خیر، هر کد تخفیف دارای شرایط، تاریخ انقضا و حداقل خرید مشخص بوده و در هر فاکتور تنها امکان اعمال یک کد تخفیف یا معرف وجود دارد.',
  },
  {
    question: 'در صورت عدم حضور خریدار در محل تحویل پستی چه اتفاقی می‌افتد؟',
    answer: 'مامور پست مرسوله را به باجه معطله پستی منطقه تحویل می‌دهد و خریدار تا مهلت مقرر می‌تواند با ارائه کارت شناسایی بسته را تحویل بگیرد. در صورت عدم مراجعه و برگشت مرسوله به انبار نیمورا، هزینه ارسال مجدد بر عهده خریدار خواهد بود.',
  },
  {
    question: 'چگونه می‌توانم پیشنهاد یا شکایت خود را به طور رسمی ثبت کنم؟',
    answer: 'خریداران محترم می‌توانند از طریق ورود به حساب کاربری و بخش تیکت‌ها با انتخاب موضوع «امور مشتریان / شکایات» یا تماس با شماره پشتیبانی 09036039314 درخواست خود را ثبت نمایند تا ظرف حداکثر ۲۴ ساعت کاری بررسی و پاسخ داده شود.',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: 'شرایط و قوانین استفاده از فروشگاه | نیمورا (Nimoura)',
  description:
    'مطالعه شرایط و قوانین خرید اینترنتی، ضوابط بهداشتی محصولات آرایشی، حفظ حریم خصوصی کاربران، رویه ثبت و ارسال سفارش و تعهدات حقوقی فروشگاه اینترنتی نیمورا.',
  keywords:
    'قوانین نیمورا, شرایط استفاده نیمورا, حریم خصوصی نیمورا, قوانین مرجوعی آرایشی, قوانین خرید اینترنتی لوازم آرایشی, ضوابط تجارت الکترونیک نیمورا, ثبت شکایت نیمورا',
  ogTitle: 'قوانین و مقررات فروشگاه اینترنتی نیمورا',
  ogDescription:
    'شرایط و قوانین عمومی استفاده، ثبت سفارش، حریم خصوصی، و ضوابط بهداشتی محصولات آرایشی و زیبایی در نیمورا.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: canonicalUrl,
  ogType: 'article',
  ogSiteName: 'Nimoura | نیمورا',
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
  twitterTitle: 'قوانین و مقررات فروشگاه آنلاین نیمورا',
  twitterDescription:
    'راهنمای کامل مقررات استفاده، حریم خصوصی و رویه ارسال و مرجوعی در فروشگاه لوازم آرایشی نیمورا.',
  twitterImage: `${siteUrl}/og-image.png`,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1',
  author: 'فروشگاه اینترنتی نیمورا',
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
        name: 'قوانین و مقررات فروشگاه اینترنتی نیمورا',
        description:
          'شرایط و قوانین عمومی استفاده، ثبت سفارش، حریم خصوصی و ضوابط بهداشتی محصولات در فروشگاه اینترنتی نیمورا.',
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
            name: 'قوانین و مقررات',
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
        mainEntity: rulesFaqs.map((faq) => ({
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

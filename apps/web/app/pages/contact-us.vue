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
            <!-- بج طلایی تماس -->
            <div class="inline-flex items-center gap-2 rounded-full border border-nimoura-primary/25 bg-white/80 px-4 py-1.5 text-xs font-semibold text-nimoura-primary shadow-xs backdrop-blur-md">
              <i class="pi pi-headphones text-xs" />
              <span>پاسخگویی سریع، مشاوره تخصصی و همراهی همیشگی</span>
            </div>

            <!-- عنوان اصلی سئو H1 -->
            <h1 class="font-modam text-2xl font-black tracking-tight text-nimoura-text-900 sm:text-4xl lg:text-4xl xl:text-5xl">
              تماس با
              <span class="bg-linear-to-l from-nimoura-primary to-nimoura-velvet bg-clip-text text-transparent">
                نیمورا (Nimoura)
              </span>
              ؛ همیشه در کنار شما
            </h1>

            <!-- توضیحات مقدمه -->
            <p class="mx-auto max-w-2xl text-sm leading-relaxed text-nimoura-text-600 lg:mx-0 sm:text-base sm:leading-loose">
              پرسشی درباره انتخاب محصول متناسب با پوست خود دارید؟ مایلید وضعیت بسته ارسالی‌تان را پیگیری کنید، یا در خصوص همکاری‌های تجاری با ما گفتگو کنید؟ تیم مشاوران تخصصی و پشتیبانی امور مشتریان نیمورا با کمال میل و افتخار در تمامی روزهای کاری مشتاق شنیدن صدای گرم شما هستند.
            </p>

            <!-- ۴ شاخص و راه‌های ارتباطی سریع -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(stat, idx) in contactStats"
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
            <!-- 📷 PLACEHOLDER: بنر شاخص هدر تماس با ما -->
            <!-- جهت جایگزینی با تصویر نهایی، این کادر را با NuxtImg یا تگ img جایگزین فرمایید. -->
            <div
              class="group relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-nimoura-primary/30 bg-linear-to-br from-white/95 via-nimoura-primary/5 to-nimoura-accent/10 p-6 text-center shadow-sm transition-all duration-300 hover:border-nimoura-primary/60 hover:shadow-md"
              aria-label="محل قرارگیری تصویر بنر ارتباط با ما"
            >
              <div class="flex size-16 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-nimoura-primary/20 transition-transform duration-300 group-hover:scale-105">
                <i class="pi pi-comments text-2xl text-nimoura-primary" />
              </div>
              <p class="mt-4 font-vazir text-sm font-bold text-nimoura-text-800">
                محل قرارگیری تصویر شاخص / تیم پشتیبانی
              </p>
              <p class="mt-1 text-xs text-nimoura-text-500">
                ابعاد پیشنهادی: ۷۰۰ × ۵۰۰ پیکسل (عکاسی از مرکز پاسخگویی یا مشاوره پوستی)
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
    <!-- ۲. پل‌های ارتباطی اصلی (Direct Channels Grid) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-10">
        <span class="text-xs font-bold tracking-wider text-nimoura-primary uppercase">مسیرهای ارتباط مستقیم</span>
        <h2 class="mt-1 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl">
          راه‌های برقراری ارتباط با نیمورا
        </h2>
        <p class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm">
          بسته به نوع درخواست، می‌توانید از کانال‌های متنوع زیر در کوتاه‌ترین زمان با ما در تماس باشید.
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(channel, idx) in directChannels"
          :key="idx"
          class="group flex flex-col justify-between rounded-3xl border border-nimoura-text-100/80 bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-nimoura-primary/40 hover:shadow-md sm:p-6"
        >
          <div>
            <div class="mb-4 flex items-center justify-between">
              <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/15 transition-transform duration-300 group-hover:scale-110">
                <i :class="`pi ${channel.icon} text-xl`" />
              </div>
              <Tag :value="channel.badge" :severity="channel.badgeSeverity" class="text-[10px]" />
            </div>

            <h3 class="font-vazir text-base font-bold text-nimoura-text-900 sm:text-lg">
              {{ channel.title }}
            </h3>

            <p class="mt-2 text-xs leading-relaxed text-nimoura-text-600 sm:text-sm sm:leading-relaxed">
              {{ channel.description }}
            </p>
          </div>

          <div class="mt-5 border-t border-nimoura-text-100/60 pt-3">
            <NuxtLink
              v-if="channel.href"
              :to="channel.href"
              :target="channel.external ? '_blank' : undefined"
              :rel="channel.external ? 'noopener noreferrer' : undefined"
              class="inline-flex w-full items-center justify-between gap-1 text-xs font-bold text-nimoura-primary hover:underline"
            >
              <span dir="ltr">{{ channel.actionLabel }}</span>
              <i class="pi pi-arrow-left text-[10px]" />
            </NuxtLink>
            <span v-else class="text-xs font-bold text-nimoura-text-700">
              {{ channel.actionLabel }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۳. فرم تماس و ارتباط آنلاین + اطلاعات دفتر (Interactive Form & Office Info) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div class="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <!-- ستون سمت راست: فرم آنلاین ارتباط با ما -->
        <div class="rounded-3xl border border-nimoura-primary/20 bg-white p-6 shadow-xs lg:col-span-7 sm:p-10">
          <div class="mb-6 space-y-1.5">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-nimoura-primary">
              <i class="pi pi-send" />
              <span>ارسال پیام آنلاین</span>
            </div>
            <h2 class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl">
              فرم ارسال پیام به کارشناسان نیمورا
            </h2>
            <p class="text-xs text-nimoura-text-500 sm:text-sm">
              پیام شما مستقیماً توسط دپارتمان مربوطه دریافت شده و ظرف کمتر از ۲۴ ساعت کاری پاسخ داده می‌شود.
            </p>
          </div>

          <!-- پیام ارسال موفق -->
          <Transition name="fade">
            <div
              v-if="formSubmitted"
              class="mb-6 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-5 text-emerald-800"
            >
              <div class="flex items-center gap-3">
                <i class="pi pi-check-circle text-2xl text-emerald-600" />
                <div>
                  <h4 class="font-vazir text-sm font-bold">پیام شما با موفقیت ثبت گردید!</h4>
                  <p class="mt-0.5 text-xs text-emerald-700">
                    پیام شما در سیستم پشتیبانی ثبت و به کارشناسان مربوطه ارجاع داده شد. کارشناسان ما به زودی از طریق تماس یا پیامک با شما در ارتباط خواهند بود.
                  </p>
                  <p v-if="submittedTicketCode" class="mt-2 text-xs font-semibold text-emerald-900">
                    کد پیگیری تیکت: <span class="font-mono text-sm tracking-wider font-bold">{{ submittedTicketCode }}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="mt-4 text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
                @click="resetForm"
              >
                ارسال پیام جدید
              </button>
            </div>
          </Transition>

          <!-- پیام خطا -->
          <div
            v-if="errorMessage"
            class="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
          >
            <i class="pi pi-exclamation-triangle text-base text-rose-500" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- فیلدهای فرم تماس -->
          <form v-if="!formSubmitted" class="space-y-4 sm:space-y-5" @submit.prevent="handleSubmit">
            <div class="grid gap-4 sm:grid-cols-2">
              <!-- نام و نام خانوادگی -->
              <div>
                <label for="contact-name" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                  نام و نام خانوادگی <span class="text-rose-500">*</span>
                </label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="مثال: سارا محمدی"
                  class="w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm"
                />
              </div>

              <!-- شماره تلفن همراه -->
              <div>
                <label for="contact-mobile" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                  شماره موبایل <span class="text-rose-500">*</span>
                </label>
                <input
                  id="contact-mobile"
                  v-model="form.mobile"
                  type="tel"
                  dir="ltr"
                  inputmode="numeric"
                  required
                  placeholder="09xxxxxxxxx"
                  class="font-modam w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm text-right"
                />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <!-- ایمیل -->
              <div>
                <label for="contact-email" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                  آدرس ایمیل (اختیاری)
                </label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  class="w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm"
                />
              </div>

              <!-- موضوع پیام -->
              <div>
                <label for="contact-subject" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                  موضوع پیام <span class="text-rose-500">*</span>
                </label>
                <select
                  id="contact-subject"
                  v-model="form.subject"
                  required
                  class="w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm"
                >
                  <option value="" disabled>انتخاب موضوع...</option>
                  <option value="skincare">مشاوره تخصصی روتین پوستی و زیبایی</option>
                  <option value="order">پیگیری و وضعیت سفارش جاری</option>
                  <option value="return">درخواست مرجوعی و گارانتی ۷ روزه</option>
                  <option value="complaint">انتقادات، پیشنهادات و شکایات</option>
                  <option value="b2b">همکاری تجاری، بازرگانی و تامین کالا</option>
                  <option value="other">سایر پرسش‌ها</option>
                </select>
              </div>
            </div>

            <!-- شماره سفارش (اختیاری) -->
            <div>
              <label for="contact-order-id" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                شماره سفارش (در صورت وجود)
              </label>
              <input
                id="contact-order-id"
                v-model="form.orderId"
                type="text"
                dir="ltr"
                placeholder="مثال: ORD-140308-..."
                class="font-modam w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm"
              />
            </div>

            <!-- متن پیام -->
            <div>
              <label for="contact-message" class="mb-1.5 block text-xs font-semibold text-nimoura-text-800 sm:text-sm">
                متن پیام شما <span class="text-rose-500">*</span>
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                rows="4"
                required
                placeholder="توضیحات، پرسش یا نظر خود را با جزئیات بنویسید..."
                class="w-full rounded-xl border border-nimoura-text-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-nimoura-text-900 transition-all focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/20 sm:text-sm"
              />
            </div>

            <div class="pt-2">
              <Button
                type="submit"
                :loading="submitting"
                icon="pi pi-send"
                label="ارسال پیام به پشتیبانی"
                class="bg-nimoura-primary! border-nimoura-primary! text-white! rounded-xl! font-vazir! text-xs! sm:text-sm! px-6! py-3! w-full! sm:w-auto!"
              />
            </div>
          </form>
        </div>

        <!-- ستون سمت چپ: شیوه فعالیت آنلاین، پاسخگویی و تعهدات -->
        <div class="space-y-6 lg:col-span-5">
          <!-- کارت فروشگاه تماماً آنلاین -->
          <div class="rounded-3xl border border-nimoura-primary/20 bg-linear-to-br from-white via-[#FFF8F5] to-white p-6 shadow-xs sm:p-8">
            <div class="flex items-center gap-3">
              <div class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/15 text-nimoura-primary ring-1 ring-nimoura-primary/25">
                <i class="pi pi-globe text-xl" />
              </div>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-nimoura-primary">فعالیت کاملاً آنلاین</span>
                <h3 class="font-modam text-base font-bold text-nimoura-text-900 sm:text-lg">
                  فروشگاه ۱۰۰٪ دیجیتال و سراسری
                </h3>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-nimoura-primary/15 bg-white/80 p-4 text-xs leading-relaxed text-nimoura-text-700 sm:text-sm sm:leading-loose">
              <p>
                <strong class="text-nimoura-text-900 font-bold">فروشگاه آنلاین نیمورا فاقد شعبه فیزیکی و امکان مراجعه حضوری است.</strong>
                کلیه فرایندهای مشاوره تخصصی، ثبت سفارش، بسته‌بندی بهداشتی در شرایط ایزوله و ارسال محصولات به صورت کاملاً متمرکز و هوشمند از طریق وب‌سایت انجام می‌گردد تا مرسولات در نهایت سرعت، امنیت و با تضمین اصالت به دست شما در سراسر کشور برسد.
              </p>
            </div>

            <div class="mt-5 space-y-4 text-xs text-nimoura-text-700 sm:text-sm">
              <div class="flex items-start gap-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary">
                  <i class="pi pi-clock text-sm" />
                </div>
                <div>
                  <strong class="font-bold text-nimoura-text-900">ساعات کاری و پاسخگویی تیم پشتیبانی:</strong>
                  <p class="mt-0.5 text-nimoura-text-600 leading-relaxed">
                    شنبه تا چهارشنبه: ۹:۰۰ الی ۱۸:۰۰<br>
                    پنج‌شنبه‌ها: ۹:۰۰ الی ۱۴:۰۰<br>
                    (ایام تعطیل رسمی: پاسخگویی از طریق فرم و سیستم تیکتینگ آنلاین)
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 border-t border-nimoura-text-100 pt-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary">
                  <i class="pi pi-phone text-sm" />
                </div>
                <div>
                  <strong class="font-bold text-nimoura-text-900">پاسخگویی تلفنی و پشتیبانی:</strong>
                  <p class="mt-0.5 text-nimoura-text-600 font-mono text-xs" dir="ltr">
                    <a href="tel:09036039314" class="font-bold text-nimoura-primary hover:underline">09036039314</a>
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 border-t border-nimoura-text-100 pt-3">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nimoura-primary/10 text-nimoura-primary">
                  <i class="pi pi-envelope text-sm" />
                </div>
                <div>
                  <strong class="font-bold text-nimoura-text-900">پست الکترونیک رسمی:</strong>
                  <p class="mt-0.5 text-nimoura-text-600 font-mono text-xs" dir="ltr">
                    support@nimoura.ir<br>
                    business@nimoura.ir
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- کارت تعهدات سلامت و ارسال سراسری به جای نقشه -->
          <div class="rounded-3xl border border-nimoura-text-100 bg-white p-5 shadow-2xs sm:p-6">
            <h4 class="flex items-center gap-2 font-vazir text-sm font-bold text-nimoura-text-900">
              <i class="pi pi-verified text-nimoura-primary text-base" />
              <span>پوشش‌دهی و ارسال به سراسر ایران</span>
            </h4>
            <p class="mt-2 text-xs leading-relaxed text-nimoura-text-600">
              سفارشات نیمورا با پست پیشتاز و بسته‌بندی محافظت‌شده حرارتی به تمامی استان‌ها، شهرها و روستاهای کشور ارسال می‌گردد. همچنین برای پیگیری وضعیت بسته می‌توانید به سامانه رهگیری مراجعه فرمایید.
            </p>
            <div class="mt-3 flex items-center gap-2 text-[11px] font-bold text-nimoura-primary">
              <i class="pi pi-shield" />
              <span>تضمین ۱۰۰٪ اصالت کالا و سلامت فیزیکی هنگام تحویل</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ۴. سوالات متداول پیش از تماس (Contact FAQ with PrimeVue Accordion) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-14 px-4 sm:mt-20 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-nimoura-primary/15 bg-white p-6 shadow-xs sm:p-10">
        <div class="mb-8 text-center sm:mb-10">
          <div class="inline-flex items-center gap-2 rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary">
            <i class="pi pi-question-circle" />
            <span>شاید پاسخ شما اینجاست</span>
          </div>
          <h2 class="mt-2 font-modam text-xl font-bold text-nimoura-text-900 sm:text-3xl">
            پرسش‌های متداول پیش از تماس با پشتیبانی
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-xs text-nimoura-text-500 sm:text-sm">
            برای تسریع در پاسخگویی، پرتکرارترین پرسش‌های کاربران را در زیر جمع‌آوری کرده‌ایم.
          </p>
        </div>

        <!-- PrimeVue Accordion -->
        <Accordion value="contact-faq-0" class="space-y-3">
          <AccordionPanel
            v-for="(faq, idx) in contactFaqs"
            :key="idx"
            :value="`contact-faq-${idx}`"
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
    <!-- ۵. بنر ثبت تیکت آنلاین ۲۴/۷ (Online Tickets Banner) -->
    <!-- ═══════════════════════════════════════════════════════════════════════════ -->
    <section class="container mx-auto mt-12 px-4 sm:mt-16 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-nimoura-primary/20 bg-linear-to-r from-[#F6E9EB] via-[#FFF8F4] to-[#F6E9EB] p-6 shadow-sm sm:p-10">
        <div class="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-nimoura-primary/10 blur-3xl" />

        <div class="grid items-center gap-8 lg:grid-cols-12">
          <div class="space-y-3 text-center lg:col-span-8 lg:text-start">
            <Tag value="پاسخگویی شبانه‌روزی" severity="contrast" class="text-xs" />

            <h2 class="font-modam text-xl font-bold text-nimoura-text-900 sm:text-2xl lg:text-3xl">
              سریع‌ترین روش پیگیری؛ ثبت تیکت در پنل کاربری
            </h2>

            <p class="text-xs leading-relaxed text-nimoura-text-600 sm:text-sm">
              اگر قبلاً در سایت سفارش ثبت کرده‌اید یا کاربر عضو نیمورا هستید، توصیه می‌کنیم درخواست خود را از طریق تیکت کاربری ثبت نمایید. کارشناس اختصاصی پرونده شما را در لحظه بررسی و مستندات را پیگیری می‌کند.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start sm:gap-4">
              <!-- دکمه تیکت -->
              <Button
                as="router-link"
                to="/profile/tickets"
                icon="pi pi-ticket"
                label="ورود به پنل و ثبت تیکت جدید"
                class="bg-nimoura-primary! border-nimoura-primary! text-white! rounded-xl! font-vazir! text-xs! sm:text-sm! px-5! py-3!"
              />

              <!-- راهنمای مرجوعی -->
              <NuxtLink
                to="/return-policy"
                class="inline-flex items-center gap-2 rounded-xl border border-nimoura-primary/30 bg-white px-4 py-3 text-xs font-bold text-nimoura-text-800 shadow-2xs transition-all hover:bg-nimoura-primary/10 sm:text-sm"
              >
                <span>مشاهده شرایط مرجوعی</span>
                <i class="pi pi-arrow-left text-xs" />
              </NuxtLink>
            </div>
          </div>

          <!-- 📷 PLACEHOLDER: بنر پشتیبانی ۲۴ ساعته تیکت -->
          <div class="lg:col-span-4">
            <div
              class="group flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-nimoura-primary/30 bg-white/80 p-4 text-center transition-all hover:border-nimoura-primary/60"
              aria-label="محل تصویر پشتیبانی تیکتینگ آنلاین"
            >
              <div class="flex size-12 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
                <i class="pi pi-ticket text-xl" />
              </div>
              <p class="mt-2 font-vazir text-xs font-bold text-nimoura-text-800">
                محل تصویر سیستم تیکتینگ و پیگیری سفارش
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
import { ref } from 'vue';

// ═════════════════════════════════════════════════════════════════════════════
// دیتای بردکرامب و آدرس‌ها
// ═════════════════════════════════════════════════════════════════════════════
const config = useRuntimeConfig();
const siteUrl = config.public?.baseURL || 'https://nimoura.ir';
const canonicalUrl = `${siteUrl}/contact-us`;

const breadcrumbItems = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'تماس با ما' },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ شاخص کلیدی بالای صفحه
// ═══════════════════════════════════════════════════════════════════════════
const contactStats = [
  {
    icon: 'pi-clock',
    title: 'ساعات کاری رسمی',
    subtitle: 'شنبه تا چهارشنبه ۹ الی ۱۸',
  },
  {
    icon: 'pi-phone',
    title: '09036039314',
    subtitle: 'پاسخگویی تلفنی مستقیم',
  },
  {
    icon: 'pi-whatsapp',
    title: 'پشتیبانی واتساپ',
    subtitle: 'ارسال عکس و فیلم سفارش',
  },
  {
    icon: 'pi-ticket',
    title: 'تیکت آنلاین ۲۴/۷',
    subtitle: 'رسیدگی دقیق در پنل کاربری',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ۴ کانال ارتباط مستقیم
// ═══════════════════════════════════════════════════════════════════════════
const directChannels = [
  {
    icon: 'pi-phone',
    title: 'تماس تلفنی با پشتیبانی',
    badge: 'پاسخگویی فوری',
    badgeSeverity: 'success',
    description: 'جهت پیگیری فوری سفارشات، هماهنگی ارسال سریع، یا مشاوره قبل از خرید در ساعات اداری.',
    actionLabel: '09036039314',
    href: 'tel:09036039314',
    external: false,
  },
  {
    icon: 'pi-whatsapp',
    title: 'پشتیبانی واتساپ',
    badge: 'مشاوره و مستندات',
    badgeSeverity: 'warn',
    description: 'ارسال عکس وضعیت مرسوله، مشاوره تخصصی انتخاب کرم‌پودر و روتین پوستی در پیام‌رسان واتساپ.',
    actionLabel: '+98 902 102 7574',
    href: 'https://wa.me/989021027574',
    external: true,
  },
  {
    icon: 'pi-telegram',
    title: 'پشتیبانی و کانال تلگرام',
    badge: 'اطلاع‌رسانی تخفیف‌ها',
    badgeSeverity: 'info',
    description: 'عضویت در کانال رسمی نیمورا جهت آگاهی از کدهای تخفیف، جشنواره‌ها و ارتباط مستقیم با ادمین.',
    actionLabel: '@nimoura_ir',
    href: 'https://t.me/nimoura_ir',
    external: true,
  },
  {
    icon: 'pi-envelope',
    title: 'مکاتبات ایمیلی و بازرگانی',
    badge: 'همکاری تجاری',
    badgeSeverity: 'contrast',
    description: 'ارسال پروپوزال‌های تامین کالا، امور قراردادی، نمایندگی‌ها و مکاتبات اداری رسمی.',
    actionLabel: 'support@nimoura.ir',
    href: 'mailto:support@nimoura.ir',
    external: false,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// استیت و مدیریت فرم تماس
// ═══════════════════════════════════════════════════════════════════════════
const form = ref({
  name: '',
  mobile: '',
  email: '',
  subject: '',
  orderId: '',
  message: '',
});

const submitting = ref(false);
const formSubmitted = ref(false);
const submittedTicketCode = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  if (!form.value.name || !form.value.mobile || !form.value.subject || !form.value.message) {
    errorMessage.value = 'لطفاً تمامی فیلدهای ستاره‌دار را تکمیل نمایید.';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    const res: any = await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        mobile: form.value.mobile.trim(),
        email: form.value.email ? form.value.email.trim() : undefined,
        subject: form.value.subject,
        orderId: form.value.orderId ? form.value.orderId.trim() : undefined,
        message: form.value.message.trim(),
      },
    });

    submittedTicketCode.value = res?.trackingCode || '';
    formSubmitted.value = true;
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || 'متاسفانه در ارسال پیام خطایی رخ داد. لطفاً مجدداً تلاش فرمایید یا با پشتیبانی تماس بگیرید.';
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    mobile: '',
    email: '',
    subject: '',
    orderId: '',
    message: '',
  };
  formSubmitted.value = false;
  submittedTicketCode.value = '';
  errorMessage.value = '';
};

// ═════════════════════════════════════════════════════════════════════════════
// پرسش‌های متداول پیش از تماس (FAQ)
// ═══════════════════════════════════════════════════════════════════════════
const contactFaqs = [
  {
    question: 'ساعات کاری و پاسخگویی تلفنی پشتیبانی نیمورا چگونه است؟',
    answer: 'کارشناسان پاسخگویی تلفنی نیمورا از شنبه تا چهارشنبه از ساعت ۹:۰۰ الی ۱۸:۰۰ و روزهای پنج‌شنبه از ساعت ۹:۰۰ الی ۱۴:۰۰ (به جز ایام تعطیلات رسمی تقویم کشور) پاسخگوی شما هستند. در خارج از این ساعات، سیستم تیکتینگ آنلاین در پنل کاربری فعال است.',
  },
  {
    question: 'چگونه می‌توانم مشاوره رایگان پوست و مو دریافت کنم؟',
    answer: 'شما می‌توانید از طریق فرم تماس همین صفحه با انتخاب موضوع «مشاوره تخصصی روتین پوستی»، یا از طریق پیام به واتساپ پشتیبانی، نوع پوست و نیاز خود را ارسال نمایید تا مشاوران بیوتی نیمورا مناسب‌ترین محصولات را به شما پیشنهاد دهند.',
  },
  {
    question: 'آیا امکان خرید یا تحویل حضوری کالا وجود دارد؟',
    answer: 'خیر. فروشگاه نیمورا یک مجموعه تمام‌دیجیتال و آنلاین است و ارسال تمامی مرسولات به منظور تضمین بهداشت و سلامت کالاها از طریق پست پیشتاز یا پیک اختصاصی انجام می‌گیرد و امکان مراجعه حضوری مشتریان وجود ندارد.',
  },
  {
    question: 'چگونه وضعیت مرسوله پستی خود را پیگیری کنم؟',
    answer: 'به محض تحویل بسته به شرکت پست، کد رهگیری ۲۴ رقمی برای شما پیامک می‌شود. شما می‌توانید با وارد کردن آن در سامانه tracking.post.ir یا مراجعه به بخش «سفارش‌های من» در پنل کاربری، وضعیت مرسوله را مشاهده فرمایید.',
  },
  {
    question: 'برای ثبت درخواست مرجوعی کالا چه اقدامی باید انجام دهم؟',
    answer: 'پیش از تماس تلفنی، توصیه می‌کنیم شرایط مندرج در صفحه «رویه بازگرداندن کالا» را مطالعه فرموده و سپس از طریق بخش تیکت‌های پنل کاربری، درخواست خود را همراه با تصویر پلمپ محصول ثبت نمایید تا سریعاً رسیدگی شود.',
  },
  {
    question: 'چطور می‌توانم برای همکاری تجاری یا تامین محصولات اقدام کنم؟',
    answer: 'واردکنندگان رسمی، تولیدکنندگان و برندهای معتبر می‌توانند اطلاعات و کاتالوگ محصولات خود را به آدرس ایمیل business@nimoura.ir ارسال نمایند یا در فرم تماس فوق موضوع «همکاری تجاری و بازرگانی» را انتخاب کنند.',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// بهینه‌سازی کامل سئو (SEO Meta Tags)
// ═════════════════════════════════════════════════════════════════════════════
useSeoMeta({
  title: 'تماس با ما | راه‌های ارتباطی و پشتیبانی فروشگاه اینترنتی نیمورا (Nimoura)',
  description:
    'راه‌های ارتباط با فروشگاه آنلاین نیمورا؛ شماره تماس 09036039314، پشتیبانی واتساپ و تلگرام، و فرم ارسال پیام آنلاین به مشاوران تخصصی زیبایی.',
  keywords:
    'تماس با نیمورا, تلفن پشتیبانی نیمورا, پشتیبانی آنلاین نیمورا, پشتیبانی واتساپ نیمورا, مشاوره پوستی نیمورا, ارتباط با نیمورا, شماره تلفن نیمورا',
  ogTitle: 'تماس با ما | پشتیبانی و ارتباط با فروشگاه اینترنتی نیمورا',
  ogDescription:
    'همیشه مشتاق شنیدن صدای شما هستیم؛ راه‌های ارتباط تلفنی، واتساپ، تلگرام و فرم ارسال پیام به مشاوران زیبایی نیمورا.',
  ogImage: `${siteUrl}/og-image.webp`,
  ogUrl: canonicalUrl,
  ogType: 'website',
  ogSiteName: 'Nimoura | نیمورا',
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
  twitterTitle: 'تماس با ما | فروشگاه آنلاین نیمورا',
  twitterDescription:
    'راه‌های ارتباط تلفنی، پشتیبانی آنلاین و خدمات مشتریان فروشگاه لوازم آرایشی و زیبایی نیمورا.',
  twitterImage: `${siteUrl}/og-image.webp`,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1',
  author: 'فروشگاه اینترنتی نیمورا',
});

// ═══════════════════════════════════════════════════════════════════════════
// استراکچرد دیتاهای اسکیما (Schema.org JSON-LD Structured Data)
// ۱. ContactPage Schema
// ۲. Organization / OnlineStore Schema
// ۳. BreadcrumbList Schema
// ۴. FAQPage Schema (Google Rich Snippets)
// ═══════════════════════════════════════════════════════════════════════════
useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    // ۱. ContactPage Schema
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'تماس با فروشگاه اینترنتی نیمورا',
        description:
          'صفحه راه‌های ارتباطی، شماره تماس، پشتیبانی آنلاین و فرم پیام به کارشناسان مشتریان فروشگاه اینترنتی نیمورا.',
        url: canonicalUrl,
        inLanguage: 'fa-IR',
        mainEntity: {
          '@type': 'OnlineStore',
          name: 'Nimoura',
          alternateName: 'نیمورا',
          url: siteUrl,
          telephone: '+989036039314',
          email: 'support@nimoura.ir',
          description: 'فروشگاه آنلاین تخصصی محصولات مراقبت از پوست و آرایشی اورجینال',
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
            name: 'تماس با ما',
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
        mainEntity: contactFaqs.map((faq) => ({
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <footer class="md:container mt-12">
    <div
      class="relative w-full bg-linear-to-t text-nimoura-text-800 from-[#F6E9EB] to-[#FFF8F4] rounded-2xl p-4 lg:p-9"
    >
      <div
        class="flex items-start flex-col gap-x-7 lg:gap-x-10 gap-y-10 lg:flex-row flex-wrap"
      >
        <div class="flex-2 w-full">
          <h2 class="footer_title">درباره نیمورا</h2>
          <p class="leading-8 mb-5">
            در نیمورا، مجموعه‌ای از بهترین لوازم آرایشی و بهداشتی از برندهای
            معتبر را با کیفیتی عالی و قیمتی مناسب ارائه می‌کنیم. زیبایی و سلامت
            شما، اولویت ماست.
          </p>
          <div class="flex items-center gap-x-4">
            <NuxtLink
              href="https://www.instagram.com/nimoura.ir"
              target="_blank"
              rel="noopener noreferrer"
              class="size-10 bg-nimoura-primary/10 rounded-xl flex-center"
            >
              <i class="pi pi-instagram text-2xl! text-nimoura-text-600"></i>
            </NuxtLink>
            <NuxtLink
              href="https://wa.me/989021027574"
              target="_blank"
              rel="noopener noreferrer"
              class="size-10 bg-nimoura-primary/10 rounded-xl flex-center"
            >
              <i class="pi pi-whatsapp text-2xl! text-nimoura-text-600"></i>
            </NuxtLink>
            <NuxtLink
              href="https://t.me/nimoura_ir"
              target="_blank"
              rel="noopener noreferrer"
              class="size-10 bg-nimoura-primary/10 rounded-xl flex-center"
            >
              <i class="pi pi-telegram text-2xl! text-nimoura-text-600"></i>
            </NuxtLink>
            <!-- <NuxtLink
              to="/"
              class="size-10 bg-nimoura-primary/10 rounded-xl flex-center"
            >
              <svg class="size-6 text-nimoura-text-600">
                <use href="#linkedin"></use>
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/"
              class="size-10 bg-nimoura-primary/10 rounded-xl flex-center"
            >
              <svg class="size-6 text-nimoura-text-600">
                <use href="#youtube"></use>
              </svg>
            </NuxtLink> -->
          </div>
        </div>
        <div class="flex-1 flex flex-col w-full lg:w-auto">
          <h2 class="footer_title">دسترسی سریع</h2>
          <div
            class="flex gap-x-10 child:space-y-2 child:text-nimoura-text-800"
          >
            <ul class="child-hover:text-nimoura-text-800 child:transition-all">
              <li>
                <NuxtLink to="/">صفحه اصلی</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/about-us">درباره ما </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact-us">تماس با ما </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/faq">سوالات متداول </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/rules">شرایط و قوانین</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/shipping-pay">روش های ارسال و پرداخت </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/return-policy">سیاست مرجوعی و گارانتی </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex-[1.5] w-full">
          <h2 class="footer_title">تماس با ما</h2>
          <ul
            class="flex flex-col gap-y-6 **:flex **:text-nimoura-text-800 **:items-center **:justify-between"
          >
            <li>
              <p>شماره تماس :</p>
              <NuxtLink class="font-modam" to="tel:09036039314" dir="ltr">
                09036039314
              </NuxtLink>
            </li>
            <li>
              <p>آدرس ایمیل :</p>
              <NuxtLink to="mailto:info@nimoura.ir"> info@nimoura.ir </NuxtLink>
            </li>
          </ul>
        </div>
        <div
          class="flex-1 w-full lg:w-1/6 flex flex-col items-end justify-end ml-5 lg:ml-0 lg:mr-5"
        >
          <div
            class="flex justify-center md:justify-end items-center gap-x-3 first:child:bg-transparent child:bg-nimoura-primary/10"
          >
            <ClientOnly>
              <span
                class="w-max! h-20! lg:w-max! lg:h-24! flex-center rounded-xl overflow-hidden"
              >
                <NuxtLink
                  to="https://www.zarinpal.com/trustPage/nimoura.ir"
                  referrerpolicy="origin"
                  target="_blank"
                  class="w-full h-full"
                >
                  <NuxtImg
                    src="https://cdn.zarinpal.com/badges/trustLogo/1.png"
                    alt="دروازه پرداخت معتبر"
                    format="webp,jpeg"
                    loading="lazy"
                    class="w-full h-full object-contain"
                  />
                </NuxtLink>

                <!-- zarinpal -->
                <noscript>
                  <NuxtLink
                    to="https://www.zarinpal.com"
                    rel="nofollow noopener"
                    target="_blank"
                  >
                    پرداخت امن زرین‌پال
                  </NuxtLink>
                </noscript>
              </span>
            </ClientOnly>
            <span
              class="w-16 p-1.25 h-20 lg:w-20 lg:h-24 flex-center rounded-xl"
            >
              <NuxtLink
                referrerpolicy="origin"
                target="_blank"
                class="w-full h-full"
                to="https://trustseal.enamad.ir/?id=8834507&Code=MbLPIm0frDrEpuJoVOOi4l4AuiaixHwF"
              >
                <NuxtImg
                  referrerpolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=8834507&Code=MbLPIm0frDrEpuJoVOOi4l4AuiaixHwF"
                  alt="اینماد"
                  loading="lazy"
                  class="w-full h-full object-contain"
                  style="cursor: pointer"
                  code="MbLPIm0frDrEpuJoVOOi4l4AuiaixHwF"
                />
              </NuxtLink>
            </span>

            <span
              class="w-max! h-20! lg:w-max! lg:h-24! flex-center rounded-xl overflow-hidden"
            >
              <NuxtLink
                to="https://emalls.ir/Shop/66659/"
                referrerpolicy="origin"
                target="_blank"
                class="w-full h-full"
              >
                <NuxtImg
                  src="https://service.emalls.ir/neshan?id=66659"
                  alt="نشان اعتباری ایمالز"
                  format="webp,jpeg"
                  loading="lazy"
                  width="75"
                  height="112"
                  referrerpolicy="origin"
                  class="w-full h-full object-contain"
                />
              </NuxtLink>
            </span>
          </div>
          <!-- GO TOP -->
          <button
            @click="scrollToTop"
            class="ring-2 ring-nimoura-border text-nimoura-text-800 w-32 rounded-lg text-sm flex-center gap-x-2 py-1.5 px-2 mt-10"
          >
            بازگشت به بالا

            <i class="pi-angle-up pi size-4"></i>
          </button>
        </div>
      </div>
      <!-- ══ NEWSLETTER BOX ══ -->
      <div
        class="w-full rounded-2xl bg-gradient-to-r from-nimoura-primary/15 via-[#FFF2F4] to-nimoura-primary/10 border border-nimoura-primary/20 p-5 md:p-7 mt-8 shadow-sm"
      >
        <div
          class="flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div class="space-y-1.5 text-center lg:text-right max-w-xl">
            <div
              class="inline-flex items-center gap-1.5 rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary"
            >
              <i class="pi pi-gift text-xs" />
              <span>خبرنامه اختصاصی تخفیف‌ها و جشنواره‌ها</span>
            </div>
            <h3
              class="text-lg md:text-xl font-bold font-vazir text-nimoura-text-900"
            >
              اولین نفری باشید که از شگفتانه‌ها و کدهای تخفیف باخبر می‌شوید!
            </h3>
            <p class="text-xs md:text-sm text-nimoura-text-600 leading-relaxed">
              شماره موبایل یا ایمیل‌تان را ثبت کنید تا کدهای تخفیف هدیه،
              حراج‌های شگفت‌انگیز و جشنواره‌های فصلی نیمورا مستقیماً برای شما
              پیامک یا ایمیل شود.
            </p>
          </div>

          <div class="w-full lg:w-auto shrink-0">
            <div
              v-if="newsletterSuccess"
              class="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-emerald-800 text-sm font-semibold"
            >
              <i class="pi pi-check-circle text-base text-emerald-600" />
              <span>عضویت شما با موفقیت ثبت شد! منتظر شگفتانه‌ها باشید.</span>
            </div>

            <form
              v-else
              class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 p-1.5 rounded-2xl border border-nimoura-primary/25 shadow-xs w-full sm:w-[420px]"
              @submit.prevent="handleNewsletterSubmit"
            >
              <div class="relative flex-1">
                <i
                  class="pi pi-bell absolute right-3.5 top-1/2 -translate-y-1/2 text-nimoura-text-400 text-xs pointer-events-none"
                />
                <input
                  v-model="newsletterContact"
                  type="text"
                  dir="ltr"
                  placeholder="09123456789 یا email@domain.com"
                  class="w-full bg-transparent text-nimoura-text-800 pr-9 pl-3 py-2.5 text-xs sm:text-sm placeholder:text-nimoura-text-400 placeholder:text-right placeholder:font-vazir focus:outline-none"
                  :disabled="newsletterLoading"
                />
              </div>
              <button
                type="submit"
                :disabled="newsletterLoading || !newsletterContact.trim()"
                class="px-5 py-2.5 bg-nimoura-primary hover:bg-nimoura-primary/95 text-white rounded-xl font-vazir text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <i
                  v-if="newsletterLoading"
                  class="pi pi-spin pi-spinner text-xs"
                />
                <i v-else class="pi pi-send text-xs" />
                <span>{{
                  newsletterLoading ? "در حال ثبت..." : "عضویت در خبرنامه"
                }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <p class="text-center text-sm py-4 text-gray-400">
      کلیه حقوق این سایت متعلق به فروشگاه آنلاین نیمورا می باشد.
    </p>
  </footer>
</template>

<script setup lang="ts">
const newsletterContact = ref("");
const newsletterLoading = ref(false);
const newsletterSuccess = ref(false);
const toast = useAppToast();

async function handleNewsletterSubmit() {
  const contact = newsletterContact.value.trim();
  if (!contact) {
    toast.add({
      severity: "warn",
      summary: "ورودی الزامی است",
      detail: "لطفاً شماره موبایل یا ایمیل خود را وارد کنید.",
      life: 3000,
    });
    return;
  }

  const isPhone = /^(?:0|\+?98)?(9\d{9})$/.test(contact);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  if (!isPhone && !isEmail) {
    toast.add({
      severity: "error",
      summary: "فرمت نامعتبر",
      detail:
        "لطفاً یک شماره موبایل معتبر (مثلاً ۰۹۱۲۳۴۵۶۷۸۹) یا یک ایمیل صحیح وارد کنید.",
      life: 4000,
    });
    return;
  }

  newsletterLoading.value = true;
  try {
    const res: any = await $fetch("/api/newsletter/subscribe", {
      method: "POST",
      body: { contact, source: "footer" },
    });
    newsletterSuccess.value = true;
    toast.add({
      severity: "success",
      summary: "عضویت در خبرنامه",
      detail:
        res?.data?.message || res?.message || "عضویت شما با موفقیت ثبت شد!",
      life: 4000,
    });
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "خطا در ثبت عضویت",
      detail:
        err?.data?.message ||
        err?.message ||
        "مشکلی پیش آمد، لطفاً دوباره تلاش کنید.",
      life: 4000,
    });
  } finally {
    newsletterLoading.value = false;
  }
}

const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};
</script>

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
              href="https://www.instagram.com/nimoura.shop"
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
              href="https://t.me/nimoura_shop"
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
                <NuxtLink to="/rules">شرایظ و قوانین </NuxtLink>
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
              <NuxtLink to="mailto:info@nimoura.shop">
                info@nimoura.shop
              </NuxtLink>
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
                  to="https://www.zarinpal.com/trustPage/nimoura.shop"
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
                to="https://trustseal.enamad.ir/?id=636446&Code=YIBQ5huQKfLRVDVNfoFA3C0LLOYLigf3"
                ><NuxtImg
                  referrerpolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=636446&Code=YIBQ5huQKfLRVDVNfoFA3C0LLOYLigf3"
                  alt="اینماد"
                  loading="lazy"
                  class="w-full h-full object-contain"
                  style="cursor: pointer"
                  code="YIBQ5huQKfLRVDVNfoFA3C0LLOYLigf3"
              /></NuxtLink>
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
      <!-- DIV -->
      <div
        class="w-full rounded-xl bg-nimoura-primary/10 flex flex-col md:flex-row gap-y-4 items-center justify-between p-4 md:p-6 mt-6"
      >
        <NuxtLink
          to="/"
          class="text-3xl text-nimoura-primary font-modam font-medium"
        >
          نیمورا
        </NuxtLink>
        <div
          class="bg-white/50 p-1.5 rounded-xl w-72 lg:w-87.5 flex items-center justify-between"
        >
          <input
            type="text"
            class="bg-transparent text-nimoura-text-700 px-2 w-full text-sm xs:text-base placeholder:text-nimoura-text-400"
            placeholder="از جدیدترین تخفیف ها با خبر شوید                    "
          />
          <button
            class="px-4 py-1 bg-nimoura-primary text-white rounded-xl font-vazir font-medium"
          >
            ثبت
          </button>
        </div>
      </div>
    </div>
    <p class="text-center text-sm py-4 text-gray-400">
      کلیه حقوق این سایت متعلق به فروشگاه آنلاین نیمورا می باشد.
    </p>
  </footer>
</template>

<script setup lang="ts">
const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};
</script>

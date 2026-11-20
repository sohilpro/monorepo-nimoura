<template>
  <div
    dir="rtl"
    class="flex min-h-screen flex-col bg-gradient-to-b from-rose-50/40 via-white to-gray-50 text-gray-900 selection:bg-brand-500 selection:text-white"
  >
    <!-- هدر ساده سایت -->
    <header class="flex w-full items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
      <NuxtLink to="/" class="flex items-center gap-2.5" @click="handleClearError('/')">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-rose-400 font-bold text-white shadow-xs"
        >
          ن
        </span>
        <div class="flex flex-col leading-tight">
          <span class="text-lg font-extrabold tracking-tight text-brand-600">
            نیمورا
          </span>
          <span class="text-[10px] font-medium text-gray-400">
            فروشگاه اینترنتی محصولات مراقبت و زیبایی
          </span>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/"
        class="text-xs font-semibold text-brand-600 hover:text-brand-700"
        @click="handleClearError('/')"
      >
        صفحه اصلی فروشگاه &larr;
      </NuxtLink>
    </header>

    <!-- محتوای خطا -->
    <main class="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div class="w-full max-w-lg text-center">
        <!-- کد وضعیت با افکت زیبا -->
        <div class="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
          <div
            class="absolute inset-0 animate-pulse rounded-full opacity-50 blur-2xl"
            :class="statusCode === 404 ? 'bg-amber-300/40' : 'bg-brand-300/40'"
          />

          <div
            class="relative flex h-full w-full items-center justify-center rounded-3xl border bg-white/90 shadow-xl backdrop-blur-md"
            :class="statusCode === 404 ? 'border-amber-200' : 'border-brand-200'"
          >
            <span
              class="text-4xl font-extrabold sm:text-6xl font-mono tracking-tight"
              :class="statusCode === 404 ? 'text-amber-600' : 'text-brand-600'"
            >
              {{ statusCode }}
            </span>
          </div>
        </div>

        <h1 class="text-xl font-bold text-gray-800 sm:text-2xl">
          {{ errorTitle }}
        </h1>

        <p class="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-gray-500">
          {{ errorDescription }}
        </p>

        <!-- دکمه‌های اکشن -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            @click="handleClearError('/')"
            class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 active:scale-98"
          >
            <span>بازگشت به فروشگاه</span>
          </button>

          <button
            type="button"
            @click="handleReload"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-98"
          >
            <span>بارگذاری مجدد صفحه</span>
          </button>
        </div>
      </div>
    </main>

    <!-- فوتر ساده -->
    <footer class="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
      <span>تمامی حقوق متعلق به فروشگاه آنلاین نیمورا است.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => Number(props.error?.statusCode || 500));

const errorTitle = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "صفحه مورد نظر شما پیدا نشد!";
  if (code === 403 || code === 401) return "دسترسی به این بخش محدود شده است";
  if (code >= 500) return "خطایی در برقراری ارتباط با سرور رخ داد";
  return "خطای غیرمنتظره!";
});

const errorDescription = computed(() => {
  const code = statusCode.value;
  if (code === 404) {
    return "آدرسی که وارد کرده‌اید اشتباه است، یا صفحه و محصول مورد نظر حذف شده است.";
  }
  if (code >= 500) {
    return "متاسفانه مشکلی در سرورهای ما رخ داده است. لطفاً چند لحظه دیگر دوباره تلاش نمایید.";
  }
  return props.error?.statusMessage || "متاسفانه در پردازش این صفحه با مشکلی مواجه شدیم.";
});

const handleClearError = (redirectPath: string = "/") => {
  clearError({ redirect: redirectPath });
};

const handleReload = () => {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};
</script>

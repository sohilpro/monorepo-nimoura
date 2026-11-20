<template>
  <div
    dir="rtl"
    class="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 selection:bg-brand-500 selection:text-white"
  >
    <!-- هدر ساده بالای صفحه -->
    <header class="flex w-full items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
      <NuxtLink to="/" class="flex items-center gap-2.5" @click="handleClearError('/')">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 font-bold text-white shadow-xs"
        >
          ن
        </span>
        <div class="flex flex-col leading-tight">
          <span class="text-lg font-extrabold tracking-tight text-brand-600">
            نیمورا
          </span>
          <span class="text-[10px] font-medium text-gray-400">
            پنل مدیریت فروشگاه
          </span>
        </div>
      </NuxtLink>

      <button
        type="button"
        @click="handleReload"
        class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
      >
        <i class="pi pi-refresh text-xs" />
        <span>بارگذاری مجدد</span>
      </button>
    </header>

    <!-- محتوای خطا -->
    <main class="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div class="w-full max-w-xl text-center">
        <!-- بج کد خطا با افکت مدرن -->
        <div class="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
          <!-- هاله نوری در پس‌زمینه -->
          <div
            class="absolute inset-0 animate-pulse rounded-full opacity-60 blur-xl"
            :class="statusBadgeGlow"
          />

          <!-- کادر کد وضعیت -->
          <div
            class="relative flex h-full w-full items-center justify-center rounded-3xl border bg-white/90 shadow-xl backdrop-blur-md"
            :class="statusBadgeBorder"
          >
            <div class="flex flex-col items-center">
              <span class="text-3xl font-extrabold sm:text-5xl font-mono tracking-tight" :class="statusTextColor">
                {{ statusCode }}
              </span>
              <span class="mt-1 text-[11px] font-bold text-gray-400">
                {{ errorTypeLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- پیام اصلی خطا -->
        <h1 class="text-xl font-bold text-gray-800 sm:text-2xl">
          {{ errorTitle }}
        </h1>

        <!-- متن راهنمای کاربر -->
        <p class="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-gray-500">
          {{ errorDescription }}
        </p>

        <!-- دکمه‌های اقدام -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            @click="handleClearError('/')"
            class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 active:scale-98"
          >
            <i class="pi pi-home text-sm" />
            <span>بازگشت به داشبورد</span>
          </button>

          <button
            type="button"
            @click="handleGoBack"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-98"
          >
            <i class="pi pi-arrow-right text-sm" />
            <span>صفحه قبل</span>
          </button>
        </div>

        <!-- آکاردئون جزئیات فنی خطا (مفید برای دیباگ و پشتیبانی) -->
        <div v-if="error?.message || error?.stack" class="mt-10 text-right">
          <details class="group rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
            <summary class="flex cursor-pointer select-none items-center justify-between text-xs font-semibold text-gray-600 group-open:text-brand-600">
              <div class="flex items-center gap-2">
                <i class="pi pi-code text-gray-400" />
                <span>اطلاعات فنی برای پشتیبانی / توسعه‌دهنده</span>
              </div>
              <i class="pi pi-chevron-down text-[10px] text-gray-400 transition-transform group-open:rotate-180" />
            </summary>

            <div class="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-600 font-mono" dir="ltr">
              <p v-if="error?.message" class="font-semibold text-rose-600 break-words mb-2">
                {{ error.message }}
              </p>
              <pre
                v-if="error?.stack"
                class="max-h-48 overflow-auto rounded-xl bg-gray-900 p-3 text-[11px] text-gray-200 leading-normal"
              >{{ error.stack }}</pre>
            </div>
          </details>
        </div>
      </div>
    </main>

    <!-- فوتر ساده -->
    <footer class="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
      <span>سامانه جامع مدیریت فروشگاه نیمورا</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => Number(props.error?.statusCode || 500));

const errorTypeLabel = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "PAGE NOT FOUND";
  if (code === 403 || code === 401) return "UNAUTHORIZED";
  if (code >= 500) return "SERVER ERROR";
  return "ERROR";
});

const statusTextColor = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "text-amber-600";
  if (code === 403 || code === 401) return "text-purple-600";
  if (code >= 500) return "text-rose-600";
  return "text-brand-600";
});

const statusBadgeGlow = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "bg-amber-300/40";
  if (code === 403 || code === 401) return "bg-purple-300/40";
  if (code >= 500) return "bg-rose-300/40";
  return "bg-brand-300/40";
});

const statusBadgeBorder = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "border-amber-200";
  if (code === 403 || code === 401) return "border-purple-200";
  if (code >= 500) return "border-rose-200";
  return "border-brand-200";
});

const errorTitle = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "صفحه مورد نظر پیدا نشد!";
  if (code === 401 || code === 403) return "دسترسی غیرمجاز به این بخش!";
  if (code >= 500) return "خطای غیرمنتظره در سرور!";
  return "مشکلی در پردازش درخواست رخ داد!";
});

const errorDescription = computed(() => {
  const code = statusCode.value;
  if (code === 404) {
    return "آدرسی که وارد کرده‌اید اشتباه است، یا صفحه مورد نظر جابجا یا حذف شده است.";
  }
  if (code === 401 || code === 403) {
    return "شما مجوزهای لازم برای مشاهده این بخش از پنل را ندارید یا نشست کاربری شما به پایان رسیده است.";
  }
  if (code >= 500) {
    return "متاسفانه در سمت سرویس‌های سرور خطایی رخ داده است. می‌توانید چند لحظه دیگر تلاش مجدد کنید.";
  }
  return props.error?.statusMessage || "متاسفانه خطایی در انجام این عملیات به وجود آمده است.";
});

const handleClearError = (redirectPath: string = "/") => {
  clearError({ redirect: redirectPath });
};

const handleReload = () => {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

const handleGoBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
  } else {
    handleClearError("/");
  }
};
</script>

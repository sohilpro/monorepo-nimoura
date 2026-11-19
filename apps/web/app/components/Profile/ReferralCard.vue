<template>
  <div class="space-y-6" dir="rtl">
    <!-- ══ BANNER HERO ══ -->
    <div
      class="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8"
      style="background: linear-gradient(135deg, #421c23 0%, #7d2e3d 50%, #b76e79 100%)"
    >
      <div
        class="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none"
      />
      <div
        class="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none"
      />

      <div class="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div class="max-w-xl space-y-2">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <i class="pi pi-gift text-xs text-amber-300" />
            <span>سیستم دعوت از دوستان و کسب هدیه</span>
          </div>
          <h2 class="text-xl font-bold sm:text-2xl font-vazir">
            دوستانت رو دعوت کن، هر دو هدیه بگیرید!
          </h2>
          <p class="text-xs leading-relaxed text-white/80 sm:text-sm">
            دوست شما بلافاصله پس از ثبت‌نام با کد یا لینک شما، <span class="font-bold text-amber-200">۵۰٬۰۰۰ تومان اعتبار نقدی</span> در باشگاه مشتریان هدیه می‌گیرد و یک <span class="font-bold text-amber-200">کد تخفیف ۵۰٬۰۰۰ تومانی</span> اختصاصی برای شما صادر و پیامک می‌شود!
          </p>
        </div>

        <!-- STATS PILLS -->
        <div class="grid w-full grid-cols-3 gap-2.5 sm:w-auto md:flex md:gap-3">
          <div class="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">دعوت‌شده‌ها</span>
            <span class="font-modam text-lg font-bold sm:text-xl">{{ info?.stats?.totalInvited ?? 0 }}</span>
          </div>
          <div class="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">تخفیف‌های شما</span>
            <span class="font-modam text-lg font-bold sm:text-xl">{{ earnedDiscountCodes.length }}</span>
          </div>
          <div class="rounded-2xl bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">ارزش کل هدایا</span>
            <span class="font-modam text-sm font-bold sm:text-base">{{ numberFormat(earnedDiscountCodes.length * 50000) }}</span>
            <span class="text-[10px] text-white/60">تومان</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ CODE & LINK BOX ══ -->
    <div class="rounded-3xl border border-nimoura-text-100 bg-white p-6 shadow-sm sm:p-7">
      <h3 class="mb-4 text-base font-bold text-nimoura-text-900 font-vazir">
        کد و لینک اختصاصی دعوت شما
      </h3>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- CODE CARD -->
        <div class="flex flex-col justify-between rounded-2xl border border-dashed border-nimoura-primary/40 bg-nimoura-primary/5 p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-nimoura-text-600">کد معرف اختصاصی شما</span>
            <span class="text-[11px] text-nimoura-primary font-modam">۵۰ هزار تومان هدیه به دوست</span>
          </div>
          <div class="my-3 flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <span class="font-mono text-lg font-black tracking-widest text-nimoura-primary">
              {{ info?.referralCode || 'در حال بارگذاری...' }}
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-nimoura-primary px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 active:scale-95"
              @click="copyCode"
            >
              <i class="pi pi-copy text-xs" />
              <span>کپی کد</span>
            </button>
          </div>
          <p class="text-[11px] text-nimoura-text-400">
            دوستان شما می‌توانند این کد را هنگام ثبت‌نام وارد کنند تا فوراً ۵۰ هزار تومان اعتبار دریافت کنند.
          </p>
        </div>

        <!-- LINK CARD -->
        <div class="flex flex-col justify-between rounded-2xl border border-nimoura-text-200 bg-slate-50/60 p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-nimoura-text-600">لینک مستقیم دعوت</span>
            <span class="text-[11px] text-emerald-600 font-semibold">ثبت‌نام خودکار با کد</span>
          </div>
          <div class="my-3 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
            <span class="truncate font-mono text-xs text-nimoura-text-700 dir-ltr text-left">
              {{ displayLink }}
            </span>
            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg border border-nimoura-text-200 bg-white px-2.5 py-1.5 text-xs font-medium text-nimoura-text-700 transition-colors hover:border-nimoura-primary hover:text-nimoura-primary"
                @click="copyLink"
              >
                <i class="pi pi-link text-xs" />
                <span>کپی</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-95"
                @click="share"
              >
                <i class="pi pi-share-alt text-xs" />
                <span>اشتراک</span>
              </button>
            </div>
          </div>
          <p class="text-[11px] text-nimoura-text-400">
            با کلیک روی این لینک، کد معرف به طور خودکار در مرورگر دوستتان ذخیره و اعمال می‌شود.
          </p>
        </div>
      </div>
    </div>

    <!-- ══ EARNED DISCOUNT CODES (FOR INVITER) ══ -->
    <div v-if="earnedDiscountCodes.length > 0" class="rounded-3xl border border-nimoura-text-100 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-nimoura-text-900 font-vazir flex items-center gap-2">
            <i class="pi pi-ticket text-nimoura-primary" />
            <span>کدهای تخفیف هدیه شما (۵۰ هزار تومانی)</span>
          </h3>
          <p class="text-xs text-nimoura-text-500 mt-1">
            کدهای تخفیف زیر بابت دعوت دوستان برای شما فعال شده و در خرید بعدی قابل استفاده هستند:
          </p>
        </div>
        <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 font-modam border border-emerald-200">
          {{ earnedDiscountCodes.length }} کد فعال
        </span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="codeItem in earnedDiscountCodes"
          :key="codeItem.id"
          class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-900">تخفیف ۵۰٬۰۰۰ تومانی</span>
            <span class="text-[10px] text-emerald-700 font-modam">حداقل خرید ۱۵۰ هزار</span>
          </div>

          <div class="my-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-emerald-200 shadow-xs">
            <span class="font-mono text-sm font-black tracking-wider text-emerald-800">
              {{ codeItem.discountCode }}
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 transition-colors"
              @click="copySpecificCode(codeItem.discountCode!)"
            >
              <i class="pi pi-copy text-[11px]" />
              <span>کپی</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] text-emerald-800/70">
            <span>دوست: {{ codeItem.friendName || 'کاربر جدید' }}</span>
            <span class="font-modam">{{ formatPersianDate(codeItem.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ HOW IT WORKS ══ -->
    <div class="rounded-3xl border border-nimoura-text-100 bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-base font-bold text-nimoura-text-900 font-vazir">
        مراحل دعوت و دریافت هدیه
      </h3>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="flex items-start gap-3 rounded-2xl bg-amber-50/60 p-4 border border-amber-100">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-white text-sm">
            ۱
          </div>
          <div>
            <h4 class="text-xs font-bold text-amber-950 sm:text-sm">ارسال لینک یا کد</h4>
            <p class="mt-1 text-[11px] text-amber-900/70 leading-relaxed">
              کد یا لینک اختصاصی خود را در پیام‌رسان‌ها برای دوستان و آشنایان بفرستید.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500 font-bold text-white text-sm">
            ۲
          </div>
          <div>
            <h4 class="text-xs font-bold text-blue-950 sm:text-sm">ثبت‌نام و شارژ ۵۰ هزار تومان دوست</h4>
            <p class="mt-1 text-[11px] text-blue-900/70 leading-relaxed">
              دوست شما با کد شما ثبت‌نام می‌کند و بلافاصله ۵۰٬۰۰۰ تومان اعتبار نقدی در باشگاه مشتریان هدیه می‌گیرد.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white text-sm">
            ۳
          </div>
          <div>
            <h4 class="text-xs font-bold text-emerald-950 sm:text-sm">کد تخفیف ۵۰ هزار تومانی و پیامک</h4>
            <p class="mt-1 text-[11px] text-emerald-900/70 leading-relaxed">
              همزمان یک کد تخفیف ۵۰٬۰۰۰ تومانی برای شما صادر شده و پیامک آن برایتان ارسال می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ FRIENDS LIST ══ -->
    <div class="rounded-3xl border border-nimoura-text-100 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-bold text-nimoura-text-900 font-vazir">
          لیست دوستان دعوت‌شده
        </h3>
        <span class="text-xs text-nimoura-text-500 font-modam">
          {{ (info?.history?.length ?? 0) }} نفر
        </span>
      </div>

      <!-- SKELETON / LOADING -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!info?.history || info.history.length === 0"
        class="flex flex-col items-center justify-center py-10 text-center"
      >
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-nimoura-primary/10 text-nimoura-primary">
          <i class="pi pi-users text-2xl" />
        </div>
        <p class="text-sm font-semibold text-nimoura-text-800">هنوز دوستی با کد شما ثبت‌نام نکرده است</p>
        <p class="mt-1 max-w-sm text-xs text-nimoura-text-400">
          همین حالا لینک اختصاصی خود را کپی کنید و برای دوستانتان بفرستید تا اولین کد تخفیف ۵۰ هزار تومانی خود را دریافت کنید!
        </p>
      </div>

      <!-- TABLE / LIST -->
      <div v-else class="divide-y divide-nimoura-text-100 overflow-x-auto">
        <table class="w-full min-w-[550px] text-right text-xs sm:text-sm">
          <thead>
            <tr class="text-nimoura-text-400 font-normal">
              <th class="pb-3 pr-2 font-normal">نام دوست</th>
              <th class="pb-3 font-normal">تاریخ ثبت‌نام</th>
              <th class="pb-3 font-normal">وضعیت</th>
              <th class="pb-3 pl-2 text-left font-normal">کد تخفیف شما</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-nimoura-text-100/60">
            <tr v-for="friend in info.history" :key="friend.id" class="text-nimoura-text-800">
              <td class="py-3.5 pr-2 font-medium">
                <div class="flex items-center gap-2">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-nimoura-text-100 text-nimoura-text-600 font-bold text-xs">
                    {{ friend.friendName ? friend.friendName.charAt(0) : 'د' }}
                  </div>
                  <div>
                    <span class="block">{{ friend.friendName || 'کاربر جدید' }}</span>
                    <span class="block text-[11px] text-nimoura-text-400 font-modam">{{ friend.friendPhone }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 font-modam text-nimoura-text-500">
                {{ formatPersianDate(friend.createdAt) }}
              </td>
              <td class="py-3.5">
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"
                >
                  <i class="pi pi-check text-[10px]" />
                  <span>عضویت موفق</span>
                </span>
              </td>
              <td class="py-3.5 pl-2 text-left">
                <div v-if="friend.discountCode" class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                  <span class="font-mono text-xs font-bold text-emerald-800">{{ friend.discountCode }}</span>
                  <button
                    type="button"
                    class="text-emerald-700 hover:text-emerald-900 transition-colors"
                    title="کپی کد تخفیف"
                    @click="copySpecificCode(friend.discountCode)"
                  >
                    <i class="pi pi-copy text-xs" />
                  </button>
                </div>
                <span v-else class="text-nimoura-text-400 text-xs">–</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { info, loading, fetchReferralInfo, copyCode, copyLink, copySpecificCode, share } = useReferral();

onMounted(async () => {
  await fetchReferralInfo();
});

const displayLink = computed(() => {
  if (info.value?.referralLink) return info.value.referralLink;
  if (typeof window !== 'undefined' && info.value?.referralCode) {
    return `${window.location.origin}/?ref=${info.value.referralCode}`;
  }
  return 'https://nimoura.com/?ref=...';
});

const earnedDiscountCodes = computed(() => {
  if (!info.value?.history) return [];
  return info.value.history.filter((h) => !!h.discountCode);
});

function formatPersianDate(dateStr: string) {
  if (!dateStr) return '–';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}
</script>

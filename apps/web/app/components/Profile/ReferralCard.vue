<template>
  <div class="space-y-6" dir="rtl">
    <!-- ══ BANNER HERO ══ -->
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nimoura-950 via-nimoura-800 to-nimoura-500 p-6 text-white shadow-lg shadow-nimoura-900/10 sm:p-8">
      <div class="pointer-events-none absolute -left-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl" />
      <div class="pointer-events-none absolute -bottom-10 -right-10 size-44 rounded-full bg-white/10 blur-2xl" />

      <div class="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div class="max-w-xl space-y-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <i class="pi pi-gift text-xs text-nimoura-100" />
            سیستم دعوت از دوستان و کسب هدیه
          </span>
          <h2 class="text-xl font-bold sm:text-2xl">دوستانت رو دعوت کن، هر دو هدیه بگیرید!</h2>
          <p class="text-xs leading-relaxed text-white/80 sm:text-sm">
            دوست شما بلافاصله پس از ثبت‌نام با کد یا لینک شما،
            <span class="font-bold text-nimoura-100">۵۰٬۰۰۰ تومان اعتبار نقدی</span>
            در باشگاه مشتریان هدیه میگیرد و یک
            <span class="font-bold text-nimoura-100">کد تخفیف ۵۰٬۰۰۰ تومانی</span>
            اختصاصی برای شما صادر و پیامک میشود!
          </p>
        </div>

        <!-- STATS PILLS -->
        <div class="grid w-full grid-cols-3 gap-2.5 sm:w-auto md:flex md:gap-3">
          <div class="rounded-2xl border border-white/15 bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">دعوت‌شده‌ها</span>
            <span class="font-modam text-lg font-bold sm:text-xl">{{ info?.stats?.totalInvited ?? 0 }}</span>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">تخفیف‌های شما</span>
            <span class="font-modam text-lg font-bold sm:text-xl">{{ earnedDiscountCodes.length }}</span>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/15 p-3 text-center backdrop-blur-md">
            <span class="block text-xs text-white/70">ارزش کل هدایا</span>
            <span class="font-modam text-sm font-bold sm:text-base">{{ numberFormat(earnedDiscountCodes.length * 50000) }}</span>
            <span class="block text-[10px] text-white/60">تومان</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CODE & LINK BOX ══ -->
    <section class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:p-7">
      <h3 class="mb-5 text-base font-bold text-nimoura-text-900">کد و لینک اختصاصی دعوت شما</h3>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- CODE CARD -->
        <div class="flex flex-col justify-between rounded-2xl border border-dashed border-nimoura-primary/40 bg-nimoura-50 p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-nimoura-text-600">کد معرف اختصاصی شما</span>
            <span class="font-modam text-[11px] text-nimoura-primary">۵۰ هزار تومان هدیه به دوست</span>
          </div>
          <div class="my-4 flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span class="font-mono text-lg font-black tracking-widest text-nimoura-primary">
              {{ info?.referralCode || 'در حال بارگذاری...' }}
            </span>
            <Button
              type="button"
              icon="pi pi-copy"
              label="کپی کد"
              size="small"
              class="!shrink-0 !rounded-lg !bg-nimoura-primary !px-3 !py-1.5 !text-xs !font-medium !text-white transition-opacity hover:!bg-nimoura-600 active:!scale-95"
              @click="copyCode"
            />
          </div>
          <p class="text-[11px] leading-relaxed text-nimoura-text-400">
            دوستان شما می‌توانند این کد را هنگام ثبت نام وارد کنند تا فوراً ۵۰ هزار تومان اعتبار دریافت کنند.
          </p>
        </div>

        <!-- LINK CARD -->
        <div class="flex flex-col justify-between rounded-2xl border border-nimoura-200 bg-nimoura-base/60 p-4 sm:p-5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-nimoura-text-600">لینک مستقیم دعوت</span>
            <span class="text-[11px] font-semibold text-nimoura-success">ثبت نام خودکار با کد</span>
          </div>
          <div class="my-4 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm">
            <span class="direction-ltr truncate font-mono text-xs text-nimoura-text-700">{{ displayLink }}</span>
            <div class="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                icon="pi pi-link"
                label="کپی"
                size="small"
                outlined
                class="!rounded-lg !border-nimoura-200 !bg-white !px-2.5 !py-1.5 !text-xs !font-medium !text-nimoura-text-700 transition-colors hover:!border-nimoura-primary hover:!text-nimoura-primary"
                @click="copyLink"
              />
              <Button
                type="button"
                icon="pi pi-share-alt"
                label="اشتراک"
                size="small"
                class="!rounded-lg !bg-nimoura-success !px-2.5 !py-1.5 !text-xs !font-medium !text-white transition-opacity hover:!bg-nimoura-600"
                @click="share"
              />
            </div>
          </div>
          <p class="text-[11px] leading-relaxed text-nimoura-text-400">
            با کلیک روی این لینک، کد معرف به طور خودکار در مرورگر دوستتان ذخیره و اعمال میشود.
          </p>
        </div>
      </div>
    </section>

    <!-- ══ EARNED DISCOUNT CODES ══ -->
    <section v-if="earnedDiscountCodes.length > 0" class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:p-7">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="flex items-center gap-2 text-base font-bold text-nimoura-text-900">
            <i class="pi pi-ticket text-nimoura-primary" />
            کدهای تخفیف هدیه شما (۵۰ هزار تومانی)
          </h3>
          <p class="mt-1 text-xs text-nimoura-text-500">
            کدهای تخفیف زیر بابت دعوت دوستان برای شما فعال شده و در خرید بعدی قابل استفاده هستند:
          </p>
        </div>
        <span class="rounded-full border border-nimoura-success/30 bg-nimoura-success/10 px-2.5 py-1 font-modam text-xs font-semibold text-nimoura-success">
          {{ earnedDiscountCodes.length }} کد فعال
        </span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="codeItem in earnedDiscountCodes"
          :key="codeItem.id"
          class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-nimoura-success/40 bg-nimoura-success/5 p-4"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-nimoura-text-800">تخفیف ۵۰٬۰۰۰ تومانی</span>
            <span class="font-modam text-[10px] text-nimoura-success">حداقل خرید ۱۵۰ هزار</span>
          </div>

          <div class="my-3 flex items-center justify-between gap-2 rounded-xl border border-nimoura-success/20 bg-white px-3 py-2 shadow-xs">
            <span class="font-mono text-sm font-black tracking-wider text-nimoura-success">{{ codeItem.discountCode }}</span>
            <Button
              type="button"
              icon="pi pi-copy"
              size="small"
              text
              class="!px-2 !py-1 !text-xs !text-nimoura-success hover:!bg-nimoura-success/10"
              @click="copySpecificCode(codeItem.discountCode!)"
            />
          </div>

          <div class="flex items-center justify-between gap-2 text-[11px] text-nimoura-text-500">
            <span>دوست: {{ codeItem.friendName || 'کاربر جدید' }}</span>
            <span class="font-modam">{{ formatPersianDate(codeItem.createdAt) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ HOW IT WORKS ══ -->
    <section class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:p-7">
      <h3 class="mb-5 text-base font-bold text-nimoura-text-900">مراحل دعوت و دریافت هدیه</h3>
      <div class="grid gap-4 sm:grid-cols-3">
        <div
          v-for="(step, i) in [
            { title: 'ارسال لینک یا کد', text: 'کد یا لینک اختصاصی خود را در پیامرسانها برای دوستان و آشنایان بفرستید.' },
            { title: 'ثبت نام دوست و هدایای اولیه', text: 'دوست شما ۵۰٬۰۰۰ تومان اعتبار باشگاه هدیه میگیرد و یک کد تخفیف ۵۰٬۰۰۰ تومانی اختصاصی برای شما پیامک میشود.' },
            { title: 'ثبت اولین خرید و ۵۰ هزار تومان نقد', text: 'با ثبت و نهایی شدن اولین خرید دوستتان، ۵۰٬۰۰۰ تومان اعتبار نقدی دیگر به کیف پول شما اضافه و پیامک میشود!' },
          ]"
          :key="step.title"
          class="flex items-start gap-3 rounded-2xl border border-nimoura-100 bg-nimoura-base/60 p-4"
        >
          <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary text-sm font-bold text-white">
            {{ i + 1 }}
          </div>
          <div>
            <h4 class="text-xs font-bold text-nimoura-text-900 sm:text-sm">{{ step.title }}</h4>
            <p class="mt-1 text-[11px] leading-relaxed text-nimoura-text-500">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FRIENDS LIST ══ -->
    <section class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:p-7">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-bold text-nimoura-text-900">لیست دوستان دعوتشده</h3>
        <span class="font-modam text-xs text-nimoura-text-500">{{ info?.history?.length ?? 0 }} نفر</span>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex h-14 items-center gap-3 rounded-2xl bg-nimoura-50 px-4">
          <Skeleton shape="circle" width="1.75rem" height="1.75rem" />
          <Skeleton width="35%" height="0.75rem" />
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="!info?.history || info.history.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
        <div class="mb-3 flex size-14 items-center justify-center rounded-full bg-nimoura-primary/10 text-nimoura-primary">
          <i class="pi pi-users text-2xl" />
        </div>
        <p class="text-sm font-semibold text-nimoura-text-800">هنوز دوستی با کد شما ثبت نام نکرده است</p>
        <p class="mt-1 max-w-sm text-xs text-nimoura-text-400">
          همین حالا لینک اختصاصی خود را کپی کنید و برای دوستانتان بفرستید تا اولین کد تخفیف ۵۰ هزار تومانی خود را دریافت کنید!
        </p>
      </div>

      <!-- TABLE -->
      <div v-else class="divide-y divide-nimoura-text-100 overflow-x-auto">
        <table class="w-full min-w-[550px] text-right text-xs sm:text-sm">
          <thead>
            <tr class="font-normal text-nimoura-text-400">
              <th class="pb-3 pr-2 font-normal">نام دوست</th>
              <th class="pb-3 font-normal">تاریخ ثبت نام</th>
              <th class="pb-3 font-normal">وضعیت</th>
              <th class="pb-3 pl-2 text-left font-normal">کد تخفیف شما</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-nimoura-text-100/60">
            <tr v-for="friend in info.history" :key="friend.id" class="text-nimoura-text-800">
              <td class="py-3.5 pr-2 font-medium">
                <div class="flex items-center gap-2">
                  <div class="flex size-7 items-center justify-center rounded-full bg-nimoura-100 text-xs font-bold text-nimoura-700">
                    {{ friend.friendName ? friend.friendName.charAt(0) : 'د' }}
                  </div>
                  <div>
                    <span class="block">{{ friend.friendName || 'کاربر جدید' }}</span>
                    <span class="font-modam block text-[11px] text-nimoura-text-400">{{ friend.friendPhone }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 font-modam text-nimoura-text-500">{{ formatPersianDate(friend.createdAt) }}</td>
              <td class="py-3.5">
                <span
                  v-if="friend.status === 'COMPLETED'"
                  class="inline-flex items-center gap-1 rounded-full border border-nimoura-success/30 bg-nimoura-success/10 px-2.5 py-1 text-xs font-semibold text-nimoura-success"
                >
                  <i class="pi pi-check text-[10px]" />
                  ثبت خرید و تکمیل پاداش
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full border border-nimoura-warning/30 bg-nimoura-warning/10 px-2.5 py-1 text-xs font-semibold text-nimoura-warning"
                >
                  <i class="pi pi-clock text-[10px]" />
                  در انتظار اولین خرید
                </span>
              </td>
              <td class="py-3.5 pl-2 text-left">
                <div v-if="friend.discountCode" class="inline-flex items-center gap-1.5 rounded-lg border border-nimoura-success/30 bg-nimoura-success/10 px-2.5 py-1">
                  <span class="font-mono text-xs font-bold text-nimoura-success">{{ friend.discountCode }}</span>
                  <Button
                    type="button"
                    icon="pi pi-copy"
                    text
                    rounded
                    class="!size-6 !text-nimoura-success hover:!bg-nimoura-success/15"
                    @click="copySpecificCode(friend.discountCode)"
                  />
                </div>
                <span v-else class="text-xs text-nimoura-text-400">–</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { info, loading, fetchReferralInfo, copyCode, copyLink, copySpecificCode, share } = useReferral();

onMounted(async () => {
  await fetchReferralInfo();
});

const displayLink = computed(() => {
  if (info.value?.referralLink) {
    return info.value.referralLink.replace('/register?ref=', '/auth?ref=');
  }
  if (typeof window !== 'undefined' && info.value?.referralCode) {
    return `${window.location.origin}/auth?ref=${info.value.referralCode}`;
  }
  return 'https://nimoura.ir/auth?ref=...';
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

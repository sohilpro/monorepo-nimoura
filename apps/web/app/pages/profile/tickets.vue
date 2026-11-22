<template>
  <div class="min-h-screen bg-nimoura-base font-vazir text-nimoura-text-700" dir="rtl">
    <!-- Header Band -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-nimoura-950 via-nimoura-800 to-nimoura-primary px-4 pb-6 pt-10"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/10 via-transparent to-nimoura-950/20"
        aria-hidden="true"
      />
      <div class="relative z-10 mx-auto max-w-5xl">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p class="flex items-center gap-1.5 text-xs text-white/50">
            <NuxtLink
              to="/"
              class="text-white/70 no-underline transition-opacity hover:opacity-80 hover:text-white"
              >خانه</NuxtLink
            >
            <i class="pi pi-angle-left text-[10px]" />
            <NuxtLink
              to="/profile"
              class="text-white/70 no-underline transition-opacity hover:opacity-80 hover:text-white"
              >ناحیه کاربری</NuxtLink
            >
            <i class="pi pi-angle-left text-[10px]" />
            <span class="text-white/90">پشتیبانی و تیکت‌ها</span>
          </p>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
          >
            <i class="pi pi-arrow-right text-[11px]" />
            <span>بازگشت به حساب کاربری</span>
          </NuxtLink>
        </div>
        <h1 class="font-vazir text-xl font-bold text-white sm:text-2xl">
          مرکز پشتیبانی و تیکتینگ آنلاین
        </h1>
        <p class="mt-1 font-vazir text-xs text-white/70">
          گفت‌وگوی مستقیم با تیم پشتیبانی فنی، پیگیری سفارشات و امور مالی نیمورا
        </p>
      </div>
    </div>

    <!-- Body -->
    <div class="mx-auto max-w-5xl px-4 pb-20 pt-6">
      <ProfileTicketsTicketList />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});
</script>

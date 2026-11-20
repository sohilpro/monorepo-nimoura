<template>
  <div class="profile-root min-h-screen" dir="rtl">
    <!-- Header Band -->
    <div class="relative overflow-hidden px-4 pb-6 pt-10" style="background: linear-gradient(135deg, #3d1f25 0%, #6b2d38 50%, #b76e79 100%);">
      <div class="relative z-10 mx-auto max-w-5xl">
        <div class="mb-4 flex items-center justify-between">
          <p class="flex items-center gap-1.5 text-xs text-white/50">
            <NuxtLink to="/" class="no-underline hover:opacity-80 transition-opacity text-white/70">خانه</NuxtLink>
            <i class="pi pi-angle-left text-[10px]" />
            <NuxtLink to="/profile" class="no-underline hover:opacity-80 transition-opacity text-white/70">ناحیه کاربری</NuxtLink>
            <i class="pi pi-angle-left text-[10px]" />
            <span class="text-white/90">پشتیبانی و تیکت‌ها</span>
          </p>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md hover:bg-white/20 transition"
          >
            <i class="pi pi-arrow-right text-[11px]" />
            <span>بازگشت به حساب کاربری</span>
          </NuxtLink>
        </div>
        <h1 class="font-vazir text-xl font-bold text-white sm:text-2xl">
          مرکز پشتیبانی و تیکتینگ آنلاین
        </h1>
        <p class="mt-1 text-xs text-white/70 font-vazir">
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

<style scoped>
.profile-root {
  background: #fff8f4;
  font-family: 'Vazirmatn', sans-serif;
}
</style>

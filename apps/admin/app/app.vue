<script setup lang="ts">
const route = useRoute()

const routeTitles: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/auth(?:\/|$)/, title: 'ورود به پنل' },
  { pattern: /^\/loyalty(?:\/|$)/, title: 'باشگاه مشتریان' },
  { pattern: /^\/banners(?:\/|$)/, title: 'بنرها' },
  { pattern: /^\/media(?:\/|$)/, title: 'مدیریت رسانه و فایل‌ها' },
  { pattern: /^\/brand(?:\/|$)/, title: 'برندها' },
  { pattern: /^\/category(?:\/|$)/, title: 'دسته‌بندی‌ها' },
  { pattern: /^\/comments(?:\/|$)/, title: 'نظرات' },
  { pattern: /^\/customers(?:\/|$)/, title: 'مشتریان' },
  { pattern: /^\/magazine\/articles(?:\/|$)/, title: 'مقالات مجله' },
  { pattern: /^\/magazine\/authors(?:\/|$)/, title: 'نویسندگان مجله' },
  { pattern: /^\/magazine\/categories(?:\/|$)/, title: 'دسته‌بندی‌های مجله' },
  { pattern: /^\/magazine\/comments(?:\/|$)/, title: 'نظرات مجله' },
  { pattern: /^\/magazine\/tags(?:\/|$)/, title: 'برچسب‌های مجله' },
  { pattern: /^\/news-letter(?:\/|$)/, title: 'خبرنامه' },
  { pattern: /^\/order(?:\/|$)/, title: 'سفارش‌ها' },
  { pattern: /^\/product(?:\/|$)/, title: 'محصولات' },
  { pattern: /^\/promotion(?:\/|$)/, title: 'تخفیف‌ها' },
  { pattern: /^\/tag(?:\/|$)/, title: 'برچسب‌ها' },
  { pattern: /^\/tickets(?:\/|$)/, title: 'تیکت‌ها' },
]

const pageTitle = computed(() => {
  if (route.path === '/') return 'داشبورد مدیریت'
  return routeTitles.find(({ pattern }) => pattern.test(route.path))?.title ?? 'پنل مدیریت نیمورا'
})

useHead(() => ({
  title: pageTitle.value,
  titleTemplate: '%s | نیمورا',
}))
</script>

<template>
  <Toast position="top-center" />
  <ConfirmDialog />
  <NuxtLayout>
    <NuxtLoadingIndicator color="#b76e79" />
    <NuxtPage />
  </NuxtLayout>
</template>

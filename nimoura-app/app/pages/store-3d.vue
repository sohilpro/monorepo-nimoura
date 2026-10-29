<!-- app/pages/store-3d.vue -->
<script setup lang="ts">
definePageMeta({ layout: false, middleware: ['shop3d-access', 'shop3d-support'] })

const route = useRoute()
const cfg = useRuntimeConfig().public
const origin = useRequestURL().origin

const zoneLabel = computed(() => {
  const v = VIEWPOINTS.find((x) => x.id === route.query.zone)
  return v && v.id !== 'entrance' ? v.label : null
})

const title = computed(() =>
  zoneLabel.value
    ? `مغازه سه‌بعدی نیمورا | بخش ${zoneLabel.value}`
    : 'مغازه سه‌بعدی نیمورا | خرید قدم‌زنان لوازم آرایشی',
)
const description =
  'در بوتیک سه‌بعدی نیمورا قدم بزنید، لوازم آرایشی را از روی قفسه‌ها ببینید و همان‌جا به سبد خرید اضافه کنید.'
const image = `${origin}/og/store-3d.jpg`

useHead({
  htmlAttrs: { class: 'overscroll-none' },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
  // کوئری‌ها (zone، product، from) نباید نسخه تکراری بسازند
  link: [{ rel: 'canonical', href: `${origin}/store-3d` }],
})

useSeoMeta({
  title,
  description,
  // وقتی فلگ جزئی است محتوا برای همه یکسان نیست؛ فقط در all ایندکس شود
  robots: cfg.shop3dMode === 'all' ? 'index, follow' : 'noindex, follow',
  ogType: 'website',
  ogLocale: 'fa_IR',
  ogSiteName: 'نیمورا',
  ogTitle: title,
  ogDescription: description,
  ogUrl: `${origin}/store-3d`,
  ogImage: image,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
})

onMounted(() => {
  const { check } = useShop3dAccess()
  if (!check(route.query)) {
    return navigateTo({ path: '/', query: { from: '3d', reason: 'unavailable' } }, { replace: true })
  }
  if (route.query.force3d !== '1') {
    const s = evaluateSupport()
    if (!s.ok) {
      return navigateTo({ path: '/', query: { from: '3d', reason: s.reason } }, { replace: true })
    }
  }
})
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-nimoura-velvet">
    <h1 class="sr-only">مغازه سه‌بعدی نیمورا</h1>
    <p class="sr-only">{{ description }}</p>
    <NuxtLink to="/" class="sr-only">رفتن به نسخه ساده فروشگاه</NuxtLink>

    <!-- پشت صحنه؛ تا آماده‌شدن بسته ۳D دیده می‌شود -->
    <div class="absolute inset-0 grid place-items-center text-center" aria-hidden="true">
      <div>
        <p dir="ltr" class="text-4xl tracking-[0.35em] text-nimoura-primary" style="font-family: Georgia, 'Times New Roman', serif">NIMOURA</p>
        <p dir="ltr" class="mt-2 text-[11px] tracking-[0.4em] text-nimoura-text-300">BEAUTY BOUTIQUE</p>
      </div>
    </div>

    <ClientOnly>
      <LazyShop3dApp />
    </ClientOnly>
  </div>
</template>
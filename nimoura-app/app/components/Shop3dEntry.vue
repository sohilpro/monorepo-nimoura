<!-- app/components/Shop3dEntry.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ViewId } from '~/utils/storeLayout'

const props = withDefaults(
  defineProps<{
    variant?: 'header' | 'hero' | 'link'
    /** بخش مقصد، مثلاً 'makeup' */
    zone?: ViewId
    /** slug محصول؛ مغازه به همان محصول می‌رود */
    product?: string
    /** برای آنالیتیکس: header | home | product | ... */
    source?: string
    label?: string
  }>(),
  { variant: 'header', source: 'site' },
)

const route = useRoute()
const { check } = useShop3dAccess()
const show = ref(false)

const to = computed(() => ({
  path: '/store-3d',
  query: {
    from: props.source,
    ...(props.product ? { product: props.product } : props.zone ? { zone: props.zone } : {}),
  },
}))

onMounted(() => {
  const run = () => { show.value = check(route.query) && evaluateSupport().ok }
  const idle = (window as any).requestIdleCallback as ((cb: () => void) => void) | undefined
  if (idle) idle(run)
  else setTimeout(run, 200)
})

let warmed = false
function warm() {
  if (warmed) return
  warmed = true
  preloadRouteComponents('/store-3d').catch(() => {})
  preloadComponents('Shop3dApp').catch(() => {})
}

const text = computed(
  () =>
    props.label ??
    (props.variant === 'link' ? 'این محصول را در مغازه سه‌بعدی ببین' : 'بیا داخل مغازه'),
)
</script>

<template>
  <NuxtLink
    v-if="show"
    :to="to"
    :prefetch="false"
    data-shop3d-entry
    :class="{
      'inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-nimoura-velvet px-4 py-2 text-sm text-nimoura-base shadow-sm transition hover:bg-nimoura-primary': variant === 'header',
      'group relative isolate block overflow-hidden rounded-3xl bg-nimoura-velvet p-6 text-nimoura-base md:p-8': variant === 'hero',
      'inline-flex items-center gap-1.5 text-sm text-nimoura-primary underline underline-offset-4': variant === 'link',
    }"
    @pointerenter.once="warm"
    @focus.once="warm"
    @touchstart.passive.once="warm"
  >
    <svg
      v-if="variant !== 'hero'"
      viewBox="0 0 24 24"
      class="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>

    <template v-if="variant === 'hero'">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgb(183_110_121/0.45),transparent_55%),radial-gradient(circle_at_10%_90%,rgb(217_198_226/0.25),transparent_50%)]"
      />
      <p dir="ltr" class="text-xs tracking-[0.4em] text-nimoura-accent">NIMOURA</p>
      <h2 class="mt-3 text-xl font-bold leading-9 md:text-2xl">بیا داخل مغازه نیمورا</h2>
      <p class="mt-2 max-w-md text-sm leading-7 text-nimoura-text-200">
        بین قفسه‌ها قدم بزن، محصولات را از نزدیک ببین و همان‌جا بخر؛ مثل رفتن به یک بوتیک واقعی.
      </p>
      <span
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-nimoura-primary px-5 py-2.5 text-sm font-medium text-white transition group-hover:opacity-90"
      >
        ورود به مغازه
        <svg viewBox="0 0 24 24" class="size-4 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </template>
    <template v-else>{{ text }}</template>
  </NuxtLink>
</template>
<script setup lang="ts">
import type { BannerItem, BannerLayout } from '#shared/types/banners'

type GridLayout = Exclude<BannerLayout, 'carousel'>

const props = withDefaults(
  defineProps<{
    banners: BannerItem[]
    layout: GridLayout
    loading?: boolean
    /** موبایل: به‌جای زیر هم، اسکرول افقی با snap */
    mobileScroll?: boolean
    aspectClass?: string
    gapClass?: string
    showTitle?: boolean
    heightClass?: string
  }>(),
  { gapClass: 'gap-3 sm:gap-4' },
)

const CONFIG: Record<
  GridLayout,
  { cols: string; aspect: string; count: number; max: number; sizes: string }
> = {
  single: { cols: 'grid-cols-1', aspect: 'aspect-[16/7] sm:aspect-[21/8] lg:aspect-[3.5/1]', count: 1, max: 1, sizes: '100vw lg:1280px' },
  'grid-2': { cols: 'grid-cols-1 sm:grid-cols-2', aspect: 'aspect-[16/9] sm:aspect-[16/8]', count: 2, max: 24, sizes: '100vw sm:50vw lg:640px' },
  'grid-3': { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', aspect: 'aspect-[4/3]', count: 3, max: 24, sizes: '100vw sm:50vw lg:427px' },
  'grid-4': { cols: 'grid-cols-2 lg:grid-cols-4', aspect: 'aspect-[4/3]', count: 4, max: 24, sizes: '50vw lg:320px' },
  featured: { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:h-[380px]', aspect: 'aspect-[16/9] lg:aspect-auto', count: 3, max: 3, sizes: '100vw sm:50vw lg:853px' },
  mosaic: { cols: 'grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:h-[380px]', aspect: 'aspect-[4/3] lg:aspect-auto', count: 5, max: 5, sizes: '50vw lg:640px' },
}

const cfg = computed(() => CONFIG[props.layout])

const items = computed<(BannerItem | null)[]>(() =>
  props.loading
    ? Array.from({ length: cfg.value.count }, () => null)
    : props.banners.slice(0, cfg.value.max),
)

// محاسبه کلاس تناسب/ارتفاع بدون تداخل
const itemAspectClass = computed(() => {
  // اگر کاربر صریحاً heightClass یا aspectClass فرستاده بود، اولویت با آنهاست
  if (props.heightClass) return props.heightClass
  if (props.aspectClass) return props.aspectClass
  return cfg.value.aspect
})

// بنر اول در حالت‌های featured / mosaic بزرگ‌تر است
function cellClass(i: number) {
  if (i !== 0) return ''
  if (props.layout === 'featured') return 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
  if (props.layout === 'mosaic') return 'col-span-2 lg:row-span-2'
  return ''
}
</script>

<template>
  <div
    class="grid"
    :class="[
      cfg.cols,
      gapClass,
      mobileScroll &&
        'max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:pb-2 max-sm:[scrollbar-width:none]',
    ]"
  >
    <div
      v-for="(item, i) in items"
      :key="item?.id ?? `s${i}`"
      class="overflow-hidden rounded-2xl border border-vecaro-primary/10 bg-white shadow-xs"
      :class="[
        itemAspectClass,
        cellClass(i),
        mobileScroll && 'max-sm:w-[82%] max-sm:shrink-0 max-sm:snap-center',
      ]"
    >
      <BannersCard
        v-if="item"
        :banner="item"
        :priority="layout === 'single' && i === 0"
        :sizes="cfg.sizes"
        :show-title="showTitle"
        class="size-full"
      />
      <div v-else class="size-full animate-pulse bg-vecaro-primary/10" />
    </div>
  </div>
</template>
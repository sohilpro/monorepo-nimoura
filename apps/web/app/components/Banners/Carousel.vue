<script setup lang="ts">
import useEmblaCarousel from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'
import type { BannerItem } from '#shared/types/banners'

const props = withDefaults(
  defineProps<{
    banners: BannerItem[]
    autoplay?: number | false
    arrows?: boolean
    dots?: boolean
    heightClass?: string
  }>(),
  // به جای h-56 از aspect ratio استفاده می‌کنیم تا ارتفاع کاملاً متناسب با عرض تغییر کند
  { autoplay: 4500, arrows: true, dots: true, heightClass: 'aspect-[16/7] sm:aspect-[21/8] lg:aspect-[3/1]' },
)

// کامپوننت والد با :key روی لیست بنرها remount می‌شود، پس گزینه‌ها ثابت‌اند
const multiple = props.banners.length > 1
const reducedMotion = usePreferredReducedMotion()

const plugins =
  props.autoplay && multiple && reducedMotion.value !== 'reduce'
    ? [Autoplay({ delay: props.autoplay, stopOnInteraction: false, stopOnMouseEnter: true })]
    : []

const [emblaRef, emblaApi] = useEmblaCarousel(
  { loop: multiple, direction: 'rtl', align: 'start', watchDrag: multiple },
  plugins,
)

const activeIndex = ref(0)
watch(
  emblaApi,
  (api, _old, onCleanup) => {
    if (!api) return
    const sync = () => (activeIndex.value = api.selectedScrollSnap())
    sync()
    api.on('select', sync).on('reInit', sync)
    onCleanup(() => api.off('select', sync).off('reInit', sync))
  },
  { immediate: true },
)

// وقتی اسلایدر از صفحه خارج شد، autoplay متوقف شود
const root = useTemplateRef<HTMLElement>('root')
const visible = useElementVisibility(root)
watch(visible, (v) => {
  const ap = emblaApi.value?.plugins().autoplay
  if (!ap) return
  if (v) ap.play()
  else ap.stop()
})

// در حالت RTL: چپ = اسلاید بعدی، راست = اسلاید قبلی
const next = () => emblaApi.value?.scrollNext()
const prev = () => emblaApi.value?.scrollPrev()
const goTo = (i: number) => emblaApi.value?.scrollTo(i)
const fa = (n: number) => n.toLocaleString('fa-IR')

const arrowClass =
  'hidden lg:flex absolute top-1/2 -translate-y-1/2 z-20 size-11 items-center justify-center rounded-full bg-vecaro-primary/70 text-white backdrop-blur-md border border-white/20 shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300 hover:bg-vecaro-primary hover:text-vecaro-accent active:scale-95 cursor-pointer'
</script>

<template>
  <div
    ref="root"
    role="region"
    aria-roledescription="carousel"
    aria-label="بنرهای تبلیغاتی"
    class="group relative overflow-hidden rounded-2xl border border-vecaro-primary/10 bg-white shadow-xs"
    @keydown.left.prevent="next"
    @keydown.right.prevent="prev"
  >
    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex touch-pan-y">
        <div
          v-for="(banner, i) in banners"
          :key="banner.id"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${fa(i + 1)} از ${fa(banners.length)}`"
          class="min-w-0 flex-none basis-full relative"
          :class="heightClass"
        >
          <BannersCard
            :banner="banner"
            :priority="i === 0"
            overlay
            sizes="100vw lg:1280px"
            class="size-full"
          />
        </div>
      </div>
    </div>

    <template v-if="arrows && multiple">
      <button type="button" aria-label="اسلاید بعدی" :class="[arrowClass, 'left-4']" @click="next">
        <i class="pi pi-chevron-left text-sm" />
      </button>
      <button type="button" aria-label="اسلاید قبلی" :class="[arrowClass, 'right-4']" @click="prev">
        <i class="pi pi-chevron-right text-sm" />
      </button>
    </template>

    <div
  v-if="dots && multiple"
  class="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2 py-1 backdrop-blur-md transition-all duration-300 sm:bottom-3.5 sm:gap-1.5 sm:px-2.5 sm:py-1"
>
  <button
    v-for="(b, i) in banners"
    :key="b.id"
    type="button"
    class="h-1.5 cursor-pointer rounded-full transition-all duration-300 ease-out focus-visible:outline-none"
    :class="
      activeIndex === i
        ? 'w-4.5 bg-vecaro-accent shadow-xs'
        : 'w-1.5 bg-white/50 hover:bg-white/80'
    "
    :aria-label="`رفتن به اسلاید ${fa(i + 1)}`"
    :aria-current="activeIndex === i"
    @click="goTo(i)"
  />
</div> 
  </div>
</template>
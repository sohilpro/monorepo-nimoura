<template>
  <div class="w-full md:w-2/4 flex flex-col justify-center items-center gap-y-4">

    <!-- ══ DESKTOP ══ -->
    <div class="hidden w-full flex-col items-center gap-y-4 md:flex">
      <div class="overflow-hidden w-full rounded-xl relative aspect-square bg-nimoura-base/30" ref="mainRef">
        <div
          v-if="isZooming"
          class="zoom-lens pointer-events-none absolute z-10 border-2 border-white/60 bg-white/10"
          :style="{
            width: lensSize + 'px', height: lensSize + 'px',
            left: lensPos.x + 'px', top: lensPos.y + 'px',
            transform: 'translate(-50%, -50%)', borderRadius: '4px',
          }"
        />
        <div class="flex h-full touch-pan-y">
          <div
            v-for="(img, i) in images" :key="'main-' + i"
            class="flex-none w-full h-full relative overflow-hidden"
            @mouseenter="onMouseEnter(i)"
            @mouseleave="onMouseLeave"
            @mousemove="onMouseMove($event)"
          >
            <NuxtPicture
              :src="img" :alt="`نمایش تصویر ${i + 1}`"
              format="avif,webp,jpeg"
              :img-attrs="{
                class: 'object-cover w-full h-full select-none',
                style: 'cursor:crosshair',
                draggable: 'false',
                fetchpriority: i === 0 ? 'high' : undefined,
              }"
              sizes="600px" width="800" height="800"
              :loading="i === 0 ? 'eager' : 'lazy'"
            />
          </div>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="isZooming && zoomImgSrc"
          class="pointer-events-none fixed z-[9999] rounded-xl overflow-hidden shadow-2xl border border-gray-200"
          :style="{
            width: zoomWindowSize + 'px', height: zoomWindowSize + 'px',
            top: zoomPortalPos.top + 'px', left: zoomPortalPos.left + 'px',
            backgroundImage: `url(${zoomImgSrc})`,
            backgroundSize: `${zoomWindowSize * zoomLevel}px ${zoomWindowSize * zoomLevel}px`,
            backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
            backgroundRepeat: 'no-repeat', backgroundColor: '#fff',
          }"
        />
      </Teleport>

      <div ref="thumbRef" class="overflow-hidden w-full">
        <div class="flex gap-x-2 touch-pan-y">
          <div
            v-for="(img, i) in images" :key="'thumb-' + i"
            class="flex-none w-[18%] aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 bg-nimoura-base/30"
            :class="activeIndex === i ? 'border-nimoura-primary' : 'border-transparent'"
            @click="scrollTo(i)"
          >
            <NuxtPicture
              :src="img" :alt="`تصویر بندانگشتی ${i + 1}`"
              format="avif,webp,jpeg"
              :img-attrs="{ class: 'object-cover rounded-lg w-full h-full' }"
              width="150" height="150" sizes="150px" loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MOBILE STRIP ══ -->
    <div ref="mobileStripRef" class="overflow-hidden w-full relative md:hidden">
      <div class="flex gap-1.5">
        <div
          v-for="(img, i) in images" :key="'mstrip-' + i"
          class="flex-none w-56 h-56 rounded-2xl overflow-hidden cursor-pointer border border-gray-100 bg-nimoura-base/30"
          @click="openGallery(i)"
        >
          <NuxtPicture
            :src="img" :alt="`تصویر ${i + 1}`"
            format="avif,webp,jpeg"
            :img-attrs="{
              class: 'object-cover w-full h-full',
              fetchpriority: i === 0 ? 'high' : undefined,
            }"
            width="340" height="340"
            :loading="i === 0 ? 'eager' : 'lazy'"
          />
        </div>
      </div>
      <!-- Dots -->
      <div class="pointer-events-none absolute inset-x-0 top-2 flex justify-center gap-1.5">
        <span
          v-for="(_, i) in images" :key="'dot-' + i"
          class="block rounded-full transition-all duration-300"
          :class="activeMobileIndex === i ? 'w-4 h-1.5 bg-nimoura-primary' : 'w-1.5 h-1.5 bg-gray-300'"
        />
      </div>
    </div>


    <!-- ══ GALLERY OVERLAY ══ -->
    <Teleport to="body">
      <Transition name="gallery-fade">
        <div
          v-if="galleryOpen"
          class="fixed inset-0 z-[9999] bg-black/96 flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 shrink-0">
            <span class="text-white/80 text-sm font-medium">گالری محصول</span>
            <button
              class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              @click="galleryOpen = false"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2l14 14M16 2L2 16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Main area -->
          <div class="flex-1 min-h-0 flex items-center justify-center px-4 overflow-hidden"  @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd">

            <!-- Divider screen -->
            <div
              v-if="currentSlide.type === 'divider'"
              class="flex flex-col items-center gap-5 text-center px-8"
            >
              <div class="flex items-center gap-3 w-full">
                <div class="flex-1 h-px bg-white/15"/>
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  
                  <i class="pi pi-users text-white text-xl!"></i>
                </div>
                <div class="flex-1 h-px bg-white/15"/>
              </div>
              <p class="text-white/80 text-sm font-medium">تصاویر مشتری‌ها</p>
              <p class="text-white/40 text-xs leading-relaxed">بکشید یا دکمه زیر را بزنید تا<br/>تصاویر خریداران را ببینید</p>
              <button
                class="px-6 py-2.5 flex items-center gap-1 rounded-full bg-white/10 text-white/70 text-xs border border-white/15 active:bg-white/20 transition-all"
                @click="galleryIndex++"
              >
                مشاهده تصاویر <i class="pi pi-arrow-left text-xs!"></i>
              </button>
            </div>

            <!-- Normal image -->
            <div
              v-else
              class="relative w-full h-full flex items-center justify-center"
            >
              <NuxtPicture
                :key="currentSlide.src"
                :src="currentSlide.src"
                :alt="`تصویر ${galleryIndex + 1}`"
                format="avif,webp,jpeg"
                :img-attrs="{
                  style: 'display:block; max-width:100%; max-height:calc(100vh - 200px); object-fit:contain; border-radius:12px;'
                }"
                width="800" height="800"
              />

              <!-- Customer comment overlay -->
              <Transition name="comment-fade">
                <div
                  v-if="currentSlide.type === 'customer'"
                  class="absolute bottom-3 left-3 right-3 bg-black/55 backdrop-blur-md rounded-2xl p-3 cursor-pointer"
                  @click="commentExpanded = !commentExpanded"
                >
                  <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-medium text-white shrink-0">
                      {{ currentSlide.initials }}
                    </div>
                    <span class="text-white/90 text-xs font-medium">{{ currentSlide.customerName }}</span>
                    <span v-for="s in currentSlide.stars" :key="s" class="text-[10px] text-amber-400">★</span>
                    <span
                      v-if="isCommentLong(currentSlide.comment)"
                      class="mr-auto text-white/40 text-[10px] transition-transform duration-300 select-none"
                      :class="commentExpanded ? 'rotate-180' : ''"
                    >▾</span>
                  </div>
                  <div
                    class="overflow-hidden transition-all duration-300 ease-in-out"
                    :style="commentExpanded ? { maxHeight: '200px' } : { maxHeight: '1.4rem' }"
                  >
                    <p class="text-white/65 text-xs leading-relaxed">{{ currentSlide.comment }}</p>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Pill -->
          <div class="flex justify-center py-2 shrink-0">
            <span
              class="text-[10px] px-2.5 py-0.5 rounded-full transition-all duration-300"
              :class="currentSlide.type === 'product'
                ? 'bg-white/10 text-white/50'
                : currentSlide.type === 'divider'
                  ? 'bg-white/5 text-white/30'
                  : 'bg-nimoura-accent/20 text-nimoura-primary'"
            >
              {{ currentSlide.type === 'product' ? 'تصاویر محصول' : currentSlide.type === 'divider' ? '···' : 'تصاویر خریداران' }}
            </span>
          </div>

          <!-- Thumbnails -->
          <div class="flex gap-2 px-4 pb-5 pt-1 overflow-x-auto shrink-0 no-scrollbar">
            <div
              v-for="(slide, i) in allSlides" :key="'ovt-' + i"
              class="relative flex-none w-14 h-14 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
              :class="i === galleryIndex
                ? 'پoutline-2 outline-nimoura-primary outline-offset-1 opacity-100'
                : 'opacity-40'"
              @click="galleryIndex = i"
            >
              <!-- Divider thumb -->
              <div
                v-if="slide.type === 'divider'"
                class="w-full text-[10px] text-white h-full bg-white/10 flex text-center items-center justify-center"
              >
                <p>تصاویر خریداران</p>
              </div>

              <NuxtPicture
                v-else
                :src="slide.src" alt=""
                format="avif,webp,jpeg"
                :img-attrs="{ class: 'object-cover w-full h-full' }"
                width="112" height="112" loading="lazy"
              />

              <span
                v-if="slide.type === 'customer'"
                class="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-nimoura-primary"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import useEmblaCarousel from 'embla-carousel-vue'

interface CustomerReview {
  name: string
  initials: string
  stars: number
  comment: string
  date: string
  tags: string[]
  images: string[]
}

interface Slide {
  src: string
  type: 'product' | 'customer' | 'divider'
  customerName?: string
  initials?: string
  stars?: number
  comment?: string
}

const props = defineProps<{
  images: string[]
  customerReviews?: CustomerReview[]
}>()

// ── Slides ────────────────────────────────────────────
const allSlides = computed<Slide[]>(() => {
  const slides: Slide[] = props.images.map(src => ({ src, type: 'product' }))
  if (props.customerReviews?.length) {
    slides.push({ src: '', type: 'divider' })
    props.customerReviews.forEach(cu =>
      cu.images.forEach(src => slides.push({
        src, type: 'customer',
        customerName: cu.name, initials: cu.initials,
        stars: cu.stars, comment: cu.comment,
      }))
    )
  }
  return slides
})

// اسلاید فعلی — computed تا هر بار object جدید نسازه
const currentSlide = computed(() => allSlides.value[galleryIndex.value] ?? { src: '', type: 'product' as const })

const productGlobalOffset = (ci: number, imgIdx: number): number => {
  let offset = props.images.length + 1
  for (let i = 0; i < ci; i++) offset += props.customerReviews?.[i]?.images.length ?? 0
  return offset + imgIdx
}

// ── Gallery ───────────────────────────────────────────
const galleryOpen = ref(false)
const galleryIndex = ref(0)
const commentExpanded = ref(false)

const openGallery = (idx: number) => {
  galleryIndex.value = idx
  galleryOpen.value = true
}

watch(galleryIndex, () => { commentExpanded.value = false })

const isCommentLong = (text?: string) => (text?.length ?? 0) > 60

// Touch swipe
let touchStartX = 0
const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX }
const onTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    const len = allSlides.value.length;
    // در RTL جهت برعکسه
    galleryIndex.value =
      diff > 0
        ? (galleryIndex.value - 1 + len) % len // ← swap شد
        : (galleryIndex.value + 1) % len; // ← swap شد
  }
};

// ── Embla Desktop ─────────────────────────────────────
const activeIndex = ref(0)
const [mainRef, mainApi] = useEmblaCarousel({ loop: false, align: 'start', direction: 'rtl' })
const [thumbRef] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true, direction: 'rtl', containScroll: 'trimSnaps' })

watch(mainApi, api => api?.on('select', () => { activeIndex.value = api.selectedScrollSnap() }))
const scrollTo = (i: number) => { mainApi.value?.scrollTo(i); activeIndex.value = i }

// ── Zoom ──────────────────────────────────────────────
const lensSize = 120, zoomWindowSize = 450, zoomLevel = 2.5
const isZooming = ref(false), zoomImgSrc = ref('')
const lensPos = ref({ x: 0, y: 0 }), bgPos = ref({ x: 0, y: 0 })
const zoomPortalPos = ref({ top: 0, left: 0 })

const onMouseEnter = (i: number) => { zoomImgSrc.value = props.images[i] ?? ''; isZooming.value = true }
const onMouseLeave = () => { isZooming.value = false; zoomImgSrc.value = '' }
const onMouseMove = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const mx = event.clientX - rect.left, my = event.clientY - rect.top
  lensPos.value = { x: mx, y: my }
  const rx = Math.min(Math.max(mx / rect.width, 0), 1)
  const ry = Math.min(Math.max(my / rect.height, 0), 1)
  const maxB = zoomWindowSize * zoomLevel - zoomWindowSize
  bgPos.value = { x: -(rx * maxB), y: -(ry * maxB) }
  const pl = rect.left - zoomWindowSize - 16
  zoomPortalPos.value = {
    top: Math.max(8, Math.min(rect.top + rect.height / 2 - zoomWindowSize / 2, window.innerHeight - zoomWindowSize - 8)),
    left: pl > 0 ? pl : rect.right + 16,
  }
}

// ── Mobile Embla ──────────────────────────────────────
const activeMobileIndex = ref(0)
const [mobileStripRef, mobileStripApi] = useEmblaCarousel({
  loop: false, align: 'start', dragFree: false, direction: 'rtl', containScroll: 'trimSnaps',
})
watch(mobileStripApi, api => {
  if (!api) return
  const update = () => { activeMobileIndex.value = api.selectedScrollSnap() }
  api.on('select', update)
  api.on('scroll', update)
})
</script>

<style scoped>
.gallery-fade-enter-active, .gallery-fade-leave-active { transition: opacity 0.2s ease; }
.gallery-fade-enter-from, .gallery-fade-leave-to { opacity: 0; }
.comment-fade-enter-active, .comment-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.comment-fade-enter-from, .comment-fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>
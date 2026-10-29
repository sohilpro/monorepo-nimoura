<!-- app/components/shop3d/ProductCard.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ShopVariant } from '~/composables/useShopCart'

const catalog = useShopCatalog()
const cart = useShopCart()
const { lines, count } = cart
const { selectedIndex, close, flashSuccess } = useShopInteraction()

const item = computed(() =>
  selectedIndex.value === null ? null : (catalog.instances.value[selectedIndex.value] ?? null),
)
const p = computed(() => item.value?.product ?? null)

const inCart = computed(() =>
  p.value ? lines.value.filter((l) => l.productId === p.value!.id).reduce((a, l) => a + l.qty, 0) : 0,
)

/* ---------- واریانت ---------- */
const variants = ref<ShopVariant[] | null>(null)
const variantsLoading = ref(false)
const variantId = ref<ShopVariant['id'] | null>(null)
const phase = ref<'idle' | 'adding' | 'done' | 'error'>('idle')
const errorMsg = ref('')
const imgFailed = ref(false)
let doneTimer: ReturnType<typeof setTimeout> | undefined

watch(
  p,
  async (np) => {
    clearTimeout(doneTimer)
    phase.value = 'idle'
    errorMsg.value = ''
    imgFailed.value = false
    variants.value = null
    variantId.value = null
    if (np?.type !== 'variant') return

    variantsLoading.value = true
    try {
      const list = await cart.loadVariants(np)
      if (p.value?.id !== np.id) return // کاربر محصول دیگری انتخاب کرد
      variants.value = list
      variantId.value = list?.find((v) => v.available)?.id ?? null
    } catch {
      variants.value = null
    } finally {
      if (p.value?.id === np.id) variantsLoading.value = false
    }
  },
  { immediate: true },
)

const mode = computed<'unavailable' | 'loading' | 'page' | 'add'>(() => {
  const x = p.value
  if (!x || !x.available) return 'unavailable'
  if (x.type !== 'variant') return 'add'
  if (variantsLoading.value) return 'loading'
  return variants.value?.length ? 'add' : 'page'
})

async function add() {
  const x = p.value
  if (!x || phase.value === 'adding') return
  const variant = variants.value?.find((v) => v.id === variantId.value)
  if (x.type === 'variant' && variants.value?.length && !variant) return

  phase.value = 'adding'
  errorMsg.value = ''
  try {
    await cart.add(x, variant)
    phase.value = 'done'
    if (selectedIndex.value !== null) flashSuccess(selectedIndex.value)
    clearTimeout(doneTimer)
    doneTimer = setTimeout(() => (phase.value = 'idle'), 2200)
  } catch (e) {
    phase.value = 'error'
    errorMsg.value = e instanceof Error && e.message ? e.message : 'افزودن به سبد ناموفق بود'
  }
}

/* ---------- Esc ---------- */
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedIndex.value !== null) close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(doneTimer)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-8 opacity-0"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="translate-y-8 opacity-0"
  >
    <section
      v-if="p"
      role="dialog"
      dir="rtl"
      :aria-label="p.title"
      class="absolute inset-x-0 bottom-0 z-30 max-h-[72dvh] overflow-y-auto rounded-t-3xl bg-nimoura-base/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-nimoura-text-800 shadow-2xl backdrop-blur-md md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-3xl md:p-5"
    >
      <button
        type="button"
        class="absolute end-3 top-3 grid size-9 place-items-center rounded-full text-nimoura-text-600 transition hover:bg-nimoura-accent/40"
        aria-label="بستن"
        @click="close()"
      >
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <!-- سربرگ -->
      <div class="flex gap-3 pe-8">
        <div class="size-24 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-nimoura-border/50">
          <img
            v-if="p.image && !imgFailed"
            :src="p.image"
            :alt="p.title"
            class="size-full object-contain"
            @error="imgFailed = true"
          />
          <div v-else class="size-full bg-gradient-to-b from-nimoura-base to-nimoura-accent" />
        </div>
        <div class="min-w-0 flex-1">
          <p v-if="p.brandName" class="text-xs text-nimoura-text-500">{{ p.brandName }}</p>
          <h2 class="mt-0.5 line-clamp-3 text-sm leading-6 font-semibold">{{ p.title }}</h2>
        </div>
      </div>

      <!-- قیمت -->
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span v-if="p.available" class="text-lg font-bold text-nimoura-velvet">{{ formatPrice(p.finalPrice) }}</span>
        <span v-else class="text-base font-semibold text-nimoura-text-500">ناموجود</span>
        <template v-if="p.available && p.discountPercent > 0">
          <span class="text-xs text-nimoura-text-500 line-through">{{ formatPrice(p.price) }}</span>
          <span class="rounded-full bg-nimoura-primary px-2 py-0.5 text-xs text-white">
            {{ p.discountPercent.toLocaleString('fa-IR') }}٪ تخفیف
          </span>
        </template>
      </div>
      <p v-if="p.available && p.stock <= 5" class="mt-1 text-xs text-nimoura-primary">
        تنها {{ p.stock.toLocaleString('fa-IR') }} عدد در انبار
      </p>

      <!-- انتخاب مدل/رنگ -->
      <div v-if="variants?.length" class="mt-3">
        <p class="mb-1.5 text-xs text-nimoura-text-600">مدل / رنگ</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="v in variants"
            :key="v.id"
            type="button"
            :disabled="!v.available"
            class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-40"
            :class="
              variantId === v.id
                ? 'border-nimoura-primary bg-nimoura-primary/10 text-nimoura-primary'
                : 'border-nimoura-border bg-white/60 hover:border-nimoura-primary'
            "
            :aria-pressed="variantId === v.id"
            @click="variantId = v.id"
          >
            <span v-if="v.color" class="size-3.5 rounded-full ring-1 ring-black/10" :style="{ background: v.color }" />
            {{ v.label }}
          </button>
        </div>
      </div>

      <!-- اقدام -->
      <div class="mt-4 space-y-2">
        <button
          v-if="mode === 'unavailable'"
          type="button"
          disabled
          class="w-full rounded-full bg-nimoura-border/50 py-3 text-sm text-nimoura-text-500"
        >
          ناموجود
        </button>

        <button
          v-else-if="mode === 'loading'"
          type="button"
          disabled
          class="w-full animate-pulse rounded-full bg-nimoura-accent/60 py-3 text-sm text-nimoura-text-600"
        >
          در حال بارگذاری مدل‌ها…
        </button>

        <NuxtLink
          v-else-if="mode === 'page'"
          :to="SHOP_ROUTES.product(p.slug)"
          class="block w-full rounded-full bg-nimoura-velvet py-3 text-center text-sm text-nimoura-base transition hover:opacity-90"
        >
          انتخاب مدل در صفحه محصول
        </NuxtLink>

        <button
          v-else
          type="button"
          :disabled="phase === 'adding' || (variants?.length ? variantId === null : false)"
          class="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white transition disabled:opacity-60"
          :class="phase === 'done' ? 'bg-nimoura-success' : 'bg-nimoura-primary hover:opacity-90'"
          @click="add"
        >
          <svg v-if="phase === 'done'" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
          {{ phase === 'adding' ? 'در حال افزودن…' : phase === 'done' ? 'به سبد اضافه شد' : 'افزودن به سبد خرید' }}
        </button>

        <p v-if="phase === 'error'" class="text-center text-xs text-red-600" role="alert">{{ errorMsg }}</p>
        <p v-else-if="inCart > 0" class="text-center text-xs text-nimoura-text-600">
          {{ inCart.toLocaleString('fa-IR') }} عدد از این محصول در سبد شماست
        </p>

        <div class="flex items-center justify-between gap-3 pt-1 text-xs">
          <NuxtLink :to="SHOP_ROUTES.product(p.slug)" class="text-nimoura-text-600 underline underline-offset-4 hover:text-nimoura-primary">
            مشاهده صفحه کامل
          </NuxtLink>
          <NuxtLink v-if="count > 0" :to="SHOP_ROUTES.checkout" class="font-medium text-nimoura-primary">
            رفتن به صندوق ({{ count.toLocaleString('fa-IR') }})
          </NuxtLink>
        </div>
      </div>
    </section>
  </Transition>
</template>
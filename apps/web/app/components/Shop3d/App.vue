<!-- app/components/shop3d/App.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onErrorCaptured, onMounted, ref } from 'vue'
import { NeutralToneMapping, NoToneMapping } from 'three'

const route = useRoute()
const router = useRouter()
const debug = computed(() => route.query.debug === '1')
const colliders = computed(() => route.query.colliders === '1')
const fps = computed(() => route.query.fps === '1')
const perfHud = computed(() => route.query.perf === '1')

const theme = getTheme3D()
const quality = useShopQuality()
const perf = useShopPerf()
const loading = useShopLoading()
const { sceneReady, done } = loading
const catalog = useShopCatalog()
const { status: catalogStatus } = catalog
const shopCart = useShopCart()
const cartStore: any = useCartStore()
const { selectedIndex } = useShopInteraction()

useShop3dDeepLink()
useShop3dTracking()
useShop3dE2E()

const webglOk = route.query.force3d === '1' || evaluateSupport().ok

const dpr = computed(() =>
  Math.max(0.6, Math.min(window.devicePixelRatio || 1, quality.dpr) * perf.scale.value),
)

const showJoystick = matchMedia('(pointer: coarse)').matches || route.query.joystick === '1'

// backdrop-blur روی بوم متحرک گران است؛ فقط روی کیفیت بالا یا با ?blur=1
const blurOn = route.query.blur === '1' ? true : route.query.blur === '0' ? false : quality.tier === 'high'

perf.hud.value = perfHud.value
catalog.load()

onMounted(() => {
  cartStore.initGuest()
  shopCart.refresh()
})

onBeforeUnmount(() => {
  loading.reset()
  perf.reset()
  perf.hud.value = false
})

/* ---------- خطای غیرقابل‌بازیابی ---------- */
const fatal = ref(false)
let errorCount = 0
onErrorCaptured((err) => {
  errorCount++
  shopTrack('shop3d_error', { kind: 'vue', message: String((err as Error)?.message ?? err).slice(0, 100) })
  if (errorCount >= 3) fatal.value = true
  // برنمی‌گردانیم false: خطا به handler سراسری (Sentry) هم می‌رسد
})

/* ---------- ناوبری ---------- */
function goBack() {
  const prev = (router.options.history.state as { back?: string | null }).back
  if (prev && !prev.startsWith('/store-3d')) router.back()
  else navigateTo('/')
}

function reloadLite() {
  saveQuality('low', 1)
  const url = new URL(location.href)
  url.searchParams.delete('quality')
  location.replace(url.toString())
}
function dismissSuggest() {
  perf.suggest.value = null
  perf.stopped.value = true
}

/* ---------- گزارش دستگاه (برای تست روی گوشی‌های واقعی) ---------- */
const copied = ref(false)
async function copyReport() {
  const s = evaluateSupport()
  const text = JSON.stringify(
    {
      time: new Date().toISOString(),
      url: location.href,
      ua: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      viewport: `${innerWidth}x${innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      gpu: s.ok ? s.profile.renderer : s.reason,
      cores: s.ok ? s.profile.cores : null,
      memoryGB: s.ok ? s.profile.memory : null,
      tier: quality.tier,
      fps: perf.fps.value,
      calls: perf.calls.value,
      tris: perf.tris.value,
      textures: perf.textures.value,
      canvas: perf.canvasPx.value,
      dprScale: perf.scale.value,
      blur: blurOn,
      atlas: loading.atlas.value,
    },
    null,
    2,
  )
  let ok = false
  try {
    await navigator.clipboard.writeText(text)
    ok = true
  } catch {
    // روی http (مثل IP شبکه محلی) clipboard API وجود ندارد
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
  }
  copied.value = ok
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-nimoura-velvet" :class="{ 'shop3d-noblur': !blurOn }">
    <template v-if="webglOk">
      <TresCanvas
        :clear-color="theme.derived.background"
        :tone-mapping="quality.bloom ? NoToneMapping : NeutralToneMapping"
        :dpr="dpr"
        :antialias="quality.antialias"
        :power-preference="quality.tier === 'low' ? 'default' : 'high-performance'"
        @ready="sceneReady = true"
      >
        <Shop3dScene :debug="debug" :colliders="colliders" :fps="fps" />
      </TresCanvas>

      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(59_47_69/0.4)_100%)]"
      />

      <button
        type="button"
        class="absolute top-4 right-4 z-10 rounded-full bg-nimoura-base/90 px-4 py-2 text-sm text-nimoura-text-800 shadow-lg backdrop-blur transition hover:bg-nimoura-base"
        @click="goBack"
      >
        بازگشت به نمای ساده
      </button>

      <template v-if="done && !debug">
        <Shop3dZoneMenu v-if="selectedIndex === null" />
        <LazyShop3dJoystick v-if="showJoystick && selectedIndex === null" />

        <Shop3dSideControls />
        <Shop3dProductTooltip />
        <Shop3dProductCard />
        <Shop3dMiniCart />
        <Shop3dOnboarding />
      </template>

      <div
        v-if="catalogStatus === 'error'"
        class="absolute top-[11.5rem] right-4 z-10 flex items-center gap-3 rounded-full bg-nimoura-velvet/80 px-4 py-2 text-xs text-nimoura-base backdrop-blur"
      >
        <span>بارگذاری محصولات ناموفق بود</span>
        <button type="button" class="rounded-full bg-nimoura-primary px-3 py-1 text-white" @click="reloadNuxtApp()">
          تلاش دوباره
        </button>
      </div>

      <div
        v-if="perf.suggest.value && selectedIndex === null && !perf.contextLost.value"
        dir="rtl"
        class="absolute inset-x-3 bottom-[5.5rem] z-20 mx-auto max-w-sm rounded-2xl bg-nimoura-velvet/90 p-4 text-center text-nimoura-base shadow-2xl backdrop-blur"
      >
        <template v-if="perf.suggest.value === 'lite'">
          <p class="text-sm leading-6">به نظر می‌رسد مغازه روی دستگاه شما کمی کند است. حالت سبک را امتحان می‌کنید؟</p>
          <div class="mt-3 flex justify-center gap-2 text-xs">
            <button type="button" class="rounded-full bg-nimoura-primary px-4 py-2 text-white" @click="reloadLite">حالت سبک</button>
            <button type="button" class="rounded-full border border-white/30 px-4 py-2" @click="dismissSuggest">نه، ممنون</button>
          </div>
        </template>
        <template v-else>
          <p class="text-sm leading-6">نمایش سه‌بعدی روی این دستگاه روان نیست. نسخه ساده فروشگاه سریع‌تر است.</p>
          <div class="mt-3 flex justify-center gap-2 text-xs">
            <NuxtLink to="/" class="rounded-full bg-nimoura-primary px-4 py-2 text-white">رفتن به نسخه ساده</NuxtLink>
            <button type="button" class="rounded-full border border-white/30 px-4 py-2" @click="dismissSuggest">ادامه می‌دهم</button>
          </div>
        </template>
      </div>

      <div
        v-if="perf.contextLost.value"
        dir="rtl"
        class="absolute inset-0 z-50 grid place-items-center bg-nimoura-velvet/95 p-6 text-center text-nimoura-base"
      >
        <div class="space-y-4">
          <p class="text-base leading-7">ارتباط با کارت گرافیک قطع شد (معمولاً به‌خاطر کمبود حافظه).</p>
          <div class="flex justify-center gap-3 text-sm">
            <button type="button" class="rounded-full bg-nimoura-primary px-5 py-2 text-white" @click="reloadLite">تلاش دوباره با کیفیت کم</button>
            <NuxtLink to="/" class="rounded-full border border-white/30 px-5 py-2">نسخه ساده</NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-if="fatal"
        dir="rtl"
        class="absolute inset-0 z-[60] grid place-items-center bg-nimoura-velvet p-6 text-center text-nimoura-base"
      >
        <div class="space-y-4">
          <p class="text-base leading-7">مشکلی در نمایش مغازه سه‌بعدی پیش آمد.</p>
          <div class="flex justify-center gap-3 text-sm">
            <button type="button" class="rounded-full bg-nimoura-primary px-5 py-2 text-white" @click="reloadLite">تلاش دوباره (حالت سبک)</button>
            <NuxtLink to="/" class="rounded-full border border-white/30 px-5 py-2">نسخه ساده</NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-if="perfHud || debug"
        class="absolute top-[4.5rem] left-4 z-[15] flex flex-col items-start gap-1"
      >
        <pre
          class="pointer-events-none rounded bg-black/70 px-2 py-1 font-mono text-[11px] leading-4 text-white"
        >tier {{ quality.tier }} · bloom {{ quality.bloom }} · blur {{ blurOn }}
fps {{ perf.fps.value }} · calls {{ perf.calls.value }} · tris {{ perf.tris.value }}
canvas {{ perf.canvasPx.value }} · dpr×{{ perf.scale.value }} · tex {{ perf.textures.value }}
atlas {{ loading.atlas.value.done }}/{{ loading.atlas.value.total }}</pre>
        <button type="button" class="rounded bg-black/70 px-2 py-1 text-[11px] text-white" @click="copyReport">
          {{ copied ? 'کپی شد ✓' : 'کپی گزارش' }}
        </button>
      </div>

      <Shop3dLoader />
    </template>

    <div v-else class="grid h-full place-items-center p-6 text-center text-nimoura-base">
      <div class="space-y-4">
        <p class="text-lg">مرورگر شما از نمایش سه‌بعدی پشتیبانی نمی‌کند.</p>
        <NuxtLink to="/" class="inline-block rounded-full bg-nimoura-primary px-6 py-2">رفتن به فروشگاه</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
.shop3d-noblur [class*='backdrop-blur'] {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}
</style>
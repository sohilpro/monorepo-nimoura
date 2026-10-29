// app/composables/useShop3dTracking.ts
import { onBeforeUnmount, onMounted, watch } from 'vue'

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

export function useShop3dTracking() {
  const route = useRoute()
  const loading = useShopLoading()
  const catalog = useShopCatalog()
  const fx = useShopInteraction()
  const ctl = useShopControls()
  const perf = useShopPerf()
  const q = useShopQuality()
  const cart = useShopCart()
  const t0 = performance.now()
  let sent = false

  const productPrefix = SHOP_ROUTES.product('')

  function onClick(e: MouseEvent) {
    const href = (e.target as Element | null)?.closest?.('a[href]')?.getAttribute('href')
    if (!href) return
    if (href.startsWith(SHOP_ROUTES.checkout)) {
      shopTrack('shop3d_checkout_click', { cart_items: cart.count.value, value: cart.total.value })
    } else if (href.startsWith(SHOP_ROUTES.cart)) {
      shopTrack('shop3d_cart_click', { cart_items: cart.count.value })
    } else if (href.startsWith(productPrefix)) {
      shopTrack('shop3d_open_product_page', { product_slug: href.slice(productPrefix.length) })
    }
  }

  function summary() {
    if (sent) return
    sent = true
    shopTrack('shop3d_session', {
      duration_s: Math.round((performance.now() - t0) / 1000),
      fps_last: perf.fps.value,
      dpr_scale: perf.scale.value,
      ready: loading.done.value,
    })
  }

  watch(loading.done, (d) => {
    if (d) {
      shopTrack('shop3d_ready', {
        load_ms: Math.round(performance.now() - t0),
        products: catalog.instances.value.length,
      })
    }
  })

  watch(() => fx.selectedIndex.value, (i) => {
    if (i === null) return
    const x = catalog.instances.value[i]
    if (!x) return
    shopTrack('shop3d_product_view', {
      product_id: x.product.id,
      product_slug: x.product.slug,
      value: x.product.finalPrice,
      available: x.product.available,
      where: x.placement.zone,
    })
  })

  watch(() => ctl.request.value, (r) => {
    if (r) shopTrack('shop3d_zone', { zone: r.id })
  })

  watch(catalog.status, (s) => {
    if (s === 'error') shopReportError(new Error(catalog.error.value ?? 'catalog load failed'))
  })

  onMounted(() => {
    const s = evaluateSupport()
    shopSetContext({
      tier: q.tier,
      gpu: s.ok ? s.profile.renderer : s.reason,
      mobile: s.ok ? s.profile.mobile : false,
    })
    shopTrack('shop3d_enter', {
      entry_from: str(route.query.from) ?? 'direct',
      zone: str(route.query.zone),
      product_slug: str(route.query.product),
    })
    document.addEventListener('click', onClick, true)
    window.addEventListener('pagehide', summary)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onClick, true)
    window.removeEventListener('pagehide', summary)
    summary()
    shopSetContext(null)
  })
}
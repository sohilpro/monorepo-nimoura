// app/composables/useShop3dDeepLink.ts
import { computed, watch } from 'vue'
import type { ViewId } from '~/utils/storeLayout'

export function useShop3dDeepLink() {
  const route = useRoute()
  const loading = useShopLoading()
  const catalog = useShopCatalog()
  const controls = useShopControls()
  const fx = useShopInteraction()
  let handled = false

  const zone = computed<ViewId | null>(() => {
    const z = route.query.zone
    return typeof z === 'string' && VIEWPOINTS.some((v) => v.id === z) ? (z as ViewId) : null
  })
  const slug = computed(() => (typeof route.query.product === 'string' ? route.query.product : null))

  watch(
    [loading.done, catalog.instances, catalog.status],
    () => {
      if (handled || !loading.done.value) return

      if (slug.value) {
        const list = catalog.instances.value
        // هنوز چیدمان آماده نیست؛ صبر کن (مگر اینکه دریافت محصولات شکست خورده باشد)
        if (!list.length && catalog.status.value !== 'error') return
        const i = list.findIndex((x) => x.product.slug === slug.value)
        handled = true
        if (i >= 0) {
          const { pos, rotY } = list[i]!.placement
          setTimeout(() => fx.select(i, pos, rotY), 500)
          return
        }
      }

      handled = true
      if (zone.value && zone.value !== 'entrance') {
        const z = zone.value
        setTimeout(() => controls.goTo(z), 400)
      }
    },
    { immediate: true },
  )
}
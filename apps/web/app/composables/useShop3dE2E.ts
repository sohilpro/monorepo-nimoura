// app/composables/useShop3dE2E.ts
import { onBeforeUnmount, onMounted } from 'vue'

export function useShop3dE2E() {
  if (useRoute().query.e2e !== '1') return

  const catalog = useShopCatalog()
  const loading = useShopLoading()
  const fx = useShopInteraction()
  const ctl = useShopControls()

  onMounted(() => {
    ;(window as any).__shop3d = {
      get ready() { return loading.done.value && catalog.instances.value.length > 0 },
      get instances() { return catalog.instances.value.length },
      get zone() { return ctl.activeZone.value },
      get selected() {
        const i = fx.selectedIndex.value
        return i === null ? null : (catalog.instances.value[i]?.product.slug ?? null)
      },
      selectBySlug(slug: string) {
        const i = catalog.instances.value.findIndex((x) => x.product.slug === slug)
        if (i < 0) throw new Error(`product not placed: ${slug}`)
        const { pos, rotY } = catalog.instances.value[i]!.placement
        fx.select(i, pos, rotY)
      },
    }
  })
  onBeforeUnmount(() => { delete (window as any).__shop3d })
}
import { breakpointsTailwind } from '@vueuse/core'
import type { BannerDevice } from '#shared/types/banners'

function detectFromUA(ua = ''): BannerDevice {
  if (/ipad|tablet/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'tablet'
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * SSR-safe: روی سرور از User-Agent حدس می‌زند (بدون hydration mismatch)،
 * بعد از mount بر اساس عرض واقعی صفحه اصلاح می‌شود.
 */
export function useBannerDevice() {
  const device = useState<BannerDevice>('banner-device', () =>
    detectFromUA(
      useRequestHeaders(['user-agent'])['user-agent'] ??
        (import.meta.client ? navigator.userAgent : ''),
    ),
  )

  if (import.meta.client) {
    const bp = useBreakpoints(breakpointsTailwind)
    const byWidth = computed<BannerDevice>(() =>
      bp.smaller('md').value ? 'mobile' : bp.smaller('lg').value ? 'tablet' : 'desktop',
    )
    onMounted(() => {
      watch(byWidth, (v) => (device.value = v), { immediate: true })
    })
  }

  return device
}
// app/plugins/shop3d-fallback-track.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const q = new URLSearchParams(location.search)
    if (q.get('from') === '3d' && q.get('reason')) {
      shopTrack('shop3d_fallback', { reason: q.get('reason') })
    }
  })
})
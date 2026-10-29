// composables/useIsMobile.ts
export const useIsMobile = () => {
  const headers = useRequestHeaders(['user-agent'])
  const ua = headers['user-agent'] ?? ''
  
  const isMobileSSR = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  
  const isMobile = ref(isMobileSSR)
  
  onMounted(() => {
    // بعد از mount هم آپدیت میکنه تا دقیق باشه
    isMobile.value = window.innerWidth < 768
    
    const check = () => { isMobile.value = window.innerWidth < 768 }
    window.addEventListener('resize', check)
    onUnmounted(() => window.removeEventListener('resize', check))
  })
  
  return isMobile
}
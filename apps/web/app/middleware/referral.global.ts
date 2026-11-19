export default defineNuxtRouteMiddleware((to) => {
  const ref = to.query.ref;
  if (typeof ref === 'string' && ref.trim()) {
    const cleanRef = ref.trim().toUpperCase();
    const cookie = useCookie('nimoura_ref', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    cookie.value = cleanRef;

    if (import.meta.client) {
      try {
        localStorage.setItem('nimoura_ref', cleanRef);
      } catch {
        // ignore localStorage errors (e.g. private mode)
      }
    }
  }
});

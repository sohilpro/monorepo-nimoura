// app/plugins/sentry-global.client.ts
import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin((nuxtApp) => {
  const dsn = useRuntimeConfig().public.sentryDsn as string;
  if (!dsn) return;
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: useRuntimeConfig().public.sentryDsn as string, // DSN از GlitchTip
    tracesSampleRate: 0, // GlitchTip فقط خطا را خوب پشتیبانی می‌کند
    ignoreErrors: ["ResizeObserver loop"],
  });
  (window as any).Sentry = Sentry; // برای shopMonitor.ts
});

// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: {
        dir: "rtl",
        lang: "fa",
      },
    },
  },

  runtimeConfig: {
    apiBase:
      process.env.NUXT_ADMIN_API_BASE ||
      "http://localhost:4000/api/v1/admin",
    public: {
      apiBasePublic:
        process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1",
      PRIMEUI_LICENSE: process.env.NUXT_PUBLIC_PRIMEUI_LICENSE,
    },
  },

  modules: ["@vueuse/nuxt", "@primevue/nuxt-module"],

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: "light",
        },
      },
    },
  },

  

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["~/assets/css/tailwind.css"],
});

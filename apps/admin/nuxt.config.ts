// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { nimouraThemePreset } from "@nimoura/ui";

const MyCustomTheme = definePreset(Aura, nimouraThemePreset);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: false,

  routeRules: {
    "/**": {
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
  },

  app: {
    head: {
      htmlAttrs: {
        dir: "rtl",
        lang: "fa",
      },
      meta: [
        { name: "robots", content: "noindex, nofollow" },
      ],
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
        preset: MyCustomTheme,
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

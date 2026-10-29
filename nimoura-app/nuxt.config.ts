// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

const MyCustomTheme = definePreset(Aura, {
  semantic: {
    nimoura: {
      50: "#fbf4f5",
      100: "#f5e4e6",
      200: "#eccad0",
      300: "#e0a7b1",
      400: "#ce7f8d",
      500: "#b76e79",
      600: "#a15661",
      700: "#87444f",
      800: "#713a43",
      900: "#5e333a",
      950: "#341a1e",
    },
  },
});

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        dir: "rtl",
        lang: "fa",
      },
      title: "Nimoura | فروشگاه لوازم آرایشی و زیبایی",
      script: [
        {
          src: "https://www.zarinpal.com/webservice/TrustCode",
          type: "text/javascript",
          defer: true,
          tagPosition: "bodyClose",
        },
      ],

      link: [
        // ICO fallback
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
          sizes: "16x16 32x32",
        },

        // PNG favicons
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/logo/favicon_16x16.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/logo/favicon_32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "48x48",
          href: "/logo/favicon_48x48.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "64x64",
          href: "/logo/favicon_64x64.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "128x128",
          href: "/logo/favicon_128x128.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/logo/favicon_192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "256x256",
          href: "/logo/favicon_256x256.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/logo/favicon_512x512.png",
        },

        // iOS / iPadOS
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/logo/favicon_180x180.png",
        },
      ],
      meta: [
        // رنگ نوار آدرس موبایل (اختیاری)
        { name: "theme-color", content: "#f2d3c6" },
        {
          name: "description",
          content:
            "خرید بهترین محصولات آرایشی و مراقبتی پوست و مو از Nimoura. کیفیت بالا، ارسال سریع و ضمانت اصالت کالا.",
        },

        // Open Graph
        {
          property: "og:title",
          content: "Nimoura | فروشگاه لوازم آرایشی و زیبایی",
        },
        {
          property: "og:description",
          content:
            "خرید بهترین محصولات آرایشی و مراقبتی پوست و مو از Nimoura. کیفیت بالا، ارسال سریع و ضمانت اصالت کالا.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://nimoura.shop/" },
        { property: "og:image", content: "https://nimoura.shop/og-image.png" },
        { property: "og:site_name", content: "Nimoura" },
        { property: "og:locale", content: "fa_IR" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Nimoura | فروشگاه لوازم آرایشی و زیبایی",
        },
        {
          name: "twitter:description",
          content:
            "خرید بهترین محصولات آرایشی و مراقبتی پوست و مو از Nimoura. کیفیت بالا، ارسال سریع و ضمانت اصالت کالا.",
        },
        { name: "twitter:image", content: "https://nimoura.shop/og-image.png" },
        { name: "twitter:site", content: "@nimoura" },
      ],
    },
  },

  runtimeConfig: {
    torobUsername: "nimoura.shop",
    torobPassword: "QvdutPk3lWYlSFo6",
    torobClientId: "38377785",
    torobClientSecret:
      "ReaGAkIiR06TGUWJbgeU8lvb2zaagdnFVXHnR8zOpFzRPN2JKfKZuY8so9TqkGCo",
    apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1",
    public: {
      baseURL: "https://nimoura.shop",
      shop3dMode: "off", // off | admin | percent | all
      shop3dPercent: 0, // فقط برای حالت percent
      sentryDsn: "",
    },
  },

  css: ["./app/assets/css/main.css"],
  modules: [
    "@primevue/nuxt-module",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@pinia/nuxt",
    "@tresjs/nuxt",
  ],

  primevue: {
    options: {
      theme: {
        preset: MyCustomTheme,
        options: {
          darkModeSelector: "light",
        },
      },
    },
    // usePrimeVue: false,
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "embla-carousel-vue",
        "embla-carousel-autoplay",
        "embla-carousel-auto-scroll",
      ],
    },
    plugins: [tailwindcss()],
  },

  tres: {
    devtools: true, // پنل دیباگ TresJS در Nuxt DevTools
    glsl: false,
  },

  nitro: {
    minify: false, // کاهش مصرف حافظه در مرحله Nitro
    sourceMap: false,
  },
  sourcemap: { server: false, client: false },

  routeRules: {
    // HTML این صفحه به MODE وابسته است (robots، ریدایرکت)؛ نباید در CDN یا مرورگر کش شود
    "/store-3d": { headers: { "cache-control": "no-cache" } },
    "/og/**": { headers: { "cache-control": "public, max-age=86400" } },
  },
});

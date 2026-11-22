// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { nimouraThemePreset } from "../../packages/ui/src";
import { config as dotenvConfig } from "dotenv";

// بارگذاری فایل .env از ریشه مونو‌ریپو
dotenvConfig({ path: resolve(process.cwd(), "../../.env") });
dotenvConfig({ path: resolve(process.cwd(), ".env") });

const MyCustomTheme = definePreset(Aura, nimouraThemePreset);

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    port: 3000,
  },

  alias: {
    "@nimoura/ui": fileURLToPath(
      new URL("../../packages/ui/src", import.meta.url),
    ),
    "@nimoura/utils": fileURLToPath(
      new URL("../../packages/utils/src", import.meta.url),
    ),
    "@nimoura/shared-types": fileURLToPath(
      new URL("../../packages/shared-types/src", import.meta.url),
    ),
  },
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
        { property: "og:url", content: "https://nimoura.ir/" },
        { property: "og:image", content: "https://nimoura.ir/og-image.png" },
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
        { name: "twitter:image", content: "https://nimoura.ir/og-image.png" },
        { name: "twitter:site", content: "@nimoura" },
      ],
    },
  },

  runtimeConfig: {
    torobUsername: process.env.TOROB_USERNAME || "",
    torobPassword: process.env.TOROB_PASSWORD || "",
    torobClientId: process.env.TOROB_CLIENT_ID || "",
    torobClientSecret: process.env.TOROB_CLIENT_SECRET || "",

    // سرو یا پروکسی تصاویر آپلودی بکند از طریق /uploads/** در همین دامنه
    uploads: {
      // مسیر پوشه uploads روی دیسک (در داکر به volume مشترک بکند مپ میشود)
      dir: process.env.NUXT_UPLOADS_DIR || "",
      // آدرس داخلی بکند برای حالت fallback (مثلاً http://api:4000)
      upstream: process.env.NUXT_UPLOADS_UPSTREAM || "",
    },

    apiBase:
      process.env.NUXT_PUBLIC_API_BASE || "https://api.nimoura.ir/api/v1",
    public: {
      baseURL: "https://nimoura.ir",
      shop3dMode: "off", // off | admin | percent | all
      shop3dPercent: 0, // فقط برای حالت percent
      sentryDsn: "",
    },
  },

  css: ["~/assets/css/main.css"],
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
          darkModeSelector: "none",
        },
      },
    },
    // usePrimeVue: false,
  },
  vite: {
    optimizeDeps: {
      include: [
        "@tresjs/cientos",
        "@tresjs/post-processing",
        "postprocessing",
        "three",
        "three/examples/jsm/environments/RoomEnvironment.js",
        "three/examples/jsm/utils/BufferGeometryUtils.js",
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
    // Semi-static pages (SWR cache)
    "/": { swr: 3600 },
    "/return-policy": { swr: 3600 },
    "/shipping-pay": { swr: 3600 },
    "/rules": { swr: 3600 },
    "/categories/**": { swr: 1800 },
    "/brand/**": { swr: 1800 },
    "/products/**": { swr: 1800 },
    // Product pages (SSR)
    "/product/**": { ssr: true },
    // Private / User account & Checkout (SPA mode, noindex)
    "/profile/**": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/cart/**": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/auth/**": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    "/register": { redirect: { to: "/auth", statusCode: 301 } },
    "/register/**": { redirect: { to: "/auth", statusCode: 301 } },
    "/payment/**": {
      ssr: false,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    },
    // Store 3D & OG
    "/store-3d": { headers: { "cache-control": "no-cache" } },
    "/og/**": { headers: { "cache-control": "public, max-age=86400" } },
  },
});

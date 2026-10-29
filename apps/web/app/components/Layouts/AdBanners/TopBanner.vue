<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { ref, onMounted } from 'vue'

// 1. تعریف متغیر متصل به لوکال استوریج
// پارامتر اول: نام کلید در حافظه مرورگر
// پارامتر دوم: مقدار پیش‌فرض (یعنی بسته نشده = false)
const isClosed = useLocalStorage('shipping-banner-v2', false)

// 2. حل مشکل Hydration Mismatch در Nuxt (SSR)
// چون سرور به لوکال استوریج دسترسی ندارد، ممکن است سرور بگوید "نمایش بده"
// اما کلاینت بگوید "مخفی کن". برای جلوگیری از ارور، صبر می‌کنیم تا کامپوننت ماونت شود.
const isReady = ref(false)

onMounted(() => {
  isReady.value = true
})

// تابع بستن بنر
const closeBanner = () => {
  // به محض اینکه این مقدار true شود، در لوکال استوریج هم ذخیره می‌شود
  isClosed.value = true
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div
      v-if="isReady && !isClosed"
      class="top-0 left-0 right-0 bg-slate-900 text-white shadow-lg"
   
    >
      <div class="container mx-auto px-4 h-12 flex items-center justify-between sm:justify-center relative">
        
        <div class="flex items-center gap-x-2 text-sm font-medium">
          <span class="text-xl animate-pulse">🎉</span>
          <p>
            خرید بالای
            <span class="font-bold text-emerald-400 text-base mx-1">۲ میلیون تومان</span>
            ارسال رایگان است
          </p>
        </div>

        <button
          @click="closeBanner"
          type="button"
          class="sm:absolute sm:left-4 text-slate-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200"
          aria-label="بستن"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

      </div>
    </div>
  </Transition>
</template>
<template>
  <div
    class="relative w-full h-16 bg-linear-to-r from-pink-600 via-purple-600 to-indigo-700 flex items-center px-4 shadow-md z-50"
    dir="rtl"
  >
    <div
      class="mx-auto w-full flex items-center justify-center text-white text-sm md:text-base font-medium truncate leading-tight"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5 ml-2 text-yellow-300 animate-pulse hidden sm:block"
      >
        <path
          fill-rule="evenodd"
          d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z"
          clip-rule="evenodd"
        />
      </svg>

      <span> فقط برای خریدهای نقدی: ۱۵٪ تخفیف ویژه! با کد: </span>

      <button
        @click="copyToClipboard"
        class="flex items-center justify-center mr-1 px-3 py-1 rounded-full font-bold border tracking-wider transition-all duration-300 shadow-sm min-w-[80px]"
        :class="[
          isCopied
            ? 'bg-green-500 text-white border-green-400 scale-105'
            : 'bg-white/20 text-white border-white/30 hover:bg-white/30 cursor-pointer',
        ]"
        :title="isCopied ? 'کپی شد' : 'برای کپی کلیک کنید'"
      >
        <svg
          v-if="isCopied"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-4 h-4 ml-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>

        {{ isCopied ? "کپی شد" : discountCode }}
      </button>
    </div>
  </div>
</template>

<script setup>
const discountCode = "OFF15";

const isCopied = ref(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(discountCode).then(() => {
    isCopied.value = true;

    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  });
};
</script>

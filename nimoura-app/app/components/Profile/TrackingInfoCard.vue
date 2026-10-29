<template>
  <div 
    v-if="trackingCode" 
    class="w-full rounded-xl border-2 p-4 sm:p-6 transition-all duration-300 mb-6"
    :class="theme.container"
    dir="rtl"
  >
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-full shrink-0" :class="theme.iconBg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="theme.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        
        <div>
          <h3 class="font-bold text-lg" :class="theme.title">
            ارسال شده توسط {{ carrierName }}
          </h3>
          <p class="text-sm opacity-80 mt-1" :class="theme.text">
            کد رهگیری: <span class="font-mono text-base font-bold select-all">{{ trackingCode }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        
        <button 
          @click="copyToClipboard" 
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
          :class="theme.secondaryBtn"
        >
          <span v-if="copied">کپی شد!</span>
          <span v-else>کپی کد</span>
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <a 
          :href="trackingLink" 
          target="_blank"
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors text-white"
          :class="theme.primaryBtn"
        >
          رهگیری مرسوله
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  trackingCode: {
    type: String,
    default: ''
  },
  // ورودی تعیین کننده روش ارسال: 'post' یا 'tipax'
  carrier: {
    type: String,
    default: 'post' // پیش‌فرض پست باشد
  }
});

const copied = ref(false);

// تنظیمات ظاهری بر اساس ورودی
const theme = computed(() => {
  if (props.carrier === 'tipax') {
    // تم سبز (تیپاکس)
    return {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconBg: 'bg-white',
      iconColor: 'text-emerald-500',
      title: 'text-emerald-800',
      text: 'text-emerald-700',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700',
      secondaryBtn: 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100'
    };
  } else {
    // تم زرد (پست پیشتاز)
    return {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      iconBg: 'bg-white',
      iconColor: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      primaryBtn: 'bg-yellow-500 hover:bg-yellow-600',
      secondaryBtn: 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100'
    };
  }
});

const carrierName = computed(() => {
  return props.carrier === 'tipax' ? 'تیپاکس' : 'پست پیشتاز';
});

// لینک هوشمند بر اساس روش ارسال
const trackingLink = computed(() => {
  if (props.carrier === 'tipax') {
    return `https://tipaxco.com/tracking?id=${props.trackingCode}`;
  } else {
    return `https://tracking.post.ir/?id=${props.trackingCode}`;
  }
});

// تابع کپی کردن کد
const copyToClipboard = () => {
  if (!props.trackingCode) return;
  navigator.clipboard.writeText(props.trackingCode);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>
<template>
  <div
    v-if="trackingCode"
    class="mb-6 w-full rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] transition-all duration-300 sm:p-6"
    :class="theme.container"
    dir="rtl"
  >
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex items-center gap-4">
        <div class="flex size-12 shrink-0 items-center justify-center rounded-full" :class="theme.iconBg">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" :class="theme.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <div>
          <h3 class="text-lg font-bold" :class="theme.title">ارسال شده توسط {{ carrierName }}</h3>
          <p class="mt-1 text-sm opacity-80" :class="theme.text">
            کد رهگیری: <span class="font-mono text-base font-bold select-all">{{ trackingCode }}</span>
          </p>
        </div>
      </div>

      <div class="flex w-full items-center gap-2 sm:w-auto">
        <Button
          type="button"
          size="small"
          outlined
          class="!flex-1 !rounded-xl !bg-white !px-4 !py-2 !text-sm !font-medium sm:!flex-none"
          :class="theme.secondaryBtn"
          @click="copyToClipboard"
        >
          <span v-if="copied">کپی شد!</span>
          <span v-else>کپی کد</span>
          <i v-if="!copied" class="pi pi-copy text-sm" />
        </Button>

        <a
          :href="trackingLink"
          target="_blank"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors sm:flex-none"
          :class="theme.primaryBtn"
        >
          رهگیری مرسوله
          <i class="pi pi-external-link text-sm" />
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
    default: 'post' // پیشفرض پست باشد
  }
});

const copied = ref(false);

// تم بر اساس روش ارسال — همه از پالت Nimoura
const theme = computed(() => {
  if (props.carrier === 'tipax') {
    return {
      container: 'border-nimoura-success/30',
      iconBg: 'bg-white',
      iconColor: 'text-nimoura-success',
      title: 'text-nimoura-success',
      text: 'text-nimoura-text-600',
      primaryBtn: 'bg-nimoura-success hover:bg-nimoura-600',
      secondaryBtn: '!border-nimoura-success/30 !text-nimoura-success hover:!bg-nimoura-success/10'
    };
  }
  return {
    container: 'border-nimoura-warning/30',
    iconBg: 'bg-white',
    iconColor: 'text-nimoura-warning',
    title: 'text-nimoura-text-800',
    text: 'text-nimoura-text-600',
    primaryBtn: 'bg-nimoura-primary hover:bg-nimoura-600',
    secondaryBtn: '!border-nimoura-primary/30 !text-nimoura-primary hover:!bg-nimoura-primary/10'
  };
});

const carrierName = computed(() => {
  return props.carrier === 'tipax' ? 'تیپاکس' : 'پست پیشتاز';
});

// لینک هوشمند بر اساس روش ارسال
const trackingLink = computed(() => {
  if (props.carrier === 'tipax') {
    return `https://tipaxco.com/tracking?id=${props.trackingCode}`;
  }
  return `https://tracking.post.ir/?id=${props.trackingCode}`;
});

// تابع کپی کردن کد
const copyToClipboard = () => {
  if (!props.trackingCode) return;
  navigator.clipboard.writeText(props.trackingCode);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>

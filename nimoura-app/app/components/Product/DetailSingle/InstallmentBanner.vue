<template>
  <div
    class="torobpay-widget-media torobpay-logo-light-sweep w-full items-center gap-2 lg:gap-0.5 flex bg-green-50 px-2 py-1.5 lg:hidden"
  >
    <IconsTorobPay class="w-6 h-6 torobpay-widget-image" />
    <span class="text-xs text-green-700"
      ><span class="font-modam">4</span> قسط ماهانه
      <span class="font-modam">{{ numberFormat(price / 4) }}</span> تومانی با
      ترب‌پی! (بدون کارمزد)</span
    >
  </div>
</template>

<script setup>
const { price } = defineProps({
  price: {
    default: 0,
    type: Number || String,
  },
});
</script>

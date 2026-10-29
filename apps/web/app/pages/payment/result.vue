<!-- pages/payment/result.vue -->
<template>
  <main class="container">
    <UtilsBreadCrumb :items="breadcrumbItems" />
    <PaymentResultCard :result="result" />
  </main>
</template>

<script setup lang="ts">
const breadcrumbItems = [
  { label: "صفحه اصلی", href: "/" },
  { label: "پرداخت" },
];

const { result, verify } = usePaymentResult();
onMounted(verify);
</script>
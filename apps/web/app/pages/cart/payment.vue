<template>
  <div class="container">
    <CartPayment />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "guest",
});
</script>
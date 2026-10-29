<template>
  <div class="container">
    <CartCheckout />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

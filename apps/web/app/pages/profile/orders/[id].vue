<template>
  <div>
    <ProfileOrderDetail />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
</script>
<template>
  <div>
    <ProfileAddresses />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
</script>
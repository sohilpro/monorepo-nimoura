<template>
  <div>
    <ProfileAccount />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
</script>
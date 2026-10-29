<template>
  <div>
    <ProfileAccount />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "guest",
});
</script>
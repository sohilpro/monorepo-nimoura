<template>
  <div>
    <Profile />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "guest",
});
</script>

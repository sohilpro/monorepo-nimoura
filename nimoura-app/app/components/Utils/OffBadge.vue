<template>
  <span
    class="bg-nimoura-primary/15 font-modam text-nimoura-primary text-xs font-semibold flex rounded-br-3xl items-center justify-center w-9 h-9 lg:w-10 lg:h-10"
  >
    ٪
    {{ value }}
  </span>
</template>

<script setup>
defineProps({
  value: String | Number,
});
</script>

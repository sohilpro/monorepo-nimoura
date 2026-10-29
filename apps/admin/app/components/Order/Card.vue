<template>
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">{{ title }}</div>
        <div v-if="subtitle" class="text-xs text-neutral-500 mt-0.5">
          {{ subtitle }}
        </div>
      </div>
      <slot name="actions" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string; subtitle?: string }>();
const { title, subtitle } = toRefs(props);
</script>

<style scoped>
@reference "tailwindcss";
.card {
  @apply rounded-2xl border border-neutral-200 bg-white shadow-sm;
}
.card-header {
  @apply flex items-center justify-between border-b border-neutral-100 px-4 py-3;
}
.card-title {
  @apply text-sm font-semibold text-neutral-800;
}
.card-body {
  @apply p-4;
}
</style>

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
.card {
  border-radius: 1rem;
  border: 1px solid var(--color-gray-200, #ebe0df);
  background-color: #ffffff;
  box-shadow: var(--shadow-theme-xs);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-gray-100, #f7eeec);
  padding: 0.75rem 1rem;
}
.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-800, #3a3131);
}
.card-body {
  padding: 1rem;
}
</style>

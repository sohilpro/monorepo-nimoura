<script setup lang="ts">
const props = defineProps<{
  modelValue: number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [number | null];
}>();

const { categories, fetchCategories } = useExploreCategories();

onMounted(() => {
  fetchCategories();
});

function select(id: number | null) {
  emit("update:modelValue", id);
}
</script>

<template>
  <div class="relative w-full">
    <!-- Categories -->
    <div
      class="flex w-full gap-2.5 overflow-x-auto px-4 py-3
             scroll-smooth scrollbar-hide"
    >
      <!-- همه -->
      <button
        type="button"
        class="group relative flex h-10 flex-none items-center
               justify-center rounded-full px-5
               text-sm font-medium whitespace-nowrap
               border transition-all duration-300 ease-out
               active:scale-95"
        :class="
          modelValue === null
            ? [
                'border-nimoura-primary',
                'bg-nimoura-primary',
                'text-white',
                'shadow-[0_6px_18px_rgba(183,110,121,0.22)]',
              ]
            : [
                'border-nimoura-border',
                'bg-white',
                'text-nimoura-text-700',
                'hover:border-nimoura-primary/40',
                'hover:bg-nimoura-primary/5',
                'hover:text-nimoura-primary',
              ]
        "
        @click="select(null)"
      >
        همه
      </button>

      <!-- دسته‌بندی‌ها -->
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="group relative flex h-10 flex-none items-center
               justify-center rounded-full px-5
               text-sm font-medium whitespace-nowrap
               border transition-all duration-300 ease-out
               active:scale-95"
        :class="
          modelValue === category.id
            ? [
                'border-nimoura-primary',
                'bg-nimoura-primary',
                'text-white',
                'shadow-[0_6px_18px_rgba(183,110,121,0.22)]',
              ]
            : [
                'border-nimoura-border',
                'bg-white',
                'text-nimoura-text-700',
                'hover:border-nimoura-primary/40',
                'hover:bg-nimoura-primary/5',
                'hover:text-nimoura-primary',
              ]
        "
        @click="select(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
</style>
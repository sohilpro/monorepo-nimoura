<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 xl:gap-x-5">
    <!-- SORT TITLE -->
    <div class="flex shrink-0 items-center gap-x-2">
      <svg class="size-5 text-nimoura-text-400 xl:size-6" aria-hidden="true">
        <use href="#sort-list" />
      </svg>

      <h2
        class="font-vazir text-sm font-bold text-nimoura-text-400 xl:text-base"
      >
        مرتب سازی :
      </h2>
    </div>

    <!-- SORT OPTIONS -->
    <ul class="flex flex-wrap items-center gap-x-2 gap-y-1 xl:gap-x-3">
      <li
        v-for="option in options"
        :key="option.value"
        class="cursor-pointer rounded-lg px-2 py-1 text-xs transition-all duration-200 sm:text-sm"
        :class="
          currentSort === option.value
            ? ['bg-nimoura-primary/10', 'font-semibold', 'text-nimoura-primary']
            : [
                'text-nimoura-text-500',
                'hover:bg-nimoura-text-100/60',
                'hover:text-nimoura-text-700',
              ]
        "
        @click="setSort(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface SortOption {
  label: string;
  value: string;
}

defineProps<{
  options: SortOption[];
  currentSort: string;
}>();

const emit = defineEmits<{
  "update:sort": [value: string];
}>();

function setSort(value: string) {
  emit("update:sort", value);
}
</script>

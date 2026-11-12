<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 xl:gap-x-5">
    <!-- SORT TITLE -->
    <div class="flex shrink-0 items-center gap-x-2">
      <i class="pi pi-sort-alt text-base text-nimoura-text-400" aria-hidden="true" />

      <h2
        class="font-vazir text-sm font-bold text-nimoura-text-400 xl:text-base"
      >
        مرتب‌سازی:
      </h2>
    </div>

    <!-- SORT OPTIONS -->
    <ul class="flex flex-wrap items-center gap-x-1.5 gap-y-1 xl:gap-x-2">
      <li v-for="option in options" :key="option.value">
        <Button
          :label="option.label"
          text
          size="small"
          class="!rounded-lg !px-2.5 !py-1 !text-xs sm:!text-sm transition-all duration-200"
          :class="
            currentSort === option.value
              ? '!bg-nimoura-primary/10 !font-semibold !text-nimoura-primary'
              : '!font-normal !text-nimoura-text-500 hover:!bg-nimoura-text-100/60 hover:!text-nimoura-text-700'
          "
          @click="setSort(option.value)"
        />
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

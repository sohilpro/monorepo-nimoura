<script setup lang="ts">
interface Props {
  totalPages: number;
  currentPage: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:page": [page: number];
}>();

const isMobile = useMediaQuery("(max-width: 639px)");

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const delta = isMobile.value ? 0 : 1;

  const range: (number | string)[] = [1];

  const left = current - delta;
  const right = current + delta;

  if (left > 2) {
    range.push("...");
  }

  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) {
    range.push(i);
  }

  if (right < total - 2) {
    range.push("...");
  }

  if (total > 1) {
    range.push(total - 1, total);
  }

  return [...new Set(range)];
});

function changePage(page: number | string) {
  if (
    typeof page === "number" &&
    page !== props.currentPage &&
    page >= 1 &&
    page <= props.totalPages
  ) {
    emit("update:page", page);
  }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-8 flex w-full items-center justify-center font-modam lg:mt-10"
    aria-label="صفحه‌بندی"
  >
    <ul class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      <!-- PREVIOUS -->
      <li
        class="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-nimoura-text-100 bg-white text-nimoura-text-600 shadow-sm transition-all duration-200 hover:border-nimoura-primary/30 hover:bg-nimoura-primary/5 hover:text-nimoura-primary active:scale-95 sm:size-8"
        :class="{
          'pointer-events-none opacity-40': currentPage === 1,
        }"
        @click="changePage(currentPage - 1)"
      >
        <i class="pi pi-chevron-right text-xs!" />
      </li>

      <!-- PAGES -->
      <li
        v-for="(page, i) in pages"
        :key="`${page}-${i}`"
        class="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs transition-all duration-200 sm:size-8 sm:text-sm"
        :class="
          page === '...'
            ? ['pointer-events-none', 'text-nimoura-text-300']
            : page === currentPage
              ? [
                  'cursor-default',
                  'bg-nimoura-primary',
                  'font-semibold',
                  'text-white',
                  'shadow-[0_4px_12px_rgba(183,110,121,0.20)]',
                ]
              : [
                  'cursor-pointer',
                  'border',
                  'border-nimoura-text-100',
                  'bg-white',
                  'text-nimoura-text-600',
                  'shadow-sm',
                  'hover:border-nimoura-primary/30',
                  'hover:bg-nimoura-primary/5',
                  'hover:text-nimoura-primary',
                  'active:scale-95',
                ]
        "
        @click="changePage(page)"
      >
        {{ page }}
      </li>

      <!-- NEXT -->
      <li
        class="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-nimoura-text-100 bg-white text-nimoura-text-600 shadow-sm transition-all duration-200 hover:border-nimoura-primary/30 hover:bg-nimoura-primary/5 hover:text-nimoura-primary active:scale-95 sm:size-8"
        :class="{
          'pointer-events-none opacity-40': currentPage === totalPages,
        }"
        @click="changePage(currentPage + 1)"
      >
        <i class="pi pi-chevron-left text-xs!" />
      </li>
    </ul>
  </nav>
</template>

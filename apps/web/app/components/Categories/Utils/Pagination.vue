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

function onPage(event: { page: number }) {
  const nextPage = event.page + 1;
  if (
    nextPage !== props.currentPage &&
    nextPage >= 1 &&
    nextPage <= props.totalPages
  ) {
    emit("update:page", nextPage);
  }
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-8 flex w-full items-center justify-center font-modam lg:mt-10"
    aria-label="صفحه‌بندی"
  >
    <Paginator
      :rows="1"
      :total-records="totalPages"
      :first="Math.max(0, currentPage - 1)"
      :page-link-size="isMobile ? 3 : 5"
      template="PrevPageLink PageLinks NextPageLink"
      class="nimoura-paginator !bg-transparent !p-0"
      @page="onPage"
    />
  </nav>
</template>

<style scoped>
:deep(.nimoura-paginator .p-paginator) {
  background: transparent;
  padding: 0;
  gap: 0.375rem;
}

:deep(.nimoura-paginator .p-paginator-page),
:deep(.nimoura-paginator .p-paginator-prev),
:deep(.nimoura-paginator .p-paginator-next) {
  min-width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-nimoura-text-100);
  background: white;
  color: var(--color-nimoura-text-600);
  font-size: 0.875rem;
}

:deep(.nimoura-paginator .p-paginator-page.p-paginator-page-selected) {
  background: var(--color-nimoura-primary);
  border-color: var(--color-nimoura-primary);
  color: white;
  font-weight: 600;
}
</style>

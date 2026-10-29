<script setup lang="ts">
import type { Article, PaginationMeta } from '~~/server/types/magazine';

const props = defineProps<{
  articles: Article[] | null | undefined;
  pending: boolean;
  meta?: PaginationMeta;
}>();

const emit = defineEmits<{ (e: 'page-change', page: number): void }>();

function onPageChange(event: { page: number }) {
  emit('page-change', event.page + 1);
}
</script>

<template>
  <div>
    <div v-if="pending" class="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i">
        <PSkeleton height="220px" class="mb-4 !rounded-2xl" />
        <PSkeleton width="40%" height="12px" class="mb-2" />
        <PSkeleton width="85%" class="mb-2" />
        <PSkeleton width="60%" />
      </div>
    </div>

    <div
      v-else-if="articles && articles.length"
      class="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <div v-else class="rounded-2xl border border-dashed border-nimoura-border py-16 text-center text-nimoura-text-400">
      مقاله‌ای با این مشخصات پیدا نشد.
    </div>

    <div v-if="meta && meta.totalPages > 1" class="mt-12 flex justify-center">
      <PPaginator
        :rows="meta.itemsPerPage"
        :total-records="meta.totalItems"
        :first="(meta.currentPage - 1) * meta.itemsPerPage"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

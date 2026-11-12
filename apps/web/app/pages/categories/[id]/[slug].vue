<template>
  <div />
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';

const route = useRoute();
const id = String(route.params.id || '');

const { data: catResponse, error } = await useFetch<any>(
  `/api/categories/${encodeURIComponent(id)}`,
  { key: `category-legacy-redirect-${id}` },
);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: 'دسته‌بندی مورد نظر یافت نشد',
  });
}

const category = catResponse.value?.data ?? catResponse.value;
const targetSlug = category?.slug || (category?.name ? createSlug(category.name) : String(route.params.slug || ''));

if (targetSlug) {
  await navigateTo(
    {
      path: `/categories/${encodeURIComponent(targetSlug)}`,
      query: route.query,
    },
    { redirectCode: 301 },
  );
}
</script>

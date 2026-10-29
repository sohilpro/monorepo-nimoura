<script setup lang="ts">
import type { ArticleFormPayload } from '~/composables/useAdminArticles';

const route = useRoute();
const toast = useToast();
const id = route.params.id as string;

const { data: article, pending, error } = await useAsyncData(
  `admin-article-${id}`,
  () => fetchAdminArticle(id),
);

const submitting = ref(false);

async function handleSubmit(payload: ArticleFormPayload) {
  submitting.value = true;
  try {
    await updateArticle(id, payload);
    toast.add({ severity: 'success', summary: 'ذخیره شد', detail: 'تغییرات با موفقیت ذخیره شد', life: 3000 });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: e?.data?.message || 'ذخیره تغییرات ناموفق بود',
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink to="/magazine/articles" class="text-gray-400 hover:text-nimoura-600">
        <i class="pi pi-arrow-right" />
      </NuxtLink>
      <h1 class="text-xl font-bold text-gray-800">ویرایش مقاله</h1>
    </div>

    <div v-if="pending" class="text-gray-400">در حال بارگذاری...</div>
    <div v-else-if="error" class="rounded-xl bg-red-50 p-4 text-red-600">مقاله پیدا نشد.</div>
    <MagazineArticleForm v-else :initial="article.data" :submitting="submitting" @submit="handleSubmit" />
  </div>
</template>

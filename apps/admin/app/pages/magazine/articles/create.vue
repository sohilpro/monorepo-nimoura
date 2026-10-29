<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import type { ArticleFormPayload } from '~/composables/useAdminArticles';


const toast = useToast();
const router = useRouter();
const submitting = ref(false);

async function handleSubmit(payload: ArticleFormPayload) {
  submitting.value = true;
  try {
    const article = await createArticle(payload);
    toast.add({ severity: 'success', summary: 'ذخیره شد', detail: 'مقاله با موفقیت ایجاد شد', life: 3000 });
    router.push(`/magazine/articles/${article.id}`);
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: e?.data?.message || 'ایجاد مقاله ناموفق بود',
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
      <h1 class="text-xl font-bold text-gray-800">مقاله جدید</h1>
    </div>

    <MagazineArticleForm :submitting="submitting" @submit="handleSubmit" />
  </div>
</template>

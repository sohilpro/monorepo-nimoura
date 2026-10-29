<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دسته بندی', href: '/category' },
        { label: 'ویرایش دسته بندی', href: '' },
      ]"
      title="ویرایش دسته بندی"
      subtitle="آپدیت دسته بندی در فروشگاه"
      publish-label="ویرایش دسته بندی"
      discard-label="انصراف"
      form="category-form"
      @discard="() => navigateTo('/category')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <CategoryForm
          v-model="body"
          :categories="categories.data.categories"
          :loading="isLoading"
          :onSubmit="submitForm"
        />
  
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug;
const { isLoading } = useLoading();

const { data: category }: any = await useFetch(`/api/category/getOne`, {
  query: { id },
});
const { data: categories }: any = await useFetch("/api/category/list", {
  query: {
    limit: 100
  }
});

const body = reactive({
  name: category.value.data.name,
  parentId: category.value.data?.parent?.id ?? null,
});

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/category/update`, {
      method: "PATCH",
      body,
      query: { id },
    });

    useToast().info({ message: data.data.message });
    navigateTo("/category");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "خطا در آپدیت دسته‌بندی",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

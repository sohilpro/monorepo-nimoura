<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دسته بندی', href: '/category' },
        { label: 'افزودن دسته بندی', href: '' },
      ]"
      title="ایجاد دسته بندی جدید"
      subtitle="افزودن دسته بندی به فروشگاه"
      publish-label="انتشار دسته بندی"
      discard-label="انصراف"
      form="category-form"
      @discard="() => navigateTo('/category')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <CategoryForm
          v-model="body"
          :categories="
            categories.data.categories.length !== 0
              ? categories.data.categories
              : []
          "
          :loading="isLoading"
          :onSubmit="submitForm"
        />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const body = reactive({
  name: "",
  parentId: null as number | null,
});

const { isLoading } = useLoading();
const { data: categories }: any = await useFetch("/api/category/list", {
  query: {
    limit: 100,
  },
});

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch("/api/category/create", {
      method: "POST",
      body: { ...body },
    });

    useToast().success({ message: data.data.message });
    navigateTo("/category");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "خطا در ایجاد دسته‌بندی",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

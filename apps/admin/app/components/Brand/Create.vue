<!-- pages/brand/create.vue -->
<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'برندها', href: '/brand' },
        { label: 'افزودن برند', href: '' },
      ]"
      title="ایجاد برند جدید"
      subtitle="افزودن برند جدید به فروشگاه"
      publish-label="انتشار برند"
      discard-label="انصراف"
      form="brand-form"
      @discard="() => navigateTo('/brand')"
    />

    <BrandForm
      v-model="body"
      @submit="submitForm"
    />
  </section>
</template>

<script setup lang="ts">
const toast = useToast();
const { isLoading } = useLoading();

const body = reactive({
  name: "",
  slug: "",
  logo: null as string | null,
  description: "",
  subBrands: [] as string[],
});

async function submitForm() {
  if (!body.name.trim()) {
    toast.add({
      severity: "warn",
      summary: "خطای اعتبارسنجی",
      detail: "وارد کردن نام برند الزامی است.",
      life: 3000,
    });
    return;
  }

  isLoading.value = true;
  try {
    const data: any = await $fetch("/api/product/brand/create", {
      method: "POST",
      body: { ...body },
    });

    toast.add({
      severity: "success",
      summary: "موفقیت",
      detail: data?.message || "برند با موفقیت ایجاد شد.",
      life: 3000,
    });
    
    navigateTo("/brand");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "خطا",
      detail: error?.data?.message || error?.statusMessage || "خطا در ایجاد برند رخ داده است.",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
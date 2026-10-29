<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'برند', href: '/brand' },
        { label: 'ویرایش برند', href: '' },
      ]"
      title="ویرایش برند"
      subtitle="آپدیت برند در فروشگاه"
      publish-label="ویرایش برند"
      discard-label="انصراف"
      form="brand-form"
      @discard="() => navigateTo('/brand')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <BrandForm 
          v-model="body" 
          :loading="isLoading" 
          :initial-logo-url="existingLogoUrl"
          @remove-logo="onRemoveLogo"
          @submit="submitForm" 
        />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id || route.params.slug; // پشتیبانی از هر دو نام پارامتر
const toast = useToast();
const { isLoading } = useLoading();

const body = reactive({
  name: "",
  slug: "",
  logo: null as string | null,
  description: "",
  subBrands: [] as string[],
});

const existingLogoUrl = ref<string | null>(null);

// دریافت اطلاعات برند از روت سرور ادمین
const { data: brandResponse }: any = await useFetch(`/api/brand/${id}`);

if (brandResponse?.value) {
  const brandData = brandResponse.value.data || brandResponse.value;
  
  body.name = brandData.name || "";
  body.description = brandData.description || "";
  body.logo = brandData.logo || null;
  existingLogoUrl.value = brandData.logo || null;
  body.subBrands = Array.isArray(brandData.subBrands)
    ? brandData.subBrands.map((i: any) => (typeof i === 'string' ? i : i?.name))
    : [];
}

function onRemoveLogo() {
  existingLogoUrl.value = null;
  body.logo = null;
}

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
    const data: any = await $fetch(`/api/brand/${id}`, {
      method: "PATCH",
      body: {
        name: body.name,
        logo: body.logo,
        description: body.description,
        subBrands: body.subBrands,
      },
    });

    toast.add({
      severity: "success",
      summary: "موفقیت",
      detail: data?.message || "برند با موفقیت ویرایش شد.",
      life: 3000,
    });
    
    navigateTo("/brand");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "خطا",
      detail: error?.data?.message || error?.statusMessage || "خطا در آپدیت برند رخ داده است.",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
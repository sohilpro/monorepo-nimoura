<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'تخفیف ها', href: '/promotion' },
        { label: 'ویرایش مشخصات تخفیف', href: '' },
      ]"
      title="ویرایش کد تخفیف"
      subtitle="آپدیت تخفیف"
      publish-label="ویرایش تخفیف"
      discard-label="انصراف"
      form="promo-form"
      @discard="() => navigateTo('/promotion')"
    />
    
    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <PromotionForm
          v-model="body"
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

const { data: promotion }: any = await useFetch(`/api/promotion/getOne`, {
  query: { id },
});

const body = reactive({
  title: promotion.value.data.title || "",
  description: promotion.value.data.description || "",
  type: promotion.value.data.type || "",
  amount: promotion.value.data.amount || "",
  promoCode: promotion.value.data.promoCode || "",
  startDate: promotion.value.data.startDate || "",
  endDate: promotion.value.data.endDate || "",
  isPublic: promotion.value.data.isPublic || false,
  // "productIds": ,
  // "categoryIds":
});

const { isLoading } = useLoading();
const toast = useAppToast();

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/promotion/update`, {
      method: "PUT",
      body,
      query: { id },
    });

    toast.info(data?.data?.message || "کد تخفیف با موفقیت ویرایش شد");
    navigateTo("/promotion");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || "خطا در آپدیت تخفیف");
  } finally {
    isLoading.value = false;
  }
}
</script>

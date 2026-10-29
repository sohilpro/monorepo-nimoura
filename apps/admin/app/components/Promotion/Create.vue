<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'تخفیف ها', href: '/promotion' },
        { label: 'افزودن تخفیف', href: '' },
      ]"
      title="ایجاد کد تخفیف جدید"
      subtitle="افزودن تخفیف به فروشگاه"
      publish-label="انتشار تخفیف"
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
const body = reactive({
  title: "",
  description: "",
  type: "",
  amount: 0,
  promoCode: "",
  startDate: "",
  endDate: "",
  isPublic: true,
  // "productIds": ,
  // "categoryIds":
});

const { isLoading } = useLoading();

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch("/api/promotion/create", {
      method: "POST",
      body,
    });
    useToast().success({
      message: data.data.message || "کد تخفیف با موفقیت ایجاد شد.",
    });
    navigateTo("/promotion");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "خطا در ایجاد کد تخفیف",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مشتری ها', href: '/brand' },
        { label: 'افزودن مشتری', href: '' },
      ]"
      title="ایجاد مشتری جدید"
      subtitle="افزودن مشتری به فروشگاه"
      publish-label="انتشار مشتری"
      discard-label="انصراف"
      form="brand-form"
      @discard="() => navigateTo('/brand')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <userForm v-model="body" :loading="isLoading" :onSubmit="submitForm" />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const body = reactive({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "",
  mobile: "",
  identity_card: "",
});

const { isLoading } = useLoading();

async function submitForm() {
  // isLoading.value = true;
  // try {
  //   const data: any = await $fetch("/api/user/cretae", {
  //     method: "POST",
  //     body: { ...body },
  //   });

  //   useToast().success({
  //     message: data.data.message || "برند با موفقیت ایجاد شد.",
  //   });
  //   navigateTo("/customers");
  // } catch (error: any) {
  //   useToast().error({
  //     message: error?.data?.data?.message || "خطا در ایجاد برند",
  //   });
  // } finally {
  //   isLoading.value = false;
  // }
}
</script>

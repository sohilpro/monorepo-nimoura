<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مشتری ها', href: '/brand' },
        { label: 'ویرایش مشخصات مشتری', href: '' },
      ]"
      title="ویرایش مشتری"
      subtitle="آپدیت مشتری عزیز"
      publish-label="ویرایش مشتری"
      discard-label="انصراف"
      form="customer-form"
      @discard="() => navigateTo('/customers')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <UserForm v-model="body" :loading="isLoading" :onSubmit="submitForm" />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug;
const { isLoading } = useLoading();

const { data: user }: any = await useFetch(`/api/user/getOne`, {
  query: { id },
});

const body = reactive({
  first_name: user.value.data.first_name || "",
  last_name: user.value.data.last_name || "",
  email: user.value.data.email || "",
  // password: "",
  role: user.value.data.role || "USER",
  mobile: user.value.data.mobile || "",
  identity_card: user.value.data.identity_card || "",
});

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/user/update`, {
      method: "PUT",
      body,
      query: { id },
    });

    useToast().info({
      message: data.data.message || "مشتری با موفقیت ویرایش شد",
    });
    navigateTo("/customers");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "خطا در آپدیت مشتری",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

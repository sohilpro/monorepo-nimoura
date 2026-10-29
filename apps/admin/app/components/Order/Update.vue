<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات', href: '/brand' },
        { label: 'ویرایش مشخصات سفارش', href: '' },
      ]"
      title="ویرایش سفارش"
      subtitle="آپدیت سفارش"
    />

    <OrderForm
      :order="order.data"
      @submit="submitForm"
      @cancel="onCancel"
      @add-item="onAddItem"
    />
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug;
const { isLoading } = useLoading();

const { data: order }: any = await useFetch(`/api/orders/getOne`, {
  query: { id },
});

function onSubmit(updated: any) {
  // TODO: فراخوانی API PUT/PATCH برای ذخیره تغییرات
  console.log(updated);
}
function onCancel() {
 navigateTo('/order')
}
function onAddItem() {
  // باز کردن پیکر محصول/جستجو و سپس push به form.items در والد
}

async function submitForm(updated: any) {
  isLoading.value = true;

  try {
    const data: any = await $fetch(`/api/orders/update`, {
      method: "PATCH",
      body: updated,
      query: { id },
    });

    useToast().info({
      message: data.data.message || "سفارش با موفقیت ویرایش شد",
    });
    navigateTo("/order");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "خطا در آپدیت سفارش",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

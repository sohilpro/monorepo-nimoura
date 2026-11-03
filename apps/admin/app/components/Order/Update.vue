<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات', href: '/order' },
        { label: 'ویرایش مشخصات سفارش', href: '' },
      ]"
      title="ویرایش سفارش"
      subtitle="مدیریت اقلام، وضعیت و مشخصات مالی سفارش"
    />

    <OrderForm
      v-if="order"
      :order="order"
      @submit="submitForm"
      @cancel="onCancel"
    />
    <div v-else class="p-8 text-center text-gray-500">
      در حال بارگذاری اطلاعات سفارش...
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug as string;
const { updateOrder } = useAdminOrders();

const { data: rawOrder } = await useFetch(`/api/orders/${id}`, {
  key: `admin-order-${id}`,
});

const order = computed(() => {
  const d = rawOrder.value as any;
  return d?.data ?? d;
});

function onCancel() {
  navigateTo('/order');
}

async function submitForm(payload: any) {
  const success = await updateOrder(id, payload);
  if (success) {
    await navigateTo('/order');
  }
}
</script>

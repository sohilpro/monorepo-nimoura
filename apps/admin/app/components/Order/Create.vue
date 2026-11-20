<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات', href: '/order' },
        { label: 'ایجاد سفارش بصورت دستی', href: '' },
      ]"
      title="ایجاد سفارش بصورت دستی"
      subtitle="ثبت سفارش جدید برای مشتری به صورت حضوری، تلفنی یا مستقیم"
    />

    <OrderForm
      :is-create="true"
      @submit="submitForm"
      @cancel="onCancel"
    />
  </section>
</template>

<script setup lang="ts">
const { createOrder } = useAdminOrders();

function onCancel() {
  navigateTo('/order');
}

async function submitForm(payload: any) {
  const created = await createOrder(payload);
  if (created) {
    await navigateTo('/order');
  }
}
</script>

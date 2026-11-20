<template>
    <div>
        <ProductUpdate />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const productId = computed(() => route.params.slug as string);
const { getProductById } = useAdminProducts();
const { data: product } = await useAsyncData(`admin-product-${productId.value}`, () => getProductById(productId.value));
const productTitle = computed(() => {
  const value = product.value as any;
  return value?.name || value?.title || value?.product_name || 'ویرایش محصول';
});
useHead(() => ({ title: productTitle.value }));
</script>
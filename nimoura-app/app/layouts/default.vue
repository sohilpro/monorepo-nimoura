<template>
  <div>
    <!-- <Icons /> -->
    <LayoutsHeader />
    <main>
      <slot />
    </main>
    <LayoutsFooter />
    
    <ClientOnly>
      <!-- bottom Navbar-->
      <LayoutsMobileBottomBar
        :categories="categories"
        :cart-count="cart.totalCount"
    /></ClientOnly>
  </div>
</template>

<script setup>
const { categories, pending } = useCategories();

const cart = useCartStore();
</script>

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
const auth = useAuth();
const { registerVisit } = useLoyalty();

// Register at most once per browser day; the API remains idempotent as a safeguard.
onMounted(() => {
  if (!auth.value) return;
  const key = `nimoura-loyalty-visit:${new Date().toISOString().slice(0, 10)}`;
  if (localStorage.getItem(key)) return;
  registerVisit().then(() => localStorage.setItem(key, '1'));
});
</script>

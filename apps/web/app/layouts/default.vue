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
  const tehranDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const key = `nimoura-loyalty-visit:${tehranDate}`;
  if (localStorage.getItem(key)) return;
  registerVisit().then((res) => {
    if (res) localStorage.setItem(key, '1');
  });
});
</script>

<template>
      <!-- بنر تبلیغاتی بالا -->
    <LayoutsAdBannersCashPurchace />
  

  <header
    class="sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out bg-white shadow-sm"
    :class="
      isHeaderVisible 
        ? 'translate-y-0' 
        : 'translate-y-0 lg:-translate-y-full'
    "
  >


    <!-- بخش دسکتاپ -->
    <div class="hidden flex-col lg:flex">
      <LayoutsDesktopTopBar />
      <LayoutsDesktopNavBar />
    </div>

    <!-- بخش موبایل -->
    <div class="flex flex-col w-full lg:hidden bg-white/20 backdrop-blur-2xl">
      <LayoutsMobileTopNavBar />
    </div>
  </header>
</template>

<script setup>
const { y } = useWindowScroll();
const lastY = ref(0);
const isHeaderVisible = ref(true);

watch(y, (currentY) => {
  if (currentY <= 0) {
    isHeaderVisible.value = true;
    lastY.value = currentY;
    return;
  }

  if (currentY < 100) {
    isHeaderVisible.value = true;
    lastY.value = currentY;
    return;
  }

  if (currentY > lastY.value) {
    isHeaderVisible.value = false;
  } else {
    isHeaderVisible.value = true;
  }

  lastY.value = currentY;
});
</script>
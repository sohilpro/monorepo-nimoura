<template>
  <div class="flex min-h-screen flex-col bg-nimoura-base text-nimoura-text-700">
    <!-- هدر اختصاصی مجله (جدا از هدر فروشگاه) -->
    <MagazineHeader />

    <main class="flex-1">
      <slot />
    </main>

    <!-- فوتر اختصاصی مجله (جدا از فوتر فروشگاه) -->
    <MagazineFooter />
  </div>
</template>

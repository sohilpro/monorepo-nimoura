<template>
  <div class="min-h-screen bg-gray-50/60 xl:flex" dir="rtl">
    <LayoutAppSidebar />
    <LayoutBackdrop />
    <div
      class="flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:mr-[280px]' : 'lg:mr-[84px]']"
    >
      <LayoutAppHeader />
      <main class="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isExpanded, isHovered } = useSidebar();
</script>

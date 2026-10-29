<template>
  <div class="min-h-screen xl:flex">
    <LayoutAppSidebar />
    <LayoutBackdrop />
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:mr-[290px]' : 'lg:mr-[90px]']"
    >
      <LayoutAppHeader />
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const { isExpanded, isHovered } = useSidebar();
</script>

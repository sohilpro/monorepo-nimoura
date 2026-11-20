<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
      @click="toggleMobileSidebar"
    />
  </Transition>
</template>

<script setup lang="ts">
const { toggleMobileSidebar, isMobileOpen } = useSidebar();
</script>

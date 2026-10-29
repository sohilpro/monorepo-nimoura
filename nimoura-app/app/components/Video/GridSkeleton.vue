<template>
  <div class="grid grid-cols-3 gap-2 lg:gap-2.5">
    <div class="skeleton-shimmer row-span-2 rounded-2xl" />
    <div v-for="n in 4" :key="n" class="skeleton-shimmer aspect-square rounded-2xl" />
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: #f1ede9; /* هم‌راستا با پالت آیوری Nimoura */
}
.skeleton-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(183, 110, 121, 0.14), transparent);
  animation: shimmer 1.6s ease-in-out infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
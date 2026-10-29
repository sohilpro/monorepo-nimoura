<template>
  <div>
    <!-- LOADING -->
    <div v-if="pending" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="n in 8"
        :key="`skeleton-${n}`"
        class="w-full aspect-[148/220] rounded-2xl border border-nimoura-border/30 p-3 animate-pulse"
      >
        <div class="h-27 w-full rounded-lg bg-nimoura-text-100"></div>
        <div class="mt-2 space-y-1.5">
          <div class="h-2.5 bg-nimoura-text-100 rounded w-full"></div>
          <div class="h-2.5 bg-nimoura-text-100 rounded w-2/3 mr-auto"></div>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <i class="pi pi-heart text-4xl! text-nimoura-primary/30" />
      <p class="text-sm text-nimoura-text-400">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌ای</p>
      <NuxtLink to="/" class="mt-2 rounded-xl bg-nimoura-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        مشاهده محصولات
      </NuxtLink>
    </div>

    <!-- GRID -->
    <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="product in items" :key="product.id" class="group relative">
        <button
          type="button"
          class="absolute left-4 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-white/90 text-nimoura-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-nimoura-primary hover:text-white"
          aria-label="حذف از علاقه‌مندی"
          @click="removeFromWishlist(product.id)"
        >
          <i class="pi pi-heart-fill text-xs!" />
        </button>

        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, pending, removeFromWishlist } = useWishlist();
</script>
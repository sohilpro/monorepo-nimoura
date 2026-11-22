<template>
  <div>
    <!-- LOADING -->
    <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="n in 8"
        :key="`skeleton-${n}`"
        class="aspect-148/220 rounded-2xl border border-nimoura-text-100 bg-white p-3 shadow-xs"
      >
        <Skeleton class="!h-27 !w-full !rounded-xl" />
        <div class="mt-3 space-y-2">
          <Skeleton class="!h-2.5 !w-full !rounded-full" />
          <Skeleton class="!h-2.5 !w-2/3 !rounded-full" />
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-nimoura-200 bg-white px-4 py-16 text-center shadow-xs">
      <div class="flex size-16 items-center justify-center rounded-full bg-nimoura-primary/10">
        <i class="pi pi-heart text-3xl text-nimoura-primary/40" />
      </div>
      <p class="text-sm font-medium text-nimoura-text-500">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌ای</p>
      <NuxtLink
        to="/"
        class="mt-2 rounded-xl bg-nimoura-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-nimoura-600 hover:shadow-md"
      >
        مشاهده محصولات
      </NuxtLink>
    </div>

    <!-- GRID -->
    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="product in items" :key="product.id" class="group relative">
        <Button
          type="button"
          icon="pi pi-heart-fill"
          aria-label="حذف از علاقه‌مندی"
          rounded
          class="!absolute !left-3 !top-3 !z-10 !flex !size-8 !items-center !justify-center !border-0 !bg-white/90 !text-nimoura-primary !shadow-sm !backdrop-blur-sm transition-all hover:!bg-nimoura-primary hover:!text-white"
          @click="removeFromWishlist(product.id)"
        />
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, pending, removeFromWishlist } = useWishlist();
</script>

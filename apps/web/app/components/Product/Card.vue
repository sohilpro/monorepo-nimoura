<template>
  <div
    class="w-[148px] h-[220px] relative bg-white overflow-hidden border border-nimoura-border/30 rounded-2xl flex flex-col p-3 transition-shadow hover:shadow-md"
  >
    <UtilsOffBadge
      :value="Math.round(product.discountPercent)"
      class="absolute top-0 left-0"
    />
    <NuxtLink
      :to="`/product/${product.id}/${createSlug(product.title)}`"
      class="flex justify-center items-center h-27 shrink-0"
    >
      <NuxtImg
        src="https://storage.khanoumi.com/ProductImages/52174-202541512441453.jpg"
        :alt="product.title || 'تصویر محصول'"
        format="webp,jpeg"
        width="96"
        height="96"
        class="object-contain w-24 h-24"
        loading="lazy"
      />
    </NuxtLink>

    <NuxtLink
      :to="`/product/${product.id}/${createSlug(product.title)}`"
      class="flex-1 mt-1"
    >
      <h3
        class="text-nimoura-text-800 font-medium text-[11.5px] leading-[1.6] line-clamp-2 text-right"
      >
        {{ product.title }}
      </h3>
    </NuxtLink>

    <div class="flex flex-col font-modam items-end mt-2 gap-0.5">
      <span class="text-nimoura-text-400 line-through text-[11px]">
        {{ numberFormat(product.price) }}
      </span>
      <span class="text-nimoura-primary font-bold text-xs">
        {{ numberFormat(product.priceDiscount) }}
        <span class="text-[10px] font-medium">تومان</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { dontShowAddCartBtn, product } = defineProps<{
  dontShowAddCartBtn?: boolean;
  product: any;
}>();
</script>

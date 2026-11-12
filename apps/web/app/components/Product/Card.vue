<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300"
    :class="
      isGrid
        ? 'h-full w-full border-nimoura-text-100 p-2 hover:-translate-y-0.5 hover:border-nimoura-primary/30 hover:shadow-md sm:p-2.5'
        : 'h-[220px] w-[148px] border-nimoura-border/30 p-3 hover:shadow-md'
    "
  >
    <UtilsOffBadge
      v-if="hasDiscount && discountPercent > 0"
      :value="discountPercent"
      class="absolute top-0 end-0 z-10"
    />

    <NuxtLink
      :to="productUrl"
      class="relative flex shrink-0 items-center justify-center overflow-hidden"
      :class="
        isGrid
          ? 'aspect-square w-full rounded-xl bg-nimoura-base/40'
          : 'h-27'
      "
    >
      <NuxtImg
        src="https://storage.khanoumi.com/ProductImages/52174-202541512441453.jpg"
        :alt="product.title || 'تصویر محصول'"
        format="webp,jpeg"
        :width="isGrid ? 256 : 96"
        :height="isGrid ? 256 : 96"
        :class="
          isGrid
            ? 'h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105'
            : 'h-24 w-24 object-contain'
        "
        loading="lazy"
      />

      <ProductBadges v-if="showBadges" :badges="product.badges" />

      <div
        v-if="showBadges && isOutOfStock"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[2px]"
      >
        <span
          class="rounded-full border border-nimoura-text-200 bg-white/95 px-3 py-1 text-[10px] font-medium text-nimoura-text-600 shadow-sm"
        >
          ناموجود
        </span>
      </div>
    </NuxtLink>

    <NuxtLink
      :to="productUrl"
      class="flex-1"
      :class="isGrid ? 'mt-2 px-0.5' : 'mt-1'"
    >
      <h3
        class="line-clamp-2 text-start font-medium text-nimoura-text-800 transition-colors"
        :class="
          isGrid
            ? 'text-xs leading-[1.6] group-hover:text-nimoura-primary'
            : 'text-[11.5px] leading-[1.6]'
        "
      >
        {{ product.title }}
      </h3>
    </NuxtLink>

    <div
      class="mt-auto flex flex-col items-end gap-0.5 pt-2 font-modam"
      :class="isGrid ? 'px-0.5' : ''"
    >
      <span
        v-if="hasDiscount"
        class="text-[11px] text-nimoura-text-400 line-through"
      >
        {{ numberFormat(basePrice) }}
      </span>
      <span
        class="font-bold text-nimoura-primary"
        :class="isGrid ? 'text-xs sm:text-sm' : 'text-xs'"
      >
        {{ numberFormat(finalPrice) }}
        <span class="text-[10px] font-medium">تومان</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { dontShowAddCartBtn, product, variant = 'compact', showBadges = false } =
  defineProps<{
    dontShowAddCartBtn?: boolean;
    product: any;
    variant?: 'compact' | 'grid';
    showBadges?: boolean;
  }>();

const isGrid = computed(() => variant === 'grid');

const productUrl = computed(
  () => `/product/${encodeURIComponent(product?.slug || createSlug(product?.title || ''))}`,
);

const isOutOfStock = computed(
  () => product?.stockStatus === 'out_of_stock' || product?.stock === 0,
);

const basePrice = computed(() => Number(product?.price) || 0);
const discountedPrice = computed(() => Number(product?.priceDiscount) || 0);

const hasDiscount = computed(
  () =>
    basePrice.value > 0 &&
    discountedPrice.value > 0 &&
    discountedPrice.value < basePrice.value,
);

const finalPrice = computed(() =>
  hasDiscount.value ? discountedPrice.value : basePrice.value,
);

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0;
  const fromApi = Number(product?.discountPercent);
  if (Number.isFinite(fromApi) && fromApi > 0) {
    return Math.round(fromApi);
  }
  return calculateDiscountPercentage(basePrice.value, discountedPrice.value);
});
</script>

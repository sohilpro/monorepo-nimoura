<template>
  <div
    v-for="product in productsWithDiscount"
    :key="product.id"
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-nimoura-text-100 bg-white p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-nimoura-primary/30 hover:shadow-[0_8px_24px_rgba(183,110,121,0.10)] sm:p-2"
  >
    <!-- DISCOUNT BADGE -->
    <UtilsOffBadge
      v-if="product.discount"
      :value="product.discount"
      class="absolute left-0 top-0 z-10"
    />

    <!-- PRODUCT IMAGE -->
    <NuxtLink
      :to="`/product/${product.id}/${createSlug(product.title)}`"
      class="relative block aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-nimoura-base"
    >
      <NuxtImg
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        src="https://storage.khanoumi.com/ProductImages/59764-202541611372172.jpg?w=104"
        :alt="product.title || 'تصویر محصول'"
        format="webp,jpeg"
        width="256"
        height="256"
        loading="lazy"
      />

      <!-- AUTOMATIC BADGES: new, bundle, amazing offer, only N left -->
      <ProductBadges :badges="product.badges" />

      <!-- OUT OF STOCK -->
      <div
        v-if="product.stockStatus === 'out_of_stock' || product.stock === 0"
        class="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]"
      >
        <span
          class="rounded-full border border-nimoura-text-200 bg-white/95 px-3 py-1 text-[10px] font-medium text-nimoura-text-600 shadow-sm"
        >
          ناموجود
        </span>
      </div>
    </NuxtLink>

    <!-- PRODUCT BODY -->
    <div class="mt-2 flex flex-1 flex-col gap-1 px-0.5">
      <!-- TITLE -->
      <NuxtLink
        :to="`/product/${product.id}/${createSlug(product.title)}`"
        class="line-clamp-2 h-[2.4em] text-[11px] font-medium leading-[1.2] text-nimoura-text-700 transition-colors hover:text-nimoura-primary sm:text-xs"
      >
        {{ product.title }}
      </NuxtLink>

      <!-- PRICE -->
      <div class="mt-auto flex flex-col items-end gap-0.5">
        <!-- OLD PRICE -->
        <del
          v-if="product.discount"
          class="text-[10px] leading-tight text-nimoura-text-400"
        >
          {{ numberFormat(product.price) }}
        </del>

        <!-- CURRENT PRICE -->
        <div class="flex items-baseline gap-1 text-nimoura-primary">
          <span class="font-modam font-semibold leading-tight">
            {{ numberFormat(product.priceDiscount) }}
          </span>

          <span class="text-[9.5px] font-medium"> تومان </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { products } = defineProps<{
  products: any[];
}>();

const cart: any = useCartStore();
const auth: any = useAuth();

function getDiscount(product: any) {
  const payload = auth.value
    ? {
        product: {
          price: product.price,
          priceDiscount: product.priceDiscount,
        },
      }
    : {
        price: product.price,
        priceDiscount: product.priceDiscount,
      };

  return cart.discountPercent(payload) || 0;
}

const productsWithDiscount = computed(() =>
  (products ?? []).map((product) => ({
    ...product,
    discount: getDiscount(product),
  })),
);
</script>

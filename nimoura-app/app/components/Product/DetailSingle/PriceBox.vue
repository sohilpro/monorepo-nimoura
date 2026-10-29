<template>
  <div
    class="w-full hidden lg:w-1/4 lg:sticky bg-white top-2.5 lg:flex flex-col gap-y-6"
  >
    <!-- PRICE -->
    <div class="flex flex-col justify-between gap-y-2">
      <div class="flex items-center gap-x-2">
        <p class="text-2xl font-vazir font-bold text-nimoura-text-800">
          {{ numberFormat(finalPrice) }}
        </p>
        <p class="text-nimoura-text-500 text-sm">تومان</p>
      </div>

      <div v-if="product.discountPercent" class="flex items-center gap-x-2">
        <Tag
          :value="`${Math.round(product.discountPercent)}٪ تخفیف`"
          class="!bg-nimoura-primary/10 !text-nimoura-primary !text-xs !font-medium font-modam"
        />
        <p class="line-through text-nimoura-text-400 text-sm font-vazir font-medium">
          {{ numberFormat(product.price) }} تومان
        </p>
      </div>
    </div>

    <div class="flex gap-2 flex-col">
      <!-- اقساط ترب‌پی -->
      <div
        v-if="product.discountPercent"
        class="w-full items-center gap-2 lg:gap-0.5 hidden lg:flex torobpay-widget-media torobpay-logo-light-sweep"
      >
        <IconsTorobPay class="w-6 h-6 torobpay-widget-image" />
        <span class="text-green-700 lg:text-sm">
          <span class="font-modam">4</span> قسط ماهانه
          <span class="font-modam">{{ numberFormat(product.priceDiscount / 4) }}</span>
          تومانی با ترب‌پی!
        </span>
      </div>

      <!-- هشدار انتخاب واریانت -->
      <p
        v-if="isVariantProduct && !selectedVariant"
        class="text-xs text-nimoura-primary text-center"
      >
        لطفاً یک واریانت را انتخاب کنید
      </p>

      <Button
        :label="isOutOfStock ? 'ناموجود' : 'افزودن به سبد خرید'"
        icon="pi pi-shopping-bag"
        icon-pos="left"
        :loading="adding"
        :disabled="isOutOfStock"
        class="!w-full !bg-nimoura-primary !border-nimoura-primary !rounded-lg !py-2.5 disabled:!opacity-60"
        @click="handleAddToCart"
      />
    </div>

    <div class="text-sm text-nimoura-text-400 flex justify-center xl:items-center gap-x-1">
      <p>
        ارسال رایگان برای خریدهای بالای
        <span class="font-modam text-nimoura-primary">4,000,000</span> تومان
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { product, selectedVariant } = defineProps<{
  product: any;
  selectedVariant?: { value: string; alt: string; stock: number; id: number } | null;
}>();

const { addItem } = useCartActions();
const toast = useAppToast();

const adding = ref(false);

const isVariantProduct = computed(() => product.type === "variant");

const isOutOfStock = computed(() => {
  if (isVariantProduct.value) {
    return !selectedVariant || !(selectedVariant.stock > 0);
  }
  return product.stock === 0;
});

const finalPrice = computed(() =>
  product.discountPercent ? product.priceDiscount : product.price
);

async function handleAddToCart() {
  if (isVariantProduct.value && !selectedVariant) {
    toast.warn("لطفاً یک واریانت انتخاب کنید");
    return;
  }
  if (isOutOfStock.value) return;

  adding.value = true;
  try {
    // useCartActions.addItem خودش تشخیص می‌دهد کاربر لاگین است یا مهمان
    // و بر همان اساس با API یا localStorage کار می‌کند — اینجا نیازی به چک auth نیست.
    await addItem(
      {
        productId: product.id,
        title: product.title,
        price: product.price,
        priceDiscount: product.priceDiscount,
        thumbnail: product.thumbnail,
        variant: selectedVariant
          ? { value: selectedVariant.value, alt: selectedVariant.alt }
          : null,
      },
      1
    );
  } finally {
    adding.value = false;
  }
}
</script>
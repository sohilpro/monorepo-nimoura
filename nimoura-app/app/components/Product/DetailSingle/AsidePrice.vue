<template>
  <aside
    class="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-6 self-start"
  >
    <Card
      class="!rounded-2xl !border !border-gray-200 !shadow-none overflow-hidden !bg-white"
    >
      <template #header>
        <div
          class="w-full aspect-[4/3] bg-nimoura-accent/20 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="product?.image"
            :src="product.image"
            :alt="product.title"
            class="w-full h-full object-cover"
          />
          <i
            v-else
            class="pi pi-shopping-bag text-5xl text-nimoura-primary/30"
            aria-hidden="true"
          />
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <!-- ── Variant swatches ── -->
          <div v-if="isVariant && product.variants?.length">
            <p class="text-xs font-medium text-nimoura-text-600 mb-2.5">
              رنگ:
              <span class="text-nimoura-primary font-semibold">
                {{ selectedVariant?.alt ?? "انتخاب نشده" }}
              </span>
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in product.variants"
                :key="v.id"
                type="button"
                :title="v.alt"
                class="relative w-8 h-8 rounded-full border-2 transition-all duration-200"
                :style="{ backgroundColor: v.value }"
                :class="[
                  selectedVariant?.id === v.id
                    ? 'border-nimoura-primary scale-110 shadow-md'
                    : 'border-transparent hover:border-nimoura-text-300 hover:scale-105',
                  v.stock === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer',
                ]"
                :disabled="v.stock === 0"
                @click="$emit('update:selectedVariant', v)"
              >
                <!-- strikethrough for out of stock -->
                <span
                  v-if="v.stock === 0"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span class="block w-full h-[1.5px] bg-white/80 rotate-45" />
                </span>
              </button>
            </div>
            <!-- low stock warning -->
            <p
              v-if="
                selectedVariant &&
                selectedVariant.stock > 0 &&
                selectedVariant.stock <= 3
              "
              class="mt-2 text-[11px] text-orange-500"
            >
              فقط {{ selectedVariant.stock }} عدد باقی مانده!
            </p>
          </div>

          <!-- ── Price ── -->
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold font-vazir text-nimoura-text-800">
                {{ numberFormat(finalPrice) }}
              </span>
              <span class="text-sm text-nimoura-text-500">تومان</span>
            </div>
            <div v-if="product.discountPercent" class="flex items-center gap-2">
              <Tag
                :value="`${Math.round(product.discountPercent)}٪ تخفیف`"
                class="!bg-nimoura-primary/10 !text-nimoura-primary !text-xs !font-medium font-modam"
              />
              <span
                class="line-through text-nimoura-text-400 text-sm font-vazir"
              >
                {{ numberFormat(product.price) }} تومان
              </span>
            </div>
          </div>

          <div
            v-if="product?.isAvailable"
            class="flex items-center gap-1 text-[11px] text-nimoura-success mb-3"
          >
            <i class="pi pi-check-circle text-xs" aria-hidden="true" />
            موجود در انبار
          </div>

          <!-- ── Variant warning ── -->
          <p
            v-if="isVariant && !selectedVariant"
            class="text-xs text-nimoura-primary text-center -mt-1"
          >
            لطفاً یک رنگ انتخاب کنید
          </p>

          <!-- ── Add to cart ── -->
          <Button
            :label="isOutOfStock ? 'ناموجود' : 'افزودن به سبد خرید'"
            icon="pi pi-shopping-bag"
            icon-pos="left"
            :loading="adding"
            :disabled="isOutOfStock"
            class="!w-full !bg-nimoura-primary !border-nimoura-primary !rounded-xl !py-2.5 disabled:!opacity-60"
            @click="handleAddToCart"
          />

          <!-- ── Wishlist ── -->
          <Button
            :label="
              inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'
            "
            :icon="inWishlist ? 'pi pi-heart-fill' : 'pi pi-heart'"
            severity="secondary"
            outlined
            class="!w-full !rounded-xl !py-2 !text-xs transition-colors"
            :class="
              inWishlist
                ? '!text-nimoura-primary !border-nimoura-primary'
                : '!text-nimoura-text-600 !border-nimoura-border hover:!bg-nimoura-accent/20'
            "
            @click.stop.prevent="handleToggle"
          />

          <Divider class="!my-0 !border-nimoura-border/50" />

          <!-- ── Trust badges ── -->
          <ul class="flex flex-col gap-2.5 text-[11px] text-nimoura-text-600">
            <li class="flex items-center gap-2">
              <i class="pi pi-truck text-sm text-nimoura-primary shrink-0" />
              ارسال رایگان برای خرید بالای
              <span class="font-modam">4</span> میلیون
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-shield text-sm text-nimoura-primary shrink-0" />
              محصول اصل با ضمانت اصالت
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-refresh text-sm text-nimoura-primary shrink-0" />
              ۷ روز ضمانت بازگشت
            </li>
          </ul>
        </div>
      </template>
    </Card>
  </aside>
</template>

<script setup lang="ts">
// ─── Types ────────────────────────────────────
interface Variant {
  id: number;
  value: string; // hex color e.g. "#e7cba9"
  alt: string;
  price: number;
  stock: number;
}

// ─── Props / emits ────────────────────────────
const props = defineProps<{
  product: any;
  selectedVariant?: Variant | null;
}>();

const emit = defineEmits<{
  "update:selectedVariant": [v: Variant | null];
}>();

// ─── Composables ──────────────────────────────
const { addItem } = useCartActions();
const { isInWishlist, toggleWishlist } = useWishlist();
const toast = useAppToast();

// ─── State ────────────────────────────────────
const adding = ref(false);

// ─── Computed ─────────────────────────────────
const isVariant = computed(() => props.product?.type === "variant");

const isOutOfStock = computed(() => {
  if (isVariant.value)
    return !props.selectedVariant || props.selectedVariant.stock === 0;
  return (props.product?.stock ?? 0) === 0;
});

const finalPrice = computed(() => {
  if (isVariant.value && props.selectedVariant)
    return props.selectedVariant.price;
  return props.product?.discountPercent
    ? props.product.priceDiscount
    : props.product?.price;
});

const productId = computed(() => Number(props.product?.id));
const inWishlist = computed(() => isInWishlist(productId.value));

// ─── Handlers ─────────────────────────────────
async function handleToggle() {
  await toggleWishlist(productId.value);
}

async function handleAddToCart() {
  if (isVariant.value && !props.selectedVariant) {
    toast.warn("لطفاً یک رنگ انتخاب کنید");
    return;
  }
  if (isOutOfStock.value) return;

  adding.value = true;
  try {
    await addItem(
      {
        productId: props.product.id,
        title: props.product.title,
        price: props.product.price,
        priceDiscount: props.product.priceDiscount,
        thumbnail: props.product.thumbnail,
        variant: props.selectedVariant
          ? {
              value: props.selectedVariant.value,
              alt: props.selectedVariant.alt,
            }
          : null,
      },
      1,
    );
  } finally {
    adding.value = false;
  }
}
</script>

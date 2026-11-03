<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-20"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="close"
      ></div>

      <div
        class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-right shadow-2xl transition-all"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">
            {{ step === "search" ? "افزودن محصول" : "انتخاب تنوع (رنگ/سایز)" }}
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div v-if="step === 'search'">
          <div class="relative mb-4">
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="نام محصول را جستجو کنید..."
              @input="handleSearch"
            />
            <div v-if="loading" class="absolute left-3 top-3.5">
              <svg
                class="h-5 w-5 animate-spin text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          </div>

          <div class="max-h-80 overflow-y-auto custom-scrollbar">
            <ul v-if="results.length > 0" class="divide-y divide-gray-100">
              <li
                v-for="product in results"
                :key="product.id"
                class="flex cursor-pointer items-center gap-3 p-3 hover:bg-blue-50 transition-colors rounded-lg group"
                @click="onProductClick(product)"
              >
                <img
                  :src="product.thumbnail"
                  class="h-12 w-12 rounded-lg object-cover border border-gray-200"
                />
                <div class="flex-1">
                  <p class="font-medium text-gray-800 line-clamp-1">
                    {{ product.title }}
                  </p>
                  <div
                    class="flex items-center gap-2 text-xs text-gray-500 mt-1"
                  >
                    <span
                      v-if="product.type === 'variant'"
                      class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded"
                    >
                      دارای تنوع
                    </span>
                    <span
                      class="px-1.5 py-0.5 rounded"
                      :class="
                        product.stock > 0
                          ? 'text-green-600 bg-green-50'
                          : 'text-red-500 bg-red-50'
                      "
                    >
                      {{
                        product.stock > 0
                          ? `موجود (${product.stock})`
                          : "ناموجود"
                      }}
                    </span>
                  </div>
                </div>
                <div class="text-sm font-bold text-gray-700">
                  {{ Number(product.priceDiscount).toLocaleString() }}
                </div>
              </li>
            </ul>
            <div
              v-else-if="query && !loading"
              class="py-8 text-center text-gray-500"
            >
              محصولی یافت نشد.
            </div>
          </div>
        </div>

        <div v-else-if="step === 'variant' && tempProduct">
          <div class="flex gap-4 mb-4">
            <img
              :src="tempProduct.thumbnail"
              class="w-20 h-20 rounded-lg object-cover border"
            />
            <div>
              <h4 class="font-bold text-gray-800 text-sm">
                {{ tempProduct.title }}
              </h4>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                {{ tempProduct.shortDescription }}
              </p>
            </div>
          </div>

          <p class="text-sm font-medium mb-2 text-gray-700">
            یک گزینه را انتخاب کنید:
          </p>

          <div
            class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar mb-4"
          >
            <div
              v-for="(variant, idx) in tempProduct.variants"
              :key="idx"
              @click="variant.stock > 0 ? (selectedVariant = variant) : null"
              class="flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all"
              :class="[
                selectedVariant === variant
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 hover:border-blue-300',
                variant.stock === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : '',
              ]"
            >
              <div class="flex items-center gap-3">
                <span
                  v-if="variant.value.startsWith('#')"
                  class="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                  :style="{ backgroundColor: variant.value }"
                ></span>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-800">{{
                    variant.alt
                  }}</span>
                  <span class="text-xs text-gray-500"
                    >موجودی: {{ variant.stock }}</span
                  >
                </div>
              </div>
              <div class="text-sm font-bold text-blue-600">
                {{ Number(variant.price).toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 mt-6">
            <button
              @click="confirmVariantSelection"
              :disabled="!selectedVariant"
              class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              افزودن به لیست
            </button>
            <button
              @click="goBack"
              class="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition"
            >
              بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close", "select"]);

// State
const step = ref<"search" | "variant">("search");
const query = ref("");
const results = ref<any[]>([]);
const loading = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
let debounceTimer: any = null;

// Variant Selection State
const tempProduct = ref<any>(null);
const selectedVariant = ref<any>(null);

// Reset when modal opens
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      step.value = "search";
      tempProduct.value = null;
      selectedVariant.value = null;
      query.value = "";
      results.value = [];
      nextTick(() => {
        document.documentElement.classList.add("overflow-hidden");
        searchInput.value?.focus();
      });
    }
  }
);

const handleSearch = () => {
  if (!query.value || query.value.trim().length < 2) {
    results.value = [];
    return;
  }
  clearTimeout(debounceTimer);
  loading.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const response: any = await $fetch('/api/product/list', {
        query: { search: query.value, limit: 20 },
      });
      const d = response?.data ?? response;
      results.value = d?.items ?? d?.products ?? [];
    } catch (e) {
      console.error(e);
      results.value = [];
    } finally {
      loading.value = false;
    }
  }, 600);
};

// وقتی روی محصول کلیک می‌شود
const onProductClick = (product: any) => {
  // اگر محصول واریانت دارد و آرایه واریانت‌ها خالی نیست
  if (
    product.type === "variant" &&
    product.variants &&
    product.variants.length > 0
  ) {
    tempProduct.value = product;
    selectedVariant.value = null; // ریست انتخاب قبلی
    step.value = "variant"; // تغییر مرحله
  } else {
    // محصول ساده است، مستقیم انتخاب شود
    emitFinalProduct(product, null);
  }
};

const confirmVariantSelection = () => {
  if (!selectedVariant.value) return;
  emitFinalProduct(tempProduct.value, selectedVariant.value);
};

const emitFinalProduct = (product: any, variant: any) => {
  // اگر واریانت انتخاب شده باشد، قیمت و موجودی آن اولویت دارد
  const finalPrice = variant ? variant.price : product.priceDiscount;

  const payload = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku || `P-${product.id}`,
    thumbnail: product.thumbnail,
    price: finalPrice,
    stock: variant ? variant.stock : product.stock,
    // ارسال کل آبجکت واریانت تا در سمت والد ذخیره شود
    selectedVariant: variant
      ? {
          id: variant.id,
          price: variant.price,
          stock: variant.stock,
          value: variant.value, // کد رنگ یا سایز
          alt: variant.alt, // نام رنگ (مثلا "شکلاتی")
        }
      : null,
  };

  emit("select", payload);
  close();
};

const goBack = () => {
  step.value = "search";
  tempProduct.value = null;
};

const close = () => {
  nextTick(() => document.documentElement.classList.remove("overflow-hidden"));
  emit("close");
};
</script>

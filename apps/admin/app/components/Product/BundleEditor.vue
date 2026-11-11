<template>
  <CommonComponentCard title="اقلام پک">
    <div class="space-y-4">
      <p class="text-xs leading-6 text-gray-500">
        محصولاتی که در این پک قرار می‌گیرند را اضافه کنید و قیمت ویژه پک را در بخش «قیمت و موجودی» تعیین کنید.
      </p>

      <TransitionGroup v-if="items.length" name="list" tag="ul" class="space-y-2.5">
        <li
          v-for="item in items"
          :key="item.uid"
          class="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-nowrap"
        >
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            alt=""
            class="size-14 shrink-0 rounded-lg border border-gray-100 object-cover"
          />
          <div v-else class="size-14 shrink-0 rounded-lg bg-gray-100" />

          <div class="min-w-0 flex-1">
            <p class="line-clamp-1 text-sm font-semibold text-gray-800">{{ item.title }}</p>
            <p v-if="item.variantLabel" class="mt-0.5 text-xs text-brand-600">{{ item.variantLabel }}</p>
            <p class="mt-0.5 text-xs text-gray-500">قیمت واحد: {{ formatPrice(item.unitPrice) }}</p>
          </div>

          <div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5" dir="ltr">
            <button type="button" class="size-8 rounded-md text-lg text-gray-600 hover:bg-white disabled:opacity-40" :disabled="item.quantity <= 1" aria-label="کاهش تعداد" @click="item.quantity--">−</button>
            <span class="w-8 text-center text-sm font-bold text-gray-800">{{ toPersianDigits(item.quantity) }}</span>
            <button type="button" class="size-8 rounded-md text-lg text-gray-600 hover:bg-white" aria-label="افزایش تعداد" @click="item.quantity++">+</button>
          </div>

          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="حذف از پک"
            @click="emit('remove', item.uid)"
          >
            <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14" /></svg>
          </button>
        </li>
      </TransitionGroup>

      <div
        v-else
        class="rounded-xl border-2 border-dashed px-4 py-8 text-center"
        :class="showErrors ? 'border-rose-300 bg-rose-50/40' : 'border-gray-200'"
      >
        <p class="text-sm font-medium text-gray-700">هنوز محصولی به پک اضافه نشده است</p>
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
        @click="openPicker"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        افزودن محصول به پک
      </button>

      <div v-if="items.length" class="space-y-1.5 rounded-xl bg-gray-50 p-3 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-gray-500">مجموع قیمت اقلام به‌صورت جداگانه</span>
          <span class="font-bold text-gray-800">{{ formatPrice(componentsTotal) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">قیمت پک</span>
          <span class="font-bold text-gray-800">{{ bundlePrice > 0 ? formatPrice(bundlePrice) : '—' }}</span>
        </div>
        <div
          v-if="bundlePrice > 0"
          class="flex items-center justify-between rounded-lg px-2 py-1.5 font-semibold"
          :class="saving > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
        >
          <span>{{ saving > 0 ? 'صرفه‌جویی مشتری' : 'قیمت پک از مجموع اقلام بیشتر است' }}</span>
          <span v-if="saving > 0">{{ formatPrice(saving) }}</span>
        </div>
      </div>
    </div>
  </CommonComponentCard>

  <!-- Product picker -->
  <Teleport to="body">
    <div v-if="pickerOpen" class="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:pt-20" @keydown.esc="pickerOpen = false">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="pickerOpen = false" />
      <div class="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">{{ pending ? 'انتخاب تنوع' : 'افزودن محصول به پک' }}</h3>
          <button type="button" class="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="بستن" @click="pickerOpen = false">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <template v-if="!pending">
          <input
            v-model="query"
            type="text"
            placeholder="نام یا SKU محصول را جستجو کنید..."
            class="mb-3 h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            @input="onSearch"
          />
          <ul class="-mx-1 flex-1 divide-y divide-gray-100 overflow-y-auto px-1">
            <li v-for="product in results" :key="product.id">
              <button type="button" class="flex w-full items-center gap-3 rounded-lg p-2.5 text-start transition hover:bg-brand-50" @click="pick(product)">
                <img v-if="product.thumbnail" :src="product.thumbnail" alt="" class="size-11 shrink-0 rounded-lg border border-gray-100 object-cover" />
                <div v-else class="size-11 shrink-0 rounded-lg bg-gray-100" />
                <span class="min-w-0 flex-1">
                  <span class="line-clamp-1 text-sm font-medium text-gray-800">{{ product.title }}</span>
                  <span v-if="product.type === 'variant'" class="mt-0.5 inline-block rounded bg-nimoura-accent/45 px-1.5 py-0.5 text-[11px] text-nimoura-velvet">دارای تنوع</span>
                </span>
                <span class="shrink-0 text-sm font-bold text-gray-700">{{ formatPrice(effective(product), '') }}</span>
              </button>
            </li>
          </ul>
          <p v-if="searching" class="py-6 text-center text-sm text-gray-500">در حال جستجو...</p>
          <p v-else-if="query.trim().length >= 2 && !results.length" class="py-6 text-center text-sm text-gray-500">محصولی یافت نشد.</p>
        </template>

        <template v-else>
          <p class="mb-3 text-sm text-gray-700">{{ pending.title }}</p>
          <ul class="flex-1 space-y-2 overflow-y-auto">
            <li v-for="variant in pending.variants" :key="variant.id">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-start transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="variant.stock <= 0"
                @click="pickVariant(variant)"
              >
                <span class="flex items-center gap-2.5">
                  <span
                    v-if="variant.attributeValues?.[0]?.colorHex"
                    class="size-6 rounded-full border border-black/10"
                    :style="{ backgroundColor: variant.attributeValues[0].colorHex! }"
                  />
                  <span class="text-sm font-medium text-gray-800">{{ labelOf(variant) }}</span>
                  <span class="text-xs text-gray-500">موجودی: {{ toPersianDigits(variant.stock) }}</span>
                </span>
                <span class="text-sm font-bold text-brand-600">{{ formatPrice(effective(variant), '') }}</span>
              </button>
            </li>
          </ul>
          <button type="button" class="mt-4 rounded-xl border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50" @click="pending = null">بازگشت</button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { formatPrice, toPersianDigits } from '@nimoura/utils';
import type { Product, ProductVariant } from '@nimoura/shared-types';
import type { FormBundleItem } from '~/composables/useProductForm';

const props = defineProps<{
  items: FormBundleItem[];
  bundlePrice: number;
  componentsTotal: number;
  /** id of the bundle being edited, so it cannot contain itself */
  productId?: number | string;
  showErrors: boolean;
}>();

const emit = defineEmits<{
  add: [item: Omit<FormBundleItem, 'uid' | 'quantity'>];
  remove: [uid: string];
}>();

const { getProductById, getProductsList } = useAdminProducts();

const pickerOpen = ref(false);
const query = ref('');
const results = ref<any[]>([]);
const searching = ref(false);
const pending = ref<Product | null>(null);
let debounce: ReturnType<typeof setTimeout> | undefined;

const saving = computed(() => props.componentsTotal - props.bundlePrice);

const effective = (x: { price?: number; priceDiscount?: number }) =>
  x.priceDiscount && x.priceDiscount > 0 && x.priceDiscount < (x.price ?? 0) ? x.priceDiscount : (x.price ?? 0);
const labelOf = (v: ProductVariant) => v.attributeValues?.map((a) => a.value).join(' / ') || v.sku;

function openPicker() {
  query.value = '';
  results.value = [];
  pending.value = null;
  pickerOpen.value = true;
}

function onSearch() {
  clearTimeout(debounce);
  if (query.value.trim().length < 2) {
    results.value = [];
    return;
  }
  searching.value = true;
  debounce = setTimeout(async () => {
    try {
      const { items } = await getProductsList({ search: query.value, limit: 20 });
      results.value = items.filter((p) => p.type !== 'bundle' && String(p.id) !== String(props.productId));
    } catch {
      results.value = [];
    } finally {
      searching.value = false;
    }
  }, 400);
}

async function pick(product: any) {
  if (product.type !== 'variant') {
    emit('add', {
      productId: product.id,
      variantId: null,
      title: product.title,
      thumbnail: product.thumbnail ?? null,
      variantLabel: '',
      unitPrice: effective(product),
    });
    pickerOpen.value = false;
    return;
  }
  const full = await getProductById(product.id);
  if (full?.variants?.length) pending.value = full;
}

function pickVariant(variant: ProductVariant) {
  const product = pending.value!;
  emit('add', {
    productId: product.id,
    variantId: variant.id,
    title: product.title,
    thumbnail: product.thumbnail ?? null,
    variantLabel: labelOf(variant),
    unitPrice: effective(variant),
  });
  pending.value = null;
  pickerOpen.value = false;
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

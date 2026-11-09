<template>
  <div
    class="rounded-xl border bg-white p-3.5 shadow-xs transition sm:p-4"
    :class="showErrors && errors.length ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
          {{ toPersianDigits(index + 1) }}
        </span>
        <span
          v-if="kind === 'color'"
          class="size-5 shrink-0 rounded-full border border-black/10"
          :style="{ backgroundColor: variant.colorHex }"
        />
        <span class="truncate text-sm font-semibold text-gray-800">{{ label || 'تنوع جدید' }}</span>
        <span
          v-if="!variant.isAvailable || Number(variant.stock) <= 0"
          class="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600"
        >
          ناموجود
        </span>
      </div>
      <button
        type="button"
        class="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label="حذف این تنوع"
        @click="emit('remove')"
      >
        <svg class="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14M10 11v5M14 11v5" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <!-- Color variant -->
      <template v-if="kind === 'color'">
        <div class="sm:col-span-3">
          <CommonColorPicker v-model="variant.colorHex" label="رنگ" />
        </div>
        <div class="sm:col-span-3">
          <CommonCustomInput
            v-model="variant.colorName"
            label="نام رنگ (نمایش به مشتری)"
            placeholder="مثال: رزگلد"
            @input="variant.nameTouched = true"
          />
        </div>
      </template>

      <!-- Volume / weight variant -->
      <template v-else>
        <div class="sm:col-span-3">
          <CommonCustomInput
            v-model="variant.amount"
            :label="kind === 'volume' ? 'مقدار حجم' : 'مقدار وزن'"
            placeholder="مثال: ۱۰۰"
            dir="ltr"
          />
        </div>
        <div class="sm:col-span-3">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">واحد</label>
          <select
            v-model="variant.unit"
            class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
          >
            <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
            <option value="">بدون واحد</option>
          </select>
        </div>
      </template>

      <div class="sm:col-span-2">
        <CommonFormattedNumberInput v-model="variant.price" label="قیمت (تومان)" placeholder="150,000" />
      </div>
      <div class="sm:col-span-2">
        <CommonFormattedNumberInput v-model="variant.priceDiscount" label="قیمت با تخفیف" placeholder="0" />
      </div>
      <div class="sm:col-span-2">
        <CommonFormattedNumberInput v-model="variant.stock" label="موجودی" placeholder="10" />
      </div>

      <div class="sm:col-span-4">
        <CommonCustomInput v-model="variant.sku" label="SKU (اختیاری)" placeholder="خالی بماند تا خودکار ساخته شود" dir="ltr" />
      </div>
      <div class="flex items-end sm:col-span-2">
        <CommonToggleSwitch v-model="variant.isAvailable" :id="`variant-available-${variant.uid}`" label="فعال" />
      </div>
    </div>

    <ul v-if="showErrors && errors.length" class="mt-3 space-y-1 text-xs text-rose-600">
      <li v-for="error in errors" :key="error" class="flex items-center gap-1.5">
        <span class="size-1 rounded-full bg-rose-500" />{{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { nearestPersianColorName, normalizeHex, toPersianDigits } from '@nimoura/utils';
import type { VariantKind } from '@nimoura/shared-types';
import { VARIANT_UNITS, variantLabel, type FormVariant } from '~/composables/useProductForm';

const props = defineProps<{
  variant: FormVariant;
  index: number;
  kind: VariantKind;
  errors: string[];
  showErrors: boolean;
}>();
const emit = defineEmits<{ remove: [] }>();

const units = computed(() => (props.kind === 'color' ? [] : VARIANT_UNITS[props.kind]));
const label = computed(() => variantLabel(props.variant, props.kind));

// Suggest a Persian color name from the picked color until the admin types their own.
watch(
  () => props.variant.colorHex,
  (hex) => {
    if (props.kind !== 'color' || props.variant.nameTouched) return;
    const normalized = normalizeHex(hex);
    if (normalized) props.variant.colorName = nearestPersianColorName(normalized).name;
  },
  { immediate: true },
);
</script>

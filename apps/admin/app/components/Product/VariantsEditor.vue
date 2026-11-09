<template>
  <CommonComponentCard title="تنوع‌های محصول">
    <div class="space-y-5">
      <!-- Kind selector -->
      <div>
        <p class="mb-2 text-sm font-medium text-gray-700">نوع تنوع</p>
        <div class="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="نوع تنوع">
          <button
            v-for="option in VARIANT_KIND_OPTIONS"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="kind === option.value"
            class="rounded-lg px-2 py-2 text-sm font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
            :class="kind === option.value ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            @click="emit('update:kind', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="mt-2 text-xs text-gray-500">{{ activeHint }}</p>
      </div>

      <!-- Quick add -->
      <div>
        <p class="mb-2 text-xs font-medium text-gray-600">افزودن سریع</p>
        <div class="flex flex-wrap gap-2">
          <template v-if="kind === 'color'">
            <button
              v-for="preset in COSMETIC_COLOR_PRESETS.slice(0, 8)"
              :key="preset.hex"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pe-3 ps-1.5 text-xs text-gray-700 transition hover:border-brand-300 hover:bg-brand-50"
              @click="emit('add', { colorHex: preset.hex, colorName: preset.name, nameTouched: true })"
            >
              <span class="size-4 rounded-full border border-black/10" :style="{ backgroundColor: preset.hex }" />
              {{ preset.name }}
            </button>
          </template>
          <template v-else>
            <button
              v-for="preset in VARIANT_PRESETS[kind]"
              :key="`${preset.amount}${preset.unit}`"
              type="button"
              class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 transition hover:border-brand-300 hover:bg-brand-50"
              @click="emit('add', preset)"
            >
              {{ toPersianDigits(preset.amount) }} {{ preset.unit }}
            </button>
          </template>
        </div>
      </div>

      <!-- Rows -->
      <TransitionGroup v-if="variants.length" name="list" tag="div" class="space-y-3">
        <ProductVariantRow
          v-for="(variant, index) in variants"
          :key="variant.uid"
          :variant="variant"
          :index="index"
          :kind="kind"
          :errors="validateVariant(variant)"
          :show-errors="showErrors"
          @remove="emit('remove', variant.uid)"
        />
      </TransitionGroup>

      <div
        v-else
        class="rounded-xl border-2 border-dashed px-4 py-8 text-center"
        :class="showErrors ? 'border-rose-300 bg-rose-50/40' : 'border-gray-200'"
      >
        <p class="text-sm font-medium text-gray-700">هنوز تنوعی اضافه نشده است</p>
        <p class="mt-1 text-xs text-gray-500">از گزینه‌های سریع بالا یا دکمه زیر استفاده کنید.</p>
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
        @click="emit('add', {})"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        افزودن تنوع جدید
      </button>

      <!-- Derived summary -->
      <div v-if="variants.length" class="grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 text-xs sm:grid-cols-3">
        <div class="flex items-center justify-between sm:block">
          <span class="text-gray-500">تعداد تنوع</span>
          <span class="font-bold text-gray-800 sm:mt-0.5 sm:block">{{ toPersianDigits(variants.length) }}</span>
        </div>
        <div class="flex items-center justify-between sm:block">
          <span class="text-gray-500">محدوده قیمت</span>
          <span class="font-bold text-gray-800 sm:mt-0.5 sm:block">
            {{ summary.min === summary.max ? formatPrice(summary.min) : `${formatPrice(summary.min, '')} تا ${formatPrice(summary.max)}` }}
          </span>
        </div>
        <div class="flex items-center justify-between sm:block">
          <span class="text-gray-500">مجموع موجودی</span>
          <span class="font-bold text-gray-800 sm:mt-0.5 sm:block">{{ toPersianDigits(summary.stock) }}</span>
        </div>
      </div>
      <p class="text-xs text-gray-500">قیمت و موجودی کلی محصول به‌صورت خودکار از روی تنوع‌ها محاسبه می‌شود.</p>
    </div>
  </CommonComponentCard>
</template>

<script setup lang="ts">
import { COSMETIC_COLOR_PRESETS, formatPrice, toPersianDigits } from '@nimoura/utils';
import type { VariantKind } from '@nimoura/shared-types';
import {
  VARIANT_KIND_OPTIONS,
  VARIANT_PRESETS,
  type FormVariant,
} from '~/composables/useProductForm';

const props = defineProps<{
  kind: VariantKind;
  variants: FormVariant[];
  summary: { min: number; max: number; stock: number };
  showErrors: boolean;
  validateVariant: (variant: FormVariant) => string[];
}>();

const emit = defineEmits<{
  'update:kind': [kind: VariantKind];
  add: [partial: Partial<FormVariant>];
  remove: [uid: string];
}>();

const activeHint = computed(() => VARIANT_KIND_OPTIONS.find((o) => o.value === props.kind)?.hint ?? '');
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

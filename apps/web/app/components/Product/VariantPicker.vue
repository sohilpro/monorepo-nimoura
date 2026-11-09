<template>
  <div v-if="variants?.length">
    <p class="mb-2.5 text-xs font-medium text-nimoura-text-600">
      {{ kindLabel }}:
      <span class="font-semibold text-nimoura-primary">
        {{ selectedVariant?.alt ?? 'انتخاب نشده' }}
      </span>
    </p>

    <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="kindLabel">
      <button
        v-for="v in variants"
        :key="v.id"
        type="button"
        role="radio"
        :aria-checked="selectedVariant?.id === v.id"
        :title="v.alt"
        :disabled="isSoldOut(v)"
        class="relative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nimoura-primary/40"
        :class="[
          v.colorHex
            ? 'size-8 rounded-full border-2'
            : 'min-w-14 rounded-xl border px-3 py-1.5 text-xs font-medium',
          selectedVariant?.id === v.id
            ? v.colorHex
              ? 'scale-110 border-nimoura-primary shadow-md'
              : 'border-nimoura-primary bg-nimoura-primary/10 text-nimoura-primary'
            : v.colorHex
              ? 'border-transparent ring-1 ring-black/10 hover:scale-105 hover:border-nimoura-text-300'
              : 'border-nimoura-text-200 bg-white text-nimoura-text-700 hover:border-nimoura-primary/50',
          isSoldOut(v) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]"
        :style="v.colorHex ? { backgroundColor: v.colorHex } : undefined"
        @click="emit('update:selectedVariant', v)"
      >
        <template v-if="!v.colorHex">{{ v.alt }}</template>

        <!-- sold out: diagonal strike -->
        <span v-if="isSoldOut(v)" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[inherit]">
          <span class="block h-[1.5px] w-[120%] -rotate-45 bg-nimoura-text-500/70" />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PickerVariant {
  id: number;
  alt: string;
  kind?: string | null;
  colorHex?: string | null;
  stock: number;
  isAvailable?: boolean;
}

const props = defineProps<{
  variants?: PickerVariant[];
  selectedVariant?: any;
}>();

const emit = defineEmits<{ 'update:selectedVariant': [variant: any] }>();

const KIND_LABELS: Record<string, string> = { color: 'رنگ', volume: 'حجم', weight: 'وزن' };

const kindLabel = computed(() => {
  const first = props.variants?.[0];
  return KIND_LABELS[first?.kind ?? (first?.colorHex ? 'color' : '')] ?? 'گزینه';
});

const isSoldOut = (v: PickerVariant) => v.stock === 0 || v.isAvailable === false;
</script>

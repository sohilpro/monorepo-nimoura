<script setup lang="ts">
interface Props {
  min: number;
  max: number;
  step?: number;
  initialMin: number;
  initialMax: number;
}
const props = withDefaults(defineProps<Props>(), {
  step: 1000,
});

const emit = defineEmits(["range-updated"]);

const minValue = ref<number>(props.initialMin);
const maxValue = ref<number>(props.initialMax);

const priceGap = props.step;

function onRangeChange() {
  if (minValue.value >= maxValue.value) {
    minValue.value = maxValue.value - priceGap;
  }
  if (maxValue.value <= minValue.value) {
    maxValue.value = minValue.value + priceGap;
  }

  emit("range-updated", {
    minPrice: minValue.value,
    maxPrice: maxValue.value,
  });
}

const minPosPercent = computed(() => {
  if (props.max === props.min) return 0;
  return ((minValue.value - props.min) / (props.max - props.min)) * 100;
});

const maxPosPercent = computed(() => {
  if (props.max === props.min) return 100;
  return ((maxValue.value - props.min) / (props.max - props.min)) * 100;
});
</script>

<template>
  <div class="w-full px-4 pb-3">
    <div class="relative mt-5">
      <div class="slider-bar relative h-1 rounded-full bg-nimoura-text-100">
        <div
          class="progress absolute h-1 rounded-full bg-nimoura-primary"
          :style="{
            'inset-inline-start': `${minPosPercent}%`,
            'inset-inline-end': `${100 - maxPosPercent}%`,
          }"
        />
      </div>

      <div class="range-input-wrapper absolute inset-0">
        <input
          v-model.number="minValue"
          type="range"
          :min="props.min"
          :max="props.max"
          :step="props.step"
          class="range-input"
          @change="onRangeChange"
        />
        <input
          v-model.number="maxValue"
          type="range"
          :min="props.min"
          :max="props.max"
          :step="props.step"
          class="range-input"
          @change="onRangeChange"
        />
      </div>

      <div class="price-display mt-8 flex justify-between text-sm text-nimoura-text-800">
        <div class="flex items-center gap-2">
          <span class="text-nimoura-text-500">از</span>
          <p class="font-semibold font-modam">{{ minValue.toLocaleString() }}</p>
          <span class="font-light text-nimoura-text-500">تومان</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-nimoura-text-500">تا</span>
          <p class="font-semibold font-modam">{{ maxValue.toLocaleString() }}</p>
          <span class="font-light text-nimoura-text-500">تومان</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range-input-wrapper {
  height: 4px;
}
.range-input {
  position: absolute;
  top: -6px;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: none;
  pointer-events: none;
}
.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--color-nimoura-primary);
  cursor: pointer;
  pointer-events: auto;
}
.range-input::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  border: none;
  background: var(--color-nimoura-primary);
  cursor: pointer;
  pointer-events: auto;
}
</style>
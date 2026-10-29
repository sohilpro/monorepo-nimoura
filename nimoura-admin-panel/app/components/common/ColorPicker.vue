<template>
  <div
    :class="{ 'opacity-50': props.disabled }"
    class="space-y-2 text-right"
    dir="rtl"
  >
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
      انتخاب رنگ
    </label>

    <div class="flex items-center gap-3">
      <input
        type="color"
        v-model="color"
        :disabled="props.disabled"
        class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
      />
      <div class="text-sm">
        <p class="text-gray-800 dark:text-white">{{ color }}</p>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ detectColorName(color) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const color = ref(props.modelValue || "#ffffff");

watch(color, (newColor) => {
  emit("update:modelValue", newColor);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== color.value) color.value = newVal;
  }
);

// تشخیص نام رنگ به زبان فارسی
function detectColorName(hex: string): string {
  const simpleColors: Record<string, string> = {
    "#000000": "مشکی",
    "#ffffff": "سفید",
    "#ff0000": "قرمز",
    "#00ff00": "سبز",
    "#0000ff": "آبی",
    "#ffff00": "زرد",
    "#ff00ff": "صورتی",
    "#00ffff": "فیروزه‌ای",
    "#808080": "خاکستری",
  };

  const normalized = hex.toLowerCase();
  if (simpleColors[normalized]) return simpleColors[normalized];

  // تخمین رنگ نزدیک
  if (normalized.includes("ff") && normalized.includes("00"))
    return "نارنجی یا زرد";
  if (normalized.includes("ff") && normalized.includes("80"))
    return "صورتی یا کرم";
  if (normalized.includes("00ff00")) return "سبز روشن";

  return "رنگ دلخواه";
}
</script>

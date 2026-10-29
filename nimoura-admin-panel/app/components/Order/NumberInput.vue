<template>
  <div
    class="inline-flex items-center rounded-xl border border-neutral-200 overflow-hidden bg-white"
  >
    <button
      type="button"
      class="px-2 py-1 text-neutral-600 hover:bg-neutral-100"
      @click="dec"
    >
      -
    </button>
    <input
      type="number"
      class="w-[50px] border-x border-neutral-100 p-1 text-center ltr:font-mono outline-none"
      :min="Number(min)"
      :value="modelValue as any"
      @input="onInput"
    />
    <button
      type="button"
      class="px-2 py-1 text-neutral-600 hover:bg-neutral-100"
      @click="inc"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ modelValue?: number; min?: number | string }>(),
  { min: 0 }
);
const emit = defineEmits<{ (e: "update:modelValue", v: number): void }>();

function onInput(e: Event) {
  emit("update:modelValue", Number((e.target as HTMLInputElement)?.value));
}
function dec() {
  emit(
    "update:modelValue",
    Math.max(Number(props.min), Number(props.modelValue || 0) - 1)
  );
}
function inc() {
  emit("update:modelValue", Number(props.modelValue || 0) + 1);
}
</script>

<template>
  <div ref="rootRef" class="relative text-start" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <!-- Trigger -->
    <button
      type="button"
      class="flex h-11 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-2.5 text-start transition hover:border-brand-300 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
      :aria-expanded="open"
      aria-haspopup="dialog"
      :disabled="disabled"
      @click="open = !open"
    >
      <span
        class="size-7 shrink-0 rounded-md border border-black/10 shadow-inner"
        :style="{ backgroundColor: currentHex }"
      />
      <span class="min-w-0 flex-1 truncate text-sm text-gray-800" dir="ltr">
        {{ currentHex }}
      </span>
      <span v-if="colorName" class="hidden truncate text-xs text-gray-500 sm:block">{{ colorName }}</span>
      <svg class="size-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Backdrop (mobile bottom sheet only) -->
    <div v-if="open" class="fixed inset-0 z-40 bg-black/40 sm:hidden" @click="open = false" />

    <!-- Panel -->
    <div
      v-if="open"
      role="dialog"
      aria-label="انتخاب رنگ"
      class="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] space-y-4 overflow-y-auto rounded-t-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:start-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-80 sm:rounded-2xl"
      @keydown.esc="open = false"
    >
      <div class="flex items-center justify-between sm:hidden">
        <span class="text-sm font-bold text-gray-800">انتخاب رنگ</span>
        <button type="button" class="rounded-md p-1 text-gray-500 hover:bg-gray-100" aria-label="بستن" @click="open = false">
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <!-- Saturation / value area -->
      <div
        ref="areaRef"
        dir="ltr"
        tabindex="0"
        role="slider"
        aria-label="اشباع و روشنایی رنگ"
        :aria-valuetext="`اشباع ${Math.round(hsv.s * 100)} درصد، روشنایی ${Math.round(hsv.v * 100)} درصد`"
        class="relative h-40 w-full cursor-crosshair touch-none select-none rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
        :style="{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }"
        @pointerdown="onAreaDown"
        @pointermove="onAreaMove"
        @keydown="onAreaKey"
      >
        <div class="absolute inset-0 rounded-xl bg-linear-to-r from-white to-transparent" />
        <div class="absolute inset-0 rounded-xl bg-linear-to-t from-black to-transparent" />
        <span
          class="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          :style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: currentHex }"
        />
      </div>

      <!-- Hue -->
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        dir="ltr"
        aria-label="طیف رنگ"
        class="hue-slider w-full"
        :value="Math.round(hsv.h)"
        @input="onHueInput"
      />

      <!-- HEX + RGB -->
      <div class="grid grid-cols-4 gap-2" dir="ltr">
        <label class="col-span-4 text-xs font-medium text-gray-600 sm:col-span-2">
          HEX
          <input
            v-model="hexDraft"
            type="text"
            maxlength="7"
            spellcheck="false"
            autocomplete="off"
            class="mt-1 h-9 w-full rounded-lg border px-2 text-sm uppercase outline-hidden focus:ring-2"
            :class="hexInvalid ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-300 focus:ring-brand-500/20'"
            @input="onHexInput"
            @blur="hexDraft = currentHex"
          />
        </label>
        <label v-for="channel in channels" :key="channel.key" class="col-span-1 text-xs font-medium text-gray-600">
          {{ channel.label }}
          <input
            type="number"
            min="0"
            max="255"
            inputmode="numeric"
            class="mt-1 h-9 w-full rounded-lg border border-gray-300 px-1.5 text-center text-sm outline-hidden focus:ring-2 focus:ring-brand-500/20"
            :value="rgb[channel.key]"
            @input="onRgbInput(channel.key, $event)"
          />
        </label>
      </div>

      <!-- Preview + eyedropper -->
      <div class="flex items-center gap-3">
        <span class="size-10 shrink-0 rounded-lg border border-black/10" :style="{ backgroundColor: currentHex }" />
        <p class="min-w-0 flex-1 truncate text-sm text-gray-700">{{ colorName || 'رنگ دلخواه' }}</p>
        <button
          v-if="supportsEyeDropper"
          type="button"
          class="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
          @click="pickFromScreen"
        >
          قطره‌چکان
        </button>
      </div>

      <!-- Presets -->
      <div>
        <p class="mb-2 text-xs font-medium text-gray-600">رنگ‌های پرکاربرد لوازم آرایشی</p>
        <div class="grid grid-cols-8 gap-1.5">
          <button
            v-for="preset in COSMETIC_COLOR_PRESETS"
            :key="preset.hex"
            type="button"
            :title="preset.name"
            :aria-label="preset.name"
            class="aspect-square rounded-md border border-black/10 transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-500"
            :class="preset.hex === currentHex ? 'ring-2 ring-brand-500 ring-offset-1' : ''"
            :style="{ backgroundColor: preset.hex }"
            @click="applyHex(preset.hex)"
          />
        </div>
      </div>

      <button
        type="button"
        class="w-full rounded-lg bg-brand-500 py-2 text-sm font-medium text-white transition hover:bg-brand-600 sm:hidden"
        @click="open = false"
      >
        تأیید رنگ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  COSMETIC_COLOR_PRESETS,
  hexToRgb,
  hsvToRgb,
  nearestPersianColorName,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
  type HsvColor,
} from '@nimoura/utils';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    disabled?: boolean;
  }>(),
  { label: '', disabled: false },
);

const emit = defineEmits<{
  'update:modelValue': [hex: string];
}>();

const FALLBACK_HEX = '#B76E79';

const rootRef = ref<HTMLElement | null>(null);
const areaRef = ref<HTMLElement | null>(null);
const open = ref(false);

const initialHex = normalizeHex(props.modelValue) ?? FALLBACK_HEX;
const hsv = ref<HsvColor>(rgbToHsv(hexToRgb(initialHex)!));
const hexDraft = ref<string>(initialHex);

const rgb = computed(() => hsvToRgb(hsv.value));
const currentHex = computed(() => rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b));
const colorName = computed(() => nearestPersianColorName(currentHex.value).name);
const hexInvalid = computed(() => !!hexDraft.value && !normalizeHex(hexDraft.value));

const channels = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
] as const;

const supportsEyeDropper = computed(() => import.meta.client && 'EyeDropper' in window);

// External value changed (e.g. when editing an existing product).
watch(
  () => props.modelValue,
  (value) => {
    const hex = normalizeHex(value);
    if (hex && hex !== currentHex.value) setFromHex(hex);
  },
);

// Keep the HEX field in sync while the user is not typing in it.
watch(currentHex, (hex) => {
  if (normalizeHex(hexDraft.value) !== hex) hexDraft.value = hex;
});

function commit() {
  emit('update:modelValue', currentHex.value);
}

function setFromHex(hex: string) {
  const parsed = hexToRgb(hex);
  if (!parsed) return;
  const next = rgbToHsv(parsed);
  // Gray/black/white colors carry no hue information; keep the current hue so the slider doesn't jump.
  if (next.s === 0 || next.v === 0) next.h = hsv.value.h;
  hsv.value = next;
}

function applyHex(hex: string) {
  setFromHex(hex);
  hexDraft.value = currentHex.value;
  commit();
}

/* HEX input */
function onHexInput() {
  const hex = normalizeHex(hexDraft.value.startsWith('#') ? hexDraft.value : `#${hexDraft.value}`);
  if (hex) {
    setFromHex(hex);
    commit();
  }
}

/* RGB inputs */
function onRgbInput(channel: 'r' | 'g' | 'b', event: Event) {
  const raw = Number((event.target as HTMLInputElement).value);
  if (Number.isNaN(raw)) return;
  const next = { ...rgb.value, [channel]: Math.min(255, Math.max(0, Math.round(raw))) };
  setFromHex(rgbToHex(next.r, next.g, next.b));
  commit();
}

/* Hue slider */
function onHueInput(event: Event) {
  hsv.value = { ...hsv.value, h: Number((event.target as HTMLInputElement).value) };
  commit();
}

/* Saturation / value area */
function updateFromPointer(event: PointerEvent) {
  const el = areaRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const v = 1 - Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  hsv.value = { ...hsv.value, s, v };
  commit();
}

function onAreaDown(event: PointerEvent) {
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  updateFromPointer(event);
}

function onAreaMove(event: PointerEvent) {
  if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) updateFromPointer(event);
}

function onAreaKey(event: KeyboardEvent) {
  const step = event.shiftKey ? 0.1 : 0.02;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, step],
    ArrowDown: [0, -step],
  };
  const move = moves[event.key];
  if (!move) return;
  event.preventDefault();
  hsv.value = {
    ...hsv.value,
    s: Math.min(1, Math.max(0, hsv.value.s + move[0])),
    v: Math.min(1, Math.max(0, hsv.value.v + move[1])),
  };
  commit();
}

/* Eyedropper (Chromium) */
async function pickFromScreen() {
  try {
    const dropper = new (window as any).EyeDropper();
    const result = await dropper.open();
    applyHex(result.sRGBHex);
  } catch {
    // user cancelled
  }
}

onClickOutside(rootRef, () => {
  open.value = false;
});
</script>

<style scoped>
.hue-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  outline: none;
}
.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.4);
  cursor: pointer;
}
.hue-slider::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.4);
  cursor: pointer;
}
.hue-slider:focus-visible {
  box-shadow: 0 0 0 2px rgb(183 110 121 / 0.6);
}
</style>

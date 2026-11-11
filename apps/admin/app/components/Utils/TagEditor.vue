<template>
  <div>
    <label class="text-sm font-semibold mb-3 text-gray-700">
      {{ label }}
    </label>

    <div class="space-y-3">
      <!-- انتخاب نوع تگ + ورودی مقدار -->
      <div class="flex gap-2">
        <select v-model="selectedType" class="border rounded px-3 py-2">
          <option disabled value="">نوع تگ را انتخاب کنید</option>
          <option
            v-for="item in tagTypesList"
            :key="item.type"
            :value="item.type"
          >
            {{ item.label }}
          </option>
        </select>

        <div class="relative flex-1">
          <input
            ref="inputEl"
            v-model="valueInput"
            @keydown.enter.prevent="tryAddFromInput"
            @focus="onFocus"
            @blur="onBlur"
            @paste="onPaste"
            :placeholder="
              selectedType ? 'مثلاً: آبرسان' : 'ابتدا نوع تگ را انتخاب کنید'
            "
            class="w-full border rounded px-3 py-2"
            :disabled="!selectedType"
          />

          <!-- پیشنهادها -->
          <div
            v-if="showSuggestions"
            class="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-64 overflow-auto"
          >
            <button
              v-for="opt in filteredSuggestions"
              :key="opt"
              class="w-full text-right px-3 py-2 hover:bg-gray-50"
              @mousedown.prevent="selectSuggestion(selectedType!, opt)"
            >
              {{ opt }}
            </button>

            <!-- حالت خالی: ساخت مقدار جدید -->
            <div
              v-if="filteredSuggestions.length === 0 && valueInput.trim()"
              class="px-3 py-2 text-sm text-gray-500"
              @mousedown.prevent="
                selectSuggestion(selectedType!, valueInput.trim())
              "
            >
              هنوز مقداری برای این نوع یافت نشد. ایجاد مقدار جدید: «{{
                valueInput.trim()
              }}»
            </div>
          </div>
        </div>

        <button
          class="px-4 py-2 rounded bg-black text-white disabled:opacity-40"
          :disabled="!selectedType || !valueInput.trim()"
          @click="tryAddFromInput"
        >
          افزودن
        </button>
      </div>

      <!-- چیپ‌ها -->
      <div
        v-for="group in grouped"
        :key="group.type"
        class="border rounded p-3"
      >
        <div class="text-sm font-semibold mb-2">
          {{ tagTypesList[group.type] ?? group.type }}
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="v in group.values"
            :key="group.type + ':' + v"
            class="inline-flex items-center gap-2 bg-gray-100 border rounded-full px-3 py-1"
          >
            <span>{{ v }}</span>
            <button
              class="text-gray-500 hover:text-red-600"
              @click="removeTag(group.type, v)"
              aria-label="حذف"
              title="حذف"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- راهنمای ورودی سریع -->
      <div class="text-xs text-gray-500">
        نکته: می‌توانید سریع بنویسید: <code>type:value</code> و Enter بزنید.
        مثال:
        <code>nature:کرم</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

type TagItem = { type: string; value: string };

const props = defineProps<{
  modelValue: TagItem[];
  /** اگر ندی، از /tag-types پر می‌کنیم */
  types?: string[];
  /** اگر ندی، از /filters پر می‌کنیم */
  suggestions?: Record<string, string[]>;
  typeLabels?: Record<string, string>;
  label?: string;
  /** پایه‌ی API (اگر پراکسی داری ممکنه /api باشه) */
  apiBase?: string;
}>();

const emit = defineEmits<{ (e: "update:modelValue", v: TagItem[]): void }>();

const API_BASE = computed(() => props.apiBase ?? ""); // مثلاً '' یا '/api'

/* -------------------- state -------------------- */
const selectedType = ref<string>("");
const valueInput = ref<string>("");

const typeLabelsComputed = computed(
  () =>
    props.typeLabels ?? [
      {
        type: "nature",
        label: "ماهیت محصول",
      },
      {
        type: "brand-line",
        label: "لاین برند",
      },
      {
        type: "skin-type",
        label: "نوع پوست",
      },
      {
        type: "hair-type",
        label: "جنس مو",
      },
      {
        type: "benefit",
        label: "مزیت",
      },
    ]
);

const internal = ref<TagItem[]>([...(props.modelValue ?? [])]);
watch(
  () => props.modelValue,
  (nv) => {
    if (nv) internal.value = [...nv];
  }
);

const grouped = computed(() => {
  const map: Record<string, string[] | any> = {};
  for (const t of internal.value) {
    map[t.type] = map[t.type] || [];
    if (!map[t.type].includes(t.value)) map[t.type].push(t.value);
  }
  return Object.entries(map).map(([type, values]) => ({ type, values }));
});

/* -------------------- types & suggestions -------------------- */

const allSuggestions = ref<Record<string, string[]>>(props.suggestions ?? {});
const filteredSuggestions = computed(() => {
  if (!selectedType.value) return [];
  const list = allSuggestions.value[selectedType.value] ?? [];
  const q = valueInput.value.trim();
  return q ? list.filter((x) => x.includes(q)) : list.slice(0, 10);
});

/* -------------------- focus & dropdown -------------------- */
const inputEl = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
function onFocus() {
  isFocused.value = true;
}
function onBlur() {
  setTimeout(() => {
    isFocused.value = false;
  }, 120);
}

const showSuggestions = computed(
  () =>
    isFocused.value &&
    !!selectedType.value &&
    valueInput.value.trim().length > 0
);

/* -------------------- API helpers -------------------- */
const tagTypesList = ref<any>([]);

async function fetchTagTypesIfNeeded() {
  if (props.types && props.typeLabels) {
    tagTypesList.value = props.typeLabels;
    return;
  }
  try {
    const res = await fetch(`${API_BASE.value}/types-label`);

    if (res.ok) {
      const rows = (await res.json()) as Array<{ type: string; label: string }>;

      tagTypesList.value = rows;
    }
  } catch {}
}

async function prefetchGroupedSuggestions() {
  if (props.suggestions) return;
  try {
    const res = await fetch(`${API_BASE.value}/filters`);
    if (res.ok) {
      const data = (await res.json()) as Record<string, string[]>;
      if (data && typeof data === "object") allSuggestions.value = data;
    }
  } catch {}
}

async function ensureTypeSuggestions(t: string, q?: string) {
  if (!t) return;
  // اگر قبلاً گروهی گرفتیم و q خالیه، نیاز نیست
  if (!q && (props.suggestions || allSuggestions.value[t]?.length)) return;
  try {
    const url = new URL(`${API_BASE.value}/suggest`, location.origin);
    url.searchParams.set("type", t);
    if (q?.trim()) url.searchParams.set("q", q.trim());
    url.searchParams.set("limit", "20");

    // اگر API_BASE خالیه، URL ریشه می‌سازه؛ برای SSR بهتره از fetch نسبی استفاده کنی:
    const res: any = await fetch(url.pathname + url.search);
    if (res.ok) {
      const data: any = (await res.json()) as {
        type: string;
        values: string[];
      };
      if (data?.data?.type) {
        // merge
        const prev = new Set(allSuggestions.value[data.data.type] ?? []);
        for (const v of data.data.values ?? []) prev.add(v);
        allSuggestions.value[data.data.type] = Array.from(prev);
      }
    }
  } catch {}
}

/* debounce ساده */
let debounceTimer: any = null;
watch([selectedType, valueInput], ([t, v]) => {
  if (!t) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const q = v?.trim();
    if (q) ensureTypeSuggestions(t, q);
  }, 250);
});

watch(selectedType, (t) => {
  valueInput.value = "";
  // وقتی نوع عوض شد، اگر لیست گروهی نداریم، یکبار ساجست با q خالی بگیر
  if (!allSuggestions.value[t]) ensureTypeSuggestions(t);
});

onMounted(async () => {
  await fetchTagTypesIfNeeded();
  await prefetchGroupedSuggestions();
});

/* -------------------- actions -------------------- */
function addTag(type: string, value: string) {
  type = type.trim();
  value = value.trim();
  if (!type || !value) return;
  const exists = internal.value.some(
    (i) => i.type === type && i.value === value
  );
  if (exists) return;
  internal.value.push({ type, value });
  emit("update:modelValue", internal.value);
  valueInput.value = "";
}

function selectSuggestion(type: string, opt: string) {
  addTag(type, opt);
  valueInput.value = "";
  isFocused.value = false;
  nextTick(() => inputEl.value?.focus());
}

function tryAddFromInput() {
  const raw = valueInput.value.trim();
  if (!raw) return;
  const colon = raw.indexOf(":");
  if (colon > 0) {
    const t = raw.slice(0, colon).trim();
    const v = raw.slice(colon + 1).trim();
    if (t && v) {
      addTag(t, v);
      return;
    }
  }
  if (selectedType.value) addTag(selectedType.value, raw);
}

function removeTag(type: string, value: string) {
  internal.value = internal.value.filter(
    (i) => !(i.type === type && i.value === value)
  );
  emit("update:modelValue", internal.value);
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  if (!text) return;
  e.preventDefault();
  const parts = text
    .split(/\s*[,|\n]\s*/g)
    .map((x) => x.trim())
    .filter(Boolean);
  for (const p of parts) {
    const idx = p.indexOf(":");
    if (idx > 0) addTag(p.slice(0, idx).trim(), p.slice(idx + 1).trim());
    else if (selectedType.value) addTag(selectedType.value, p);
  }
}
</script>

<template>
  <div
    :class="{ 'opacity-50': props.disabled }"
    ref="dropdownRef"
    class="relative text-right"
    dir="rtl"
  >
    <div class="flex items-center justify-between">
      <label
        class="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {{ label }}
      </label>

      <NuxtLink
        :to="showCreate.href"
        v-if="showCreate"
        class="text-brand-600 hover:text-brand-700 underline text-sm"
      >
        {{ showCreate.label }}
      </NuxtLink>
    </div>

    <input
      v-model="searchTerm"
      type="text"
      :disabled="props.disabled"
      :placeholder="placeholder"
      @focus="isOpen = true"
      class="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
    />

    <ul
      v-if="isOpen"
      class="absolute right-0 z-40 left-0 max-h-60 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg text-right"
    >
      <li
        v-for="item in filteredOptions"
        :key="item.id"
        @click="selectOption(item)"
        class="px-4 py-2 text-sm cursor-pointer bg-white hover:bg-gray-100"
      >
        {{ item.name }}
      </li>
      <li
        v-if="filteredOptions.length === 0"
        class="px-4 py-2 text-sm text-gray-500"
      >
        نتیجه‌ای یافت نشد
      </li>
    </ul>

    <span
      class="absolute inset-y-0 z-20 cursor-pointer transition-all duration-500 top-6 left-4 flex items-center text-gray-500"
      @click="isOpen = !isOpen"
      :class="{ 'rotate-180': isOpen }"
    >
      <svg
        class="stroke-current"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
          stroke=""
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  options: any[];
  modelValue: string | number | null;
  label?: string;
  placeholder?: string;
  showCreate?: { label: string; href: string } | null;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);
const searchTerm = ref("");
const isOpen = ref(false);
const dropdownRef = ref(null);

const filteredOptions = computed(() => {
  if (!searchTerm.value) return props.options;
  return props.options.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

function selectOption(option: { id: string | number; name: string }) {
  emit("update:modelValue", option.id);
  searchTerm.value = option.name;
  isOpen.value = false;
}

watch(searchTerm, (newVal) => {
  if (!newVal) {
    emit("update:modelValue", newVal);

    // selectedId.value = null
  }
});
watchEffect(() => {
  if (props.modelValue !== null && props.options?.length > 0) {
    const selected = props.options.find((item) => item.id === props.modelValue);
    if (selected) {
      searchTerm.value = selected.name;
    }
  }
});

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<style scoped>
ul {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.6) transparent;
}
</style>

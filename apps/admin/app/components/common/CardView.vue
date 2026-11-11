<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="(item, i) in safeData"
      :key="item?.id ?? i"
      class="relative border p-4 rounded-xl shadow-theme-xs hover:shadow-theme-md hover:border-brand-200 transition bg-white border-gray-200"
    >
      <!-- Item Image (Product, Brand, Banner, etc.) -->
      <div
        v-if="getCardImage(item)"
        class="w-full h-40 mb-4 mt-6 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200"
      >
        <img
          :src="getCardImage(item)"
          alt=""
          class="object-contain h-full w-full"
          loading="lazy"
        />
      </div>

      <!-- Selection Checkbox -->
      <div class="absolute top-2 left-2">
        <CommonCheckboxInput
          :modelValue="(selectedItems || []).some((s) => s.id === item.id)"
          @update:modelValue="$emit('toggleSelect', item)"
          :id="`card-select-${item?.id ?? i}`"
        />
      </div>

      <!-- Dropdown Menu -->
      <div class="absolute top-2 right-2">
        <div class="relative dropdown-container">
          <button
            type="button"
            @click.stop="open = open === item.id ? null : item.id"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
              />
            </svg>
          </button>

          <div
            v-if="open === item.id"
            class="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-50"
          >
            <NuxtLink
              :to="`/${props.urlEdit}/${item.id}`"
              class="w-full block text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              ✏️ ویرایش
            </NuxtLink>
            <button
              type="button"
              @click="$emit('deleteItem', item)"
              class="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              🗑 حذف
            </button>
          </div>
        </div>
      </div>

      <!-- Item Info -->
      <main :class="{ 'mt-6': !getCardImage(item) }">
        <div
          v-for="col in columns"
          :key="col.key"
          class="mb-2 text-sm flex gap-1 items-center flex-wrap"
        >
          <strong class="text-gray-600 font-medium">
            {{ col.label }}:
          </strong>

          <template v-for="cell in [formatCell(col, item)]" :key="col.key">
            <!-- Badge -->
            <span
              v-if="cell.type === 'badge'"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                cell.badgeClass || 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ cell.text }}
            </span>

            <!-- Plain or image-text -->
            <span v-else class="text-gray-800 font-medium">
              {{ cell.text }}
            </span>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  selectedItems: {
    type: Array,
    default: () => [],
  },
  urlEdit: String,
});

defineEmits(['toggleSelect', 'editItem', 'deleteItem']);

const open = ref(null);

const safeData = computed(() => (Array.isArray(props.data) ? props.data : []));

const getCardImage = (item) => {
  return (
    item?.thumbnail ||
    item?.imageUrl ||
    item?.logo ||
    item?.images?.[0]?.url ||
    ''
  );
};

const closeOnClickOutside = (e) => {
  if (!e.target.closest('.dropdown-container')) {
    open.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside);
});

const formatCell = (col, item) => {
  if (!item) return { type: 'text', text: '—' };
  const rawVal = item[col.key];

  if (!col.formatter) {
    return {
      type: 'text',
      text: rawVal != null && rawVal !== '' ? rawVal : '—',
    };
  }

  try {
    const res = col.formatter(rawVal, item);
    if (res == null || res === '') {
      return { type: 'text', text: '—' };
    }

    if (typeof res === 'object') {
      if ('badgeClass' in res) {
        return {
          type: 'badge',
          text: res.text != null && res.text !== '' ? res.text : '—',
          badgeClass: res.badgeClass || '',
        };
      }
      return {
        type: 'text',
        text: res.text != null && res.text !== '' ? res.text : '—',
      };
    }

    return { type: 'text', text: res };
  } catch (err) {
    return {
      type: 'text',
      text: rawVal != null && rawVal !== '' ? rawVal : '—',
    };
  }
};
</script>

<template>
  <table class="w-full table-auto border rounded-xl">
    <thead class="bg-gray-100 dark:bg-gray-800 text-right">
      <tr>
        <th class="p-2">
          <CommonCheckboxInput
            :modelValue="
              (props.data?.length ?? 0) > 0 &&
              props.data.every((d) => (selectedItems || []).some((s) => s.id === d.id))
            "
            id="select-all"
            @update:modelValue="() => emit('toggleSelectAll', props.data || [])"
          />
        </th>

        <th
          v-for="col in columns"
          :key="col.key"
          class="p-2 cursor-pointer select-none text-gray-700 dark:text-gray-300"
          @click="emitSort(col.key)"
        >
          <span class="inline-flex items-center gap-1">
            {{ col.label }}
            <span v-if="props.sortKey === col.key" class="text-xs">
              {{ props.sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </span>
        </th>
        <th class="p-2 text-gray-700 dark:text-gray-300">عملیات</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, i) in sortedData"
        :key="item?.id ?? i"
        class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800/50"
      >
        <td class="p-2">
          <CommonCheckboxInput
            :modelValue="(selectedItems || []).some((s) => s.id === item.id)"
            @update:modelValue="() => emit('toggleSelect', item)"
            :id="`select-${item?.id ?? i}`"
          />
        </td>

        <td v-for="col in columns" :key="col.key" class="p-2">
          <template v-for="cell in [formatCell(col, item)]" :key="col.key">
            <!-- Badge cell -->
            <span
              v-if="cell.type === 'badge'"
              :class="[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                cell.badgeClass || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
              ]"
            >
              {{ cell.text }}
            </span>

            <!-- Image + text cell -->
            <div
              v-else-if="cell.type === 'image-text'"
              class="flex items-center gap-3"
            >
              <div
                class="h-12 w-12 shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600"
              >
                <img
                  v-if="cell.image"
                  :src="cell.image"
                  class="h-full w-full object-cover"
                  alt="preview"
                  loading="lazy"
                />
                <svg
                  v-else
                  class="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <NuxtLink
                v-if="cell.link"
                target="_blank"
                :to="cell.link"
                class="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
              >
                {{ cell.text }}
              </NuxtLink>
              <span v-else class="text-sm font-medium text-gray-700 dark:text-gray-200">
                {{ cell.text }}
              </span>
            </div>

            <!-- Plain text cell -->
            <span v-else class="text-sm text-gray-700 dark:text-gray-300">
              {{ cell.text }}
            </span>
          </template>
        </td>

        <td class="p-2">
          <div class="relative dropdown-container">
            <button
              type="button"
              @click.stop="
                openDropdownId = openDropdownId === item.id ? null : item.id
              "
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              v-if="openDropdownId === item.id"
              class="absolute z-50 -left-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <NuxtLink
                :to="`/${props.urlEdit}/${item.id}`"
                class="w-full block text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ✏️ ویرایش
              </NuxtLink>
              <button
                type="button"
                @click="$emit('deleteItem', item)"
                class="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🗑 حذف
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
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
  sortKey: String,
  sortOrder: String,
  selectedItems: {
    type: Array,
    default: () => [],
  },
  urlEdit: String,
  serverSide: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'sort',
  'toggleSelect',
  'toggleSelectAll',
  'deleteItem',
]);

const openDropdownId = ref(null);

const closeOnClickOutside = (e) => {
  if (!e.target.closest('.dropdown-container')) {
    openDropdownId.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside);
});

const emitSort = (key) => {
  let order = 'asc';
  if (props.sortKey === key) {
    order = props.sortOrder === 'asc' ? 'desc' : 'asc';
  }
  emit('sort', { key, order });
};

const sortedData = computed(() => {
  const list = Array.isArray(props.data) ? props.data : [];
  if (props.serverSide || !props.sortKey) return list;
  return [...list].sort((a, b) => {
    const aVal = a?.[props.sortKey];
    const bVal = b?.[props.sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return props.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return props.sortOrder === 'asc'
      ? String(aVal ?? '').localeCompare(String(bVal ?? ''), 'fa')
      : String(bVal ?? '').localeCompare(String(aVal ?? ''), 'fa');
  });
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
      if ('image' in res || col.isCustom) {
        let link = null;
        if (props.urlEdit === 'product' && item.id && item.slug) {
          link = `https://nimoura.shop/product/${item.id}/${item.slug}`;
        }
        return {
          type: 'image-text',
          text: res.text != null && res.text !== '' ? res.text : '—',
          image: res.image || '',
          link,
        };
      }
      return {
        type: 'text',
        text: res.text != null ? res.text : '—',
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

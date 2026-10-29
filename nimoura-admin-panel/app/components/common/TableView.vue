<template>
  <table class="w-full table-auto border rounded-xl">
    <thead class="bg-gray-100 text-right">
      <tr>
        <th class="p-2">
          <!-- <input
            type="checkbox"
            :checked="
              props.data.length &&
              props.data.every((d) => selectedItems.find((s) => s.id === d.id))
            "
            @change="() => emit('toggleSelectAll', props.data)"
          /> -->
          <CommonCheckboxInput
            :modelValue="
              props.data.length &&
              props.data.every((d) => selectedItems.find((s) => s.id === d.id))
            "
            id="all"
            @update:modelValue="() => emit('toggleSelectAll', props.data)"
          />
        </th>

        <th
          v-for="col in columns"
          :key="col.key"
          class="p-2 cursor-pointer"
          @click="emitSort(col.key)"
        >
          {{ col.label }}
          <span v-if="props.sortKey === col.key">
            {{ props.sortOrder === "asc" ? "⬆️" : "⬇️" }}
          </span>
        </th>
        <th class="p-2">عملیات</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, i) in sortedData"
        :key="i"
        class="odd:bg-white even:bg-gray-50"
      >
        <td class="p-2">
          <!-- <input
            type="checkbox"
            :checked="selectedItems.find((s) => s.id === item.id)"
            @change="() => emit('toggleSelect', item)"
          /> -->
          <CommonCheckboxInput
            :modelValue="selectedItems.find((s) => s.id === item.id)"
            @update:modelValue="() => emit('toggleSelect', item)"
            :id="item.id"
          />
        </td>

        <td v-for="col in columns" :key="col.key" class="p-2">
          <!-- custom cell rendering -->
          <template v-if="col.isCustom && col.formatter">
            <NuxtLink
              target="_blank"
              :to="`https://nimoura.shop/product/${item.id}/${item.slug}`"
              class="flex items-center gap-3"
            >
              <div class="h-12 w-12">
                <img
                  :src="`${col.formatter(item[col.key], item).image}`"
                  class="h-12 w-12 rounded-md object-cover"
                  alt="preview"
                />
              </div>
              <span class="text-sm font-medium text-gray-700">
                {{ col.formatter(item[col.key], item).text }}
              </span>
            </NuxtLink>
          </template>

          <!-- default rendering -->
          <template v-else>
            {{ col.formatter ? col.formatter(item[col.key]) : item[col.key] }}
          </template>
        </td>

        <td class="p-2">
          <div class="relative dropdown-container">
            <button
              @click.stop="
                openDropdownId = openDropdownId === item.id ? null : item.id
              "
              class="text-gray-500"
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
  data: Array,
  columns: Array,
  sortKey: String,
  sortOrder: String,
  selectedItems: Array,
  urlEdit: String,
  serverSide: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "sort",
  "toggleSelect",
  "toggleSelectAll",
  "deleteItem",
]);

const sortKey = ref(props.sortKey || "");
const sortOrder = ref(props.sortOrder || "asc");
const openDropdownId = ref(null);

// بستن dropdown با کلیک بیرون
const closeOnClickOutside = (e) => {
  if (!e.target.closest(".dropdown-container")) {
    openDropdownId.value = null;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOnClickOutside);
});

const emitSort = (key) => {
  let order = "asc";
  if (props.sortKey === key) {
    order = props.sortOrder === "asc" ? "desc" : "asc";
  }
  emit("sort", { key, order });

  // اگر سمت کلاینت بود، می‌توانی local sort را هم اینجا انجام دهی (در آینده)
};

const sortedData = computed(() => {
  if (props.serverSide || !props.sortKey) return props.data;
  return [...props.data].sort((a, b) => {
    const aVal = a[props.sortKey];
    const bVal = b[props.sortKey];
    if (typeof aVal === "number")
      return props.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    return props.sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
});
</script>

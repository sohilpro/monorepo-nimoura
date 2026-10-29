<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="(item, i) in data"
      :key="i"
      class="relative border p-4 rounded-xl shadow-sm hover:shadow-md transition"
    >
      <!-- Product Image -->

      <div
        v-if="item?.thumbnail"
        :class="{ 'mt-5': item?.thumbnail }"
        class="w-full h-40 mb-4 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center"
      >
        <img
          :src="`${item.thumbnail}`"
          alt=""
          class="object-contain h-full w-full"
        />
      </div>

      <!-- Selection Checkbox -->
      <div class="absolute top-2 left-2">
        <CommonCheckboxInput
          :modelValue="selectedItems.find((s) => s.id === item.id)"
          @update:modelValue="$emit('toggleSelect', item)"
          :id="item.id"
        />
      </div>

      <!-- Dropdown Menu -->
      <div class="absolute top-2 right-2">
        <div class="relative dropdown-container">
          <button
            @click.stop="open = open === item.id ? null : item.id"
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
            v-if="open === item.id"
            class="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
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
      </div>

      <!-- Product Info -->
      <main :class="{ 'mt-5': !item?.thumbnail }">
        <div
          v-for="col in columns"
          :key="col.key"
          class="mb-1 text-sm flex gap-1 items-center"
        >
          <strong class="mt-1">{{ col.label }}:</strong>
          <!-- custom cell rendering -->

          <template v-if="col.isCustom && col.formatter">
            {{ col.formatter(item[col.key], item).text }}
          </template>
          <template v-else>
            {{ col.formatter ? col.formatter(item[col.key]) : item[col.key] }}
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Array,
  columns: Array,
  selectedItems: Array,
  urlEdit: String,
});

const emit = defineEmits(["toggleSelect", "editItem", "deleteItem"]);

const open = ref(null);

const closeOnClickOutside = (e) => {
  if (!e.target.closest(".dropdown-container")) {
    open.value = null;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOnClickOutside);
});
</script>

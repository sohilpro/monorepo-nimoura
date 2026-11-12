<template>
  <Drawer
    :visible="visible"
    position="bottom"
    modal
    dismissable
    :show-close-icon="false"
    :pt="{
      root: {
        class:
          '!h-auto !max-h-[75vh] !rounded-t-3xl !border-t !border-nimoura-text-100 !bg-white',
      },
      header: {
        class: '!border-b !border-nimoura-text-100 !px-4 !py-3',
      },
      content: {
        class: '!px-2 !py-2',
      },
    }"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="font-vazir text-sm font-semibold text-nimoura-text-800">
          مرتب‌سازی بر اساس
        </p>

        <Button
          icon="pi pi-times"
          text
          rounded
          size="small"
          severity="secondary"
          aria-label="بستن"
          class="!text-nimoura-text-400 hover:!bg-nimoura-primary/10 hover:!text-nimoura-primary"
          @click="handleClose"
        />
      </div>
    </template>

    <ul
      class="flex w-full flex-col gap-1"
      style="padding-bottom: max(env(safe-area-inset-bottom), 8px)"
    >
      <li v-for="option in options" :key="option.value">
        <Button
          text
          class="!flex !w-full !items-center !justify-between !rounded-xl !px-3 !py-3 !text-sm transition-all duration-200"
          :class="
            currentSort === option.value
              ? '!bg-nimoura-primary/10 !font-semibold !text-nimoura-primary'
              : '!font-normal !text-nimoura-text-700 hover:!bg-nimoura-text-100/60 hover:!text-nimoura-text-900'
          "
          @click="handleSortChange(option.value)"
        >
          <span>{{ option.label }}</span>

          <span
            v-if="currentSort === option.value"
            class="flex size-6 items-center justify-center rounded-full bg-nimoura-primary text-white"
          >
            <i class="pi pi-check text-xs!" />
          </span>
        </Button>
      </li>
    </ul>
  </Drawer>
</template>

<script setup lang="ts">
import {
  STOREFRONT_SORT_OPTIONS,
  STOREFRONT_SORT_VALUES,
  type StorefrontSort,
} from "@nimoura/shared-types";

interface SortOption {
  label: string;
  value: string;
}

const props = defineProps<{
  visible: boolean;
  close: () => void;
  options?: SortOption[];
  currentSort?: string;
}>();

const route = useRoute();
const router = useRouter();

function normalizeSort(raw: unknown): StorefrontSort {
  if (raw === "latest" || raw === "createdAt") return "newest";
  if (raw === "bestseller") return "popular";
  if (
    typeof raw === "string" &&
    (STOREFRONT_SORT_VALUES as readonly string[]).includes(raw)
  ) {
    return raw as StorefrontSort;
  }
  return "popular";
}

const currentSort = ref<string>(
  props.currentSort ?? normalizeSort(route.query.sort),
);

const options = computed(() =>
  props.options?.length ? props.options : [...STOREFRONT_SORT_OPTIONS],
);

function handleSortChange(sort: string) {
  currentSort.value = sort;

  router.push({
    query: {
      ...route.query,
      sort,
      page: 1,
    },
  });

  handleClose();
}

function handleClose() {
  props.close();
}

function onVisibleChange(nextVisible: boolean) {
  if (!nextVisible) handleClose();
}

watch(
  () => [props.currentSort, route.query.sort],
  ([propSort, querySort]) => {
    currentSort.value = propSort ?? normalizeSort(querySort);
  },
);
</script>

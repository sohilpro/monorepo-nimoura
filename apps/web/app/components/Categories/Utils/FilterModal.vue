<template>
  <Teleport to="body">
    <!-- BACKDROP -->
    <Transition name="fm-backdrop">
      <div
        v-if="visible"
        class="fixed inset-0 z-40 bg-nimoura-text-900/35 backdrop-blur-[2px]"
        @click="handleClose"
      />
    </Transition>

    <!-- FILTER SHEET -->
    <Transition name="fm-sheet">
      <div
        v-if="visible"
        class="fixed inset-x-0 bottom-0 z-90 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t border-nimoura-text-100 bg-white shadow-[0_-12px_40px_rgba(39,33,33,0.12)]"
        @click.stop
      >
        <!-- DRAG HANDLE -->
        <div
          class="flex w-full shrink-0 cursor-pointer justify-center pb-2 pt-3"
          @click="handleClose"
        >
          <div
            class="h-1.5 w-10 rounded-full bg-nimoura-text-200 transition-colors hover:bg-nimoura-primary/50"
          />
        </div>

        <!-- HEADER -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-nimoura-text-100 px-4 py-3"
        >
          <p class="font-vazir text-sm font-semibold text-nimoura-text-800">
            فیلترها
          </p>

          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-nimoura-text-400 transition-all hover:bg-nimoura-primary/10 hover:text-nimoura-primary active:scale-90"
            @click="handleClose"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- SCROLLABLE BODY -->
        <div class="min-h-0 flex-1 overflow-y-auto px-4 sm:px-5">
          <!-- AVAILABILITY -->
          <div
            class="flex items-center justify-between border-b border-nimoura-text-100 py-4"
          >
            <label
              for="available-products-toggle"
              class="cursor-pointer text-sm font-medium text-nimoura-text-700"
            >
              فقط کالاهای موجود
            </label>

            <ToggleSwitch
              v-model="showAvailableOnly"
              input-id="available-products-toggle"
              class="nimoura-toggle"
              :pt="{
                slider: {
                  class: showAvailableOnly
                    ? 'bg-nimoura-primary! '
                    : '',
                },
              }"
            />
          </div>

          <!-- ON SALE -->
          <div
            class="flex items-center justify-between border-b border-nimoura-text-100 py-4"
          >
            <label
              for="on-sale-toggle-m"
              class="cursor-pointer text-sm font-medium text-nimoura-text-700"
            >
              فقط تخفیف‌دارها
              <span
                v-if="facets?.counts?.onSale"
                class="text-[11px] font-normal text-nimoura-text-400"
              >
                ({{ numberFormat(facets.counts.onSale) }})
              </span>
            </label>

            <ToggleSwitch
              v-model="showOnSale"
              input-id="on-sale-toggle-m"
              class="nimoura-toggle"
              :pt="{ slider: { class: showOnSale ? 'bg-nimoura-primary! ' : '' } }"
            />
          </div>

          <!-- TAG FILTERS -->
          <div v-if="facets?.groups?.length" class="border-b border-nimoura-text-100">
            <CategoriesUtilsFacetGroups
              :groups="facets.groups"
              :selected="draftTags"
              @toggle="toggleDraftTag"
            />
          </div>

          <!-- PRICE RANGE -->
          <div class="py-5">
            <div class="mb-5 flex items-center justify-between">
              <p class="text-sm font-semibold text-nimoura-text-800">
                محدوده قیمت
              </p>

              <span
                class="rounded-full bg-nimoura-primary/10 px-2.5 py-1 text-[11px] font-medium text-nimoura-primary"
              >
                تومان
              </span>
            </div>

            <!-- SLIDER -->
            <Slider
              v-model="priceRange"
              range
              :min="MIN_PRICE"
              :max="maxPrice"
              :step="10000"
              class="nimoura-slider !mx-1"
            />

            <!-- PRICE VALUES -->
            <div class="mt-5 flex items-center justify-between gap-3">
              <!-- MIN -->
              <div
                class="flex-1 rounded-xl border border-nimoura-text-200 bg-nimoura-base/40 px-3 py-2.5 text-center transition-colors focus-within:border-nimoura-primary"
              >
                <span class="block text-[10px] text-nimoura-text-400">
                  حداقل
                </span>

                <span
                  class="mt-0.5 block text-xs font-semibold tabular-nums text-nimoura-text-800"
                >
                  {{ numberFormat(priceRange[0]) }}
                </span>
              </div>

              <span class="shrink-0 text-nimoura-text-300"> — </span>

              <!-- MAX -->
              <div
                class="flex-1 rounded-xl border border-nimoura-text-200 bg-nimoura-base/40 px-3 py-2.5 text-center transition-colors focus-within:border-nimoura-primary"
              >
                <span class="block text-[10px] text-nimoura-text-400">
                  حداکثر
                </span>

                <span
                  class="mt-0.5 block text-xs font-semibold tabular-nums text-nimoura-text-800"
                >
                  {{ numberFormat(priceRange[1]) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div
          class="flex shrink-0 items-center gap-3 border-t border-nimoura-text-100 bg-white px-4 py-3 sm:px-5"
          style="padding-bottom: max(env(safe-area-inset-bottom), 12px)"
        >
          <!-- CLEAR -->
          <button
            type="button"
            class="shrink-0 rounded-xl border border-nimoura-text-200 bg-white px-4 py-3 text-sm font-medium text-nimoura-text-600 transition-all hover:border-nimoura-primary/40 hover:bg-nimoura-primary/5 hover:text-nimoura-primary active:scale-[0.98]"
            @click="handleClearFilters"
          >
            حذف فیلترها
          </button>

          <!-- APPLY -->
          <button
            type="button"
            class="w-full rounded-xl bg-nimoura-primary py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(183,110,121,0.20)] transition-all hover:bg-[#a9606b] active:scale-[0.99] active:shadow-none"
            @click="handleApply"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ProductFacets } from '@nimoura/shared-types';

const props = defineProps<{
  visible: boolean;
  close: () => void;
  clearFilters: () => void;
  facets?: ProductFacets | null;
}>();

const route = useRoute();
const router = useRouter();

const MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5000000;

const maxPrice = computed(() => {
  const highest = props.facets?.price?.max ?? 0;
  return Math.max(DEFAULT_MAX_PRICE, Math.ceil(highest / 100000) * 100000);
});

const showAvailableOnly = ref(route.query.isAvailable === "true");
const showOnSale = ref(route.query.onSale === "true");
// تگ‌ها تا زدن «اعمال فیلتر» فقط پیش‌نویس هستند
const draftTags = ref<number[]>(parseIdList(route.query.tags));

const priceRange = ref<[number, number]>([
  Number(route.query.minPrice) || MIN_PRICE,
  Number(route.query.maxPrice) || maxPrice.value,
]);

function toggleDraftTag(id: number) {
  draftTags.value = draftTags.value.includes(id)
    ? draftTags.value.filter((t) => t !== id)
    : [...draftTags.value, id];
}

/**
 * Sync state when sheet opens
 */
watch(
  () => props.visible,
  (val) => {
    if (import.meta.client) {
      document.body.style.overflow = val ? "hidden" : "";
    }

    if (val) {
      showAvailableOnly.value = route.query.isAvailable === "true";
      showOnSale.value = route.query.onSale === "true";
      draftTags.value = parseIdList(route.query.tags);

      priceRange.value = [
        Number(route.query.minPrice) || MIN_PRICE,
        Number(route.query.maxPrice) || maxPrice.value,
      ];
    }
  },
  {
    immediate: true,
  },
);

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});

function handleApply() {
  router.push({
    query: {
      ...route.query,
      isAvailable: showAvailableOnly.value ? "true" : undefined,
      onSale: showOnSale.value ? "true" : undefined,
      tags: draftTags.value.length ? draftTags.value.join(",") : undefined,
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
      page: undefined,
    },
  });

  handleClose();
}

function handleClearFilters() {
  showAvailableOnly.value = false;
  showOnSale.value = false;
  draftTags.value = [];
  priceRange.value = [MIN_PRICE, maxPrice.value];

  props.clearFilters();

  handleClose();
}

function handleClose() {
  props.close();
}
</script>

<style scoped>
/* -------------------------------- */
/* Backdrop */
/* -------------------------------- */

.fm-backdrop-enter-active,
.fm-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.fm-backdrop-enter-from,
.fm-backdrop-leave-to {
  opacity: 0;
}

/* -------------------------------- */
/* Bottom Sheet */
/* -------------------------------- */

.fm-sheet-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.fm-sheet-leave-active {
  transition: transform 0.22s ease-in;
}

.fm-sheet-enter-from,
.fm-sheet-leave-to {
  transform: translateY(100%);
}

/* -------------------------------- */
/* PrimeVue Slider */
/* -------------------------------- */

:deep(.nimoura-slider .p-slider-range) {
  background: #b76e79;
}

:deep(.nimoura-slider .p-slider-handle) {
  width: 18px;
  height: 18px;
  border: 2px solid #b76e79;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(183, 110, 121, 0.22);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.nimoura-slider .p-slider-handle:hover) {
  box-shadow: 0 4px 14px rgba(183, 110, 121, 0.3);
}

:deep(.nimoura-slider .p-slider-handle:focus) {
  box-shadow:
    0 0 0 4px rgba(183, 110, 121, 0.12),
    0 4px 14px rgba(183, 110, 121, 0.2);
}

:deep(.nimoura-slider .p-slider-track) {
  background: #e9e6e6;
}
</style>

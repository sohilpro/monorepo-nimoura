<template>
  <Teleport to="body">
    <!-- BACKDROP -->
    <Transition name="sm-backdrop">
      <div
        v-if="visible"
        class="fixed inset-0 z-40 bg-nimoura-text-900/35 backdrop-blur-[2px]"
        @click="handleClose"
      />
    </Transition>

    <!-- BOTTOM SHEET -->
    <Transition name="sm-sheet">
      <div
        v-if="visible"
        class="fixed inset-x-0 bottom-0 z-90 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-nimoura-text-100 bg-white shadow-[0_-12px_40px_rgba(39,33,33,0.12)]"
        style="padding-bottom: max(env(safe-area-inset-bottom), 12px)"
        @click.stop
      >
        <!-- DRAG HANDLE -->
        <div
          class="flex w-full cursor-pointer justify-center pb-2 pt-3"
          @click="handleClose"
        >
          <div
            class="h-1.5 w-10 rounded-full bg-nimoura-text-200 transition-colors hover:bg-nimoura-primary/50"
          />
        </div>

        <!-- HEADER -->
        <div
          class="flex items-center justify-between border-b border-nimoura-text-100 px-4 py-3"
        >
          <p class="font-vazir text-sm font-semibold text-nimoura-text-800">
            مرتب سازی بر اساس
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

        <!-- OPTIONS -->
        <ul class="flex w-full flex-col px-2 py-2">
          <li
            v-for="option in options"
            :key="option.value"
            class="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3.5 text-sm transition-all duration-200 active:scale-[0.99]"
            :class="
              currentSort === option.value
                ? [
                    'bg-nimoura-primary/10',
                    'font-semibold',
                    'text-nimoura-primary',
                  ]
                : [
                    'text-nimoura-text-700',
                    'hover:bg-nimoura-text-100/60',
                    'hover:text-nimoura-text-900',
                  ]
            "
            @click="handleSortChange(option.value)"
          >
            <span>{{ option.label }}</span>

            <!-- CHECK -->
            <span
              v-if="currentSort === option.value"
              class="flex size-6 items-center justify-center rounded-full bg-nimoura-primary text-white"
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  close: () => void;
}>();

const route = useRoute();
const router = useRouter();

const currentSort = ref((route.query.sort as string) || "popular");

const options = [
  {
    label: "محبوب ترین",
    value: "popular",
  },
  {
    label: "پرفروش ترین",
    value: "bestseller",
  },
  {
    label: "جدید ترین",
    value: "latest",
  },
  {
    label: "ارزان ترین",
    value: "cheapest",
  },
  {
    label: "گران ترین",
    value: "expensive",
  },
];

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

watch(
  () => route.query.sort,
  (val) => {
    currentSort.value = (val as string) || "popular";
  },
);

watch(
  () => props.visible,
  (val) => {
    if (import.meta.client) {
      document.body.style.overflow = val ? "hidden" : "";
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
</script>

<style scoped>
/* Backdrop */
.sm-backdrop-enter-active,
.sm-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.sm-backdrop-enter-from,
.sm-backdrop-leave-to {
  opacity: 0;
}

/* Bottom Sheet */
.sm-sheet-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sm-sheet-leave-active {
  transition: transform 0.22s ease-in;
}

.sm-sheet-enter-from,
.sm-sheet-leave-to {
  transform: translateY(100%);
}
</style>

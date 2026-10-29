<template>
  <Dialog
    v-model:visible="open"
    modal
    position="top"
    :show-header="false"
    :draggable="false"
    :dismissable-mask="true"
    :style="{ width: '100%' }"
    :pt="{
      root: {
        class:
          '!m-0 !max-h-[92vh] !rounded-t-none !rounded-b-3xl !overflow-y-auto scrollbar-hide',
      },
      content: { class: '!p-0' },
    }"
  >
    <!-- Input bar -->
    <div
      class="sticky top-0 bg-white px-4 pt-4 pb-3 flex items-center gap-2 z-10"
    >
      <div
        class="flex-1 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-gray-500 transition-shadow"
        :style="query !== undefined ? focusRingStyle : null"
      >
        <i
          :class="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search'"
          class="text-base shrink-0"
        />

        <InputText
          ref="inputEl"
          v-model="query"
          placeholder="جستجو در همه کالاها"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          inputmode="search"
          enterkeyhint="search"
          unstyled
          class="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          @keydown.enter="submit"
          @focus="focused = true"
          @blur="focused = false"
        />

        <Button
          v-if="query"
          text
          rounded
          size="small"
          icon="pi pi-times"
          aria-label="پاک کردن جستجو"
          class="!size-6 !text-gray-400"
          @click="query = ''"
        />
      </div>

      <Button
        text
        rounded
        icon="pi pi-times"
        aria-label="بستن جستجو"
        class="!text-gray-500"
        @click="close"
      />
    </div>

    <div class="px-4 pb-6 space-y-5">
      <!-- Trending (idle state) -->
      <div v-if="!query">
        <p class="flex items-center gap-1 text-sm text-gray-500">
          <i class="pi pi-bolt text-sm" />
          جستجوهای پرطرفدار
        </p>
        <ul class="flex flex-wrap gap-2 mt-3">
          <li v-for="trend in trends" :key="trend.href">
            <NuxtLink :to="trend.href" @click="close">
              <Chip
                :label="`#${trend.title}`"
                :pt="{
                  root: {
                    class:
                      'trend-chip !bg-gray-100  !text-gray-600  !cursor-pointer transition-colors',
                  },
                }"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="isLoading && !hasAnyResult" class="space-y-2.5">
        <Skeleton
          v-for="n in 5"
          :key="n"
          height="4rem"
          border-radius="0.5rem"
        />
      </div>

      <!-- Results -->
      <template v-else-if="query">
        <div v-if="categoryResults.length" class="mt-4">
          <span class="text-xs font-medium text-nimoura-text-500">
            دسته‌بندی‌ها
          </span>

          <div
            data-test="search-result--categories"
            class="mt-2 flex flex-wrap items-center gap-1.5"
          >
            <NuxtLink
              v-for="item in categoryResults"
              :key="`cat-${item.id}`"
              :to="`/categories/${item.id}/${createSlug(item.name)}`"
              class="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg border border-nimoura-border bg-white px-3 py-1.5 text-xs font-medium text-nimoura-text-700 transition-all duration-200 hover:border-nimoura-primary hover:bg-nimoura-base hover:text-nimoura-primary"
              @click="close"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="brandResults.length" class="mt-4">
          <span class="text-xs font-medium text-nimoura-text-500">
            برندها
          </span>

          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <NuxtLink
              v-for="item in brandResults"
              :key="`brand-${item.id}`"
              :to="`/brand/${createSlug(item.name)}?id=${item.id}`"
              class="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg border border-nimoura-border bg-white px-3 py-1.5 text-xs font-medium text-nimoura-text-700 transition-all duration-200 hover:border-nimoura-primary hover:bg-nimoura-base hover:text-nimoura-primary"
              @click="close"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="products.length">
          <span class="text-nimoura-text-700 font-semibold text-sm">
            جستجو در میان محصولات
          </span>
          <ul class="mt-3 flex flex-col gap-2.5">
            <li v-for="item in products" :key="item.id">
              <NuxtLink
                :to="`/product/${item.id}/${createSlug(item.title)}`"
                class="flex items-center gap-2 rounded border border-gray-200 p-1 transition-colors product-link"
                @click="close"
              >
                <img
                  :src="item.thumbnail"
                  :alt="item.title"
                  width="55"
                  height="55"
                  loading="lazy"
                  class="size-16 shrink-0 object-cover rounded"
                />
                <span class="grow text-right text-xs lg:text-sm line-clamp-2">
                  {{ item.title }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <p
          v-if="!hasAnyResult && !isLoading"
          class="py-10 text-center text-sm text-gray-400"
        >
          نتیجه‌ای برای «{{ query }}» پیدا نشد
        </p>
      </template>
    </div>
  </Dialog>
</template>

<script setup>
const open = defineModel("open", { type: Boolean, default: false });

const router = useRouter();
const route = useRoute();
const { fetchQuickSearch } = useSearch();
const { isLoading } = useLoading();

const inputEl = ref(null);
const query = ref("");
const focused = ref(false);
const products = ref([]);
const categoryResults = ref([]);
const brandResults = ref([]);

const trends = [
  { title: "ضد آفتاب", href: `/categories/6/${createSlug("ضد آفتاب")}` },
  { title: "آبرسان", href: `/categories/25/${createSlug("آبرسان")}` },
  { title: "ژل شستشو", href: `/categories/26/${createSlug("ژل شستشو")}` },
];

const focusRingStyle = computed(() =>
  focused.value
    ? {
        boxShadow: `0 0 0 2px color-mix(in srgb, var(--color-nimoura-primary) 40%, transparent)`,
      }
    : null,
);
const hasAnyResult = computed(
  () =>
    products.value.length ||
    categoryResults.value.length ||
    brandResults.value.length,
);

let requestId = 0;

// یک درخواست واحد به‌جای سه درخواست جدا (محصول + دسته + برند با هم از بک‌اند می‌آید)
// از VueUse برای debounce استفاده شده — درخواست فقط ۴۰۰ میلی‌ثانیه بعد از
// آخرین تایپ کاربر ارسال می‌شود
const runSearch = useDebounceFn(async (term) => {
  const id = ++requestId;
  isLoading.value = true;

  try {
    const res = await fetchQuickSearch(term);

    // اگه در این فاصله کاربر عبارت جدیدی تایپ کرده، این نتیجه‌ی قدیمی رو نادیده بگیر
    if (id !== requestId) return;

    products.value = res?.data?.products ?? [];
    categoryResults.value = res?.data?.categories ?? [];
    brandResults.value = res?.data?.brands ?? [];
  } catch (err) {
    if (id !== requestId) return;
    console.error("[MobileSearchDialog] quick search error:", err);
    products.value = [];
    categoryResults.value = [];
    brandResults.value = [];
  } finally {
    if (id === requestId) isLoading.value = false;
  }
}, 400);

watch(query, (term) => {
  if (!term) {
    requestId++;
    products.value = [];
    categoryResults.value = [];
    brandResults.value = [];
    isLoading.value = false;
    return;
  }
  runSearch(term);
});

function submit() {
  if (!query.value.trim()) return;
  router.push({ path: "/search", query: { q: query.value.trim() } });
  close();
}

function close() {
  open.value = false;
}

function reset() {
  query.value = "";
  products.value = [];
  categoryResults.value = [];
  brandResults.value = [];
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => inputEl.value?.$el?.focus());
  } else {
    reset();
  }
});

watch(
  () => route.fullPath,
  () => close(),
);
</script>

<style scoped>
.result-link:hover,
.product-link:hover {
  color: var(--color-nimoura-primary);
  border-color: var(--color-nimoura-primary);
}

:deep(.trend-chip:hover) {
  background: var(--color-nimoura-primary) !important;
  color: #fff !important;
}
</style>

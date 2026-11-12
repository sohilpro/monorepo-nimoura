<template>
  <div class="relative z-100">
    <!-- SEARCH INPUT -->
    <div
      class="flex w-84 cursor-text items-center gap-2 overflow-hidden rounded-full border bg-white p-1 transition-all duration-200"
      :class="
        searchOpen
          ? 'z-50 border-nimoura-primary shadow-sm'
          : 'border-nimoura-border'
      "
      @click="openSearch"
    >
      <!-- Search Button -->
      <div
        class="flex-center size-9 shrink-0 rounded-full bg-nimoura-primary text-white"
      >
        <i v-if="!isLoading" class="pi pi-search text-sm" />
        <i v-else class="pi pi-spin pi-spinner text-sm" />
      </div>

      <!-- Input -->
      <input
        ref="searchInput"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        inputmode="search"
        enterkeyhint="search"
        placeholder="جستجو در نیمورا..."
        class="w-full bg-transparent text-sm text-nimoura-text-800 outline-none placeholder:text-nimoura-text-400"
        :value="query"
        @focus="openSearch"
        @keydown.esc="closeSearch"
        @keydown="handleKeydown"
        @input="onSearchInput($event.target.value)"
        @compositionend="onSearchInput($event.target.value)"
      />

      <!-- Clear -->
      <button
        v-if="query.length"
        type="button"
        class="flex-center size-9 shrink-0 rounded-full text-nimoura-text-400 transition-colors hover:bg-nimoura-base hover:text-nimoura-text-700"
        @click.stop="clearQuery"
      >
        <i class="pi pi-times text-xs" />
      </button>
    </div>

    <!-- RESULTS PANEL -->
    <Transition name="search-fade">
      <div
        v-if="searchOpen"
        class="absolute search-scrollbar top-14 z-20 flex max-h-[75vh] w-112.5 flex-col overflow-y-auto rounded-2xl border border-nimoura-border/60 bg-white p-4 shadow-xl transition-all duration-300"
        :class="{ '!w-84': !query.length }"
      >
        <!-- RESULTS STATE -->
        <div v-if="query.length">
          <!-- Search Query -->
          <p class="flex items-center gap-1 text-sm text-nimoura-text-600">
            نتیجه جستجو برای:

            <span class="font-vazir font-medium text-nimoura-primary">
              {{ query }}
            </span>
          </p>

          <!-- LOADING -->
          <div v-if="isLoading" class="mt-4 flex flex-col gap-2">
            <Skeleton
              v-for="i in 3"
              :key="i"
              height="2.5rem"
              borderRadius="10px"
            />
          </div>

          <template v-else>
            <!-- EMPTY STATE -->
            <div
              v-if="!hasAnyResult"
              class="flex flex-col items-center gap-2 py-10 text-center text-nimoura-text-400"
            >
              <div class="flex-center size-12 rounded-full bg-nimoura-base">
                <i class="pi pi-search text-lg text-nimoura-text-400" />
              </div>

              <p class="text-sm text-nimoura-text-500">
                نتیجه‌ای برای
                <span class="font-medium text-nimoura-text-700">
                  «{{ query }}»
                </span>
                پیدا نشد
              </p>
            </div>

            <!-- CATEGORIES -->
            <div v-if="categoryResult.length" class="mt-4">
              <span class="text-xs font-medium text-nimoura-text-500">
                دسته‌بندی‌ها
              </span>

              <div
                data-test="search-result--categories"
                class="mt-2 flex flex-wrap items-center gap-1.5"
              >
                <NuxtLink
                  v-for="item in categoryResult"
                  :key="`cat-${item.id}`"
                  :to="`/categories/${item.slug || createSlug(item.name)}`"
                  class="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg border border-nimoura-border bg-white px-3 py-1.5 text-xs font-medium text-nimoura-text-700 transition-all duration-200 hover:border-nimoura-primary hover:bg-nimoura-base hover:text-nimoura-primary"
                  @click="closeSearch"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </div>

            <!-- BRANDS -->
            <div v-if="brandResults.length" class="mt-4">
              <span class="text-xs font-medium text-nimoura-text-500">
                برندها
              </span>

              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <NuxtLink
                  v-for="item in brandResults"
                  :key="`brand-${item.id}`"
                  :to="`/brand/${encodeURIComponent(item.slug || createSlug(item.name))}`"
                  class="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg border border-nimoura-border bg-white px-3 py-1.5 text-xs font-medium text-nimoura-text-700 transition-all duration-200 hover:border-nimoura-primary hover:bg-nimoura-base hover:text-nimoura-primary"
                  @click="closeSearch"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </div>

            <!-- PRODUCTS -->
            <div v-if="productResults.length" class="mt-5">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-nimoura-text-800">
                  محصولات
                </span>

                <span class="text-[11px] text-nimoura-text-400 font-modam">
                  {{ productResults.length }} نتیجه
                </span>
              </div>

              <ul class="mt-3 flex flex-col gap-2">
                <li v-for="item in productResults" :key="item.id">
                  <NuxtLink
                    :to="`/product/${encodeURIComponent(item.slug || createSlug(item.title))}`"
                    class="group flex items-center gap-3 rounded-xl border border-nimoura-border/70 bg-white p-2 transition-all duration-200 hover:border-nimoura-primary hover:bg-nimoura-base"
                    @click="closeSearch"
                  >
                    <!-- Product Image -->
                    <NuxtImg
                      :src="item.thumbnail"
                      :alt="item.title"
                      width="55"
                      height="55"
                      format="webp"
                      class="size-14 shrink-0 rounded-lg object-cover"
                    />

                    <!-- Product Title -->
                    <span
                      class="line-clamp-2 grow text-right text-xs font-medium text-nimoura-text-700 transition-colors group-hover:text-nimoura-primary"
                    >
                      {{ item.title }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>

              <!-- ALL RESULTS -->
              <NuxtLink
                :to="`/search?q=${encodeURIComponent(query)}`"
                class="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-nimoura-border bg-nimoura-base py-2.5 text-xs font-medium text-nimoura-primary transition-all duration-200 hover:border-nimoura-primary"
                @click="closeSearch"
              >
                مشاهده همه نتایج

                <i class="pi pi-arrow-up-left text-[10px]" />
              </NuxtLink>
            </div>
          </template>
        </div>

        <!-- TRENDING STATE -->
        <div v-else>
          <p
            class="flex items-center gap-1.5 text-sm font-medium text-nimoura-text-600"
          >
            <span class="flex-center size-6 rounded-full bg-nimoura-base">
              <i class="pi pi-bolt text-xs text-nimoura-primary" />
            </span>

            جستجوهای پرطرفدار
          </p>

          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="trend in trends" :key="trend.title">
              <NuxtLink :to="trend.href" @click="closeSearch">
                <Chip
                  :label="`#${trend.title}`"
                  class="!cursor-pointer !border !border-nimoura-border !bg-white !text-xs !text-nimoura-text-600 transition-all hover:!border-nimoura-primary hover:!bg-nimoura-base hover:!text-nimoura-primary"
                />
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </Transition>

    <!-- OVERLAY -->
    <Transition name="search-fade">
      <div
        v-if="searchOpen"
        class="fixed inset-0 -z-10 h-screen w-screen bg-nimoura-text-900/15"
        @click="closeSearch"
      />
    </Transition>
  </div>
</template>

<script setup>
import { createSlug } from '@nimoura/utils';

const router = useRouter();
const { fetchQuickSearch } = useSearch();

const searchOpen = ref(false);
const searchInput = ref(null);

const query = ref("");
const isLoading = ref(false);
const categoryResult = ref([]);
const brandResults = ref([]);
const productResults = ref([]);

const hasAnyResult = computed(
  () =>
    categoryResult.value.length ||
    brandResults.value.length ||
    productResults.value.length,
);

const { categories: allCategories } = useCategories();

function trendHref(title) {
  const stack = [...(allCategories.value ?? [])];
  while (stack.length) {
    const node = stack.shift();
    if (node.slug && (node.name === title || node.name?.includes(title))) {
      return `/categories/${node.slug}`;
    }
    if (node.children?.length) stack.push(...node.children);
  }
  return `/search?q=${encodeURIComponent(title)}`;
}

const trends = computed(() => [
  { title: "ضد آفتاب", href: trendHref("ضد آفتاب") },
  { title: "آبرسان", href: trendHref("آبرسان") },
  { title: "ژل شستشو", href: trendHref("ژل شستشو") },
]);

/* ───────────────────────  Search Logic  ─────────────────────── */
// یک درخواست واحد به ماژول سرچ (محصول + دسته + برند با هم)
let requestId = 0;

const onSearchInput = useDebounceFn(async (val) => {
  query.value = val;

  if (!query.value.trim()) {
    requestId++;
    categoryResult.value = [];
    brandResults.value = [];
    productResults.value = [];
    isLoading.value = false;
    return;
  }

  const id = ++requestId;
  isLoading.value = true;

  try {
    const res = await fetchQuickSearch(query.value.trim());

    // اگه در این فاصله کاربر عبارت جدیدی تایپ کرده، این نتیجه‌ی قدیمی رو نادیده بگیر
    if (id !== requestId) return;

    productResults.value = res?.data?.products ?? [];
    categoryResult.value = res?.data?.categories ?? [];
    brandResults.value = res?.data?.brands ?? [];
  } catch (err) {
    if (id !== requestId) return;
    console.error("Search error:", err);
    productResults.value = [];
    categoryResult.value = [];
    brandResults.value = [];
  } finally {
    if (id === requestId) isLoading.value = false;
  }
}, 400);

function clearQuery() {
  onSearchInput("");
  searchInput.value?.focus();
}

function openSearch() {
  searchOpen.value = true;
  nextTick(() => searchInput.value?.focus());
}

function closeSearch() {
  searchOpen.value = false;
  onSearchInput("");
}

function handleKeydown(e) {
  if (e.key === "Enter" && query.value.trim()) {
    router.push({ path: "/search", query: { q: query.value.trim() } });
    closeSearch();
  }
}

watch(searchOpen, (isOpen) => {
  document.documentElement.style.overflow = isOpen ? "hidden" : "";
});

onUnmounted(() => {
  document.documentElement.style.overflow = "";
});
</script>

<style scoped>
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.search-scrollbar:hover {
  scrollbar-color: rgba(183, 110, 121, 0.35) transparent;
}

.search-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.search-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.search-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}

.search-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(183, 110, 121, 0.35);
}

.search-scrollbar:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(183, 110, 121, 0.55);
}
</style>

<template>
  <div class="w-full bg-nimoura-dark relative z-50">
    <div
      class="max-w-360 mx-auto px-4 md:px-8 flex items-center justify-start h-14"
    >
      <ul class="flex items-center gap-6 text-sm font-medium text-white h-full">
        <!-- آیتم مگامنو: دسته بندی محصولات -->
        <li
          class="group relative flex items-center h-full cursor-pointer whitespace-nowrap transition-all text-white hover:text-nimoura-primary"
        >
          <div class="flex items-center gap-1 py-2">
            <span>دسته بندی محصولات</span>
            <span
              class="pi pi-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"
            ></span>
          </div>

          <div
            class="absolute right-0 top-full z-50 hidden w-screen max-w-360 pt-1 transform group-hover:block transition-all duration-200"
            style="margin-right: -16px"
          >
            <div
              class="bg-white shadow-2xl border border-neutral-200 rounded-b-md flex text-right h-112.5 w-full"
            >
              <!-- LOADING STATE -->
              <div
                v-if="pending"
                class="flex w-full items-center justify-center"
              >
                <ProgressSpinner
                  style="width: 32px; height: 32px"
                  stroke-width="4"
                />
              </div>

              <template v-else>
                <!-- ستون راست مگامنو (دسته‌بندی‌های اصلی) -->
                <div
                  class="w-58.75 shrink-0 bg-gray-50/80 p-4 border-l border-gray-100 overflow-y-auto flex flex-col gap-1"
                >
                  <div
                    v-for="mainCat in categories"
                    :key="mainCat.id"
                    @mouseenter="activeMegaTab = mainCat.id"
                    class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all font-medium"
                    :class="
                      activeMegaTab === mainCat.id
                        ? 'bg-gray-50 text-nimoura-primary shadow-sm'
                        : 'text-nimoura-text-700 hover:bg-gray-100/70'
                    "
                  >
                    <span class="flex items-center gap-2">
                      <span
                        v-if="mainCat.icon"
                        :class="mainCat.icon"
                        class="text-sm"
                      ></span>
                      {{ mainCat.name }}
                    </span>
                    <span
                      class="pi pi-angle-left text-xs"
                      :class="
                        activeMegaTab === mainCat.id
                          ? 'text-nimoura-primary'
                          : 'text-nimoura-text-400'
                      "
                    ></span>
                  </div>
                </div>

                <!-- ستون چپ مگامنو (زیرمجموعه‌ها) -->
                <div class="w-[calc(100%-235px)] p-6 overflow-y-auto bg-white">
                  <div
                    v-if="currentSubCategories.length"
                    class="grid grid-cols-3 gap-8"
                  >
                    <div
                      v-for="subCat in currentSubCategories"
                      :key="subCat.id"
                      class="flex flex-col gap-3"
                    >
                      <NuxtLink
                        :to="`/categories/${subCat.id}/${createSlug(subCat.name)}`"
                        class="font-bold text-gray-900 border-r-2 border-nimoura-primary pr-2 hover:text-nimoura-primary transition-colors"
                      >
                        {{ subCat.name }}
                      </NuxtLink>

                      <div class="flex flex-col gap-2 pr-3">
                        <NuxtLink
                          v-for="child in subCat.children"
                          :key="child.id"
                          :to="`/categories/${child.id}/${createSlug(child.name)}`"
                          class="text-sm text-gray-500 hover:text-nimoura-primary transition-colors"
                        >
                          {{ child.name }}
                        </NuxtLink>
                      </div>
                    </div>
                  </div>

                  <p v-else class="text-sm text-nimoura-text-400">
                    زیرمجموعه‌ای برای نمایش وجود ندارد
                  </p>
                </div>
              </template>
            </div>
          </div>
        </li>

        <!-- باقی منوهای استاتیک -->
        <li
          v-for="item in staticMenuItems"
          :key="item.label"
          class="flex items-center h-full"
        >
          <NuxtLink
            :to="item.to"
            class="text-white hover:text-nimoura-primary font-medium transition-colors py-2 flex items-center gap-1"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import ProgressSpinner from "primevue/progressspinner";

const { categories, pending } = useCategories();
const activeMegaTab = ref(null);

// وقتی دیتا لود شد، اولین دسته به‌عنوان تب فعال پیش‌فرض انتخاب بشه
watch(
  categories,
  (val) => {
    if (val.length && activeMegaTab.value === null) {
      activeMegaTab.value = val[0].id;
    }
  },
  { immediate: true },
);

const currentSubCategories = computed(() => {
  const current = categories.value.find(
    (cat) => cat.id === activeMegaTab.value,
  );
  return current?.children ?? [];
});

const staticMenuItems = [
  { label: "جادوی نیمورا", to: "/videos" },
  { label: "جدیدترین‌ها", to: "/news" },
  { label: "تخفیف ویژه", to: "/product/amazing" },
  { label: "مجله نیمورا", to: "/magazine" },
  { label: "بیا داخل مغازه", to: "/store-3d?from=header" },
];
</script>

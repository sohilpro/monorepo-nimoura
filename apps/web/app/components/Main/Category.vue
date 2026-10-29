<template>
  <section class="mx-4 lg:container mt-20">
    <!-- SECTION TITLE -->
    <div
      class="flex flex-col gap-y-4 xs:flex-row items-center justify-between w-full text-center xs:text-start"
    >
      <div class="flex items-center gap-x-2 sm:gap-x-4">
        <span class="size-12 hidden xs:flex rounded-lg shadow-lg flex-center">
          <svg class="size-7 text-gray-700 dark:text-gray-100">
            <use href="#squares"></use>
          </svg>
        </span>
        <div class="space-y-1 md:space-y-1">
          <h3
            class="text-xl md:text-2xl font-modam font-medium text-nimoura-text-700 dark:text-white"
          >
            دسـته بندی هـای
            <span class="text-nimoura-primary">محبوب</span>
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            جدیدترین و بروزترین دسته بندی ها
          </p>
        </div>
      </div>
    </div>

    <!-- ✅ 2. محتوای واقعی -->
    <ClientOnly>
      <div
        v-if="(data?.data?.banners?.length ?? 0) > 0"
        class="mt-12 flex gap-x-6 overflow-x-auto touch-pan-x scroll-smooth no-scrollbar"
      >
        <NuxtLink
          v-for="(item, index) in data?.data?.banners"
          :key="index"
          :to="
            item.category
              ? `/categories/${item.category.id}/${createSlug(item.category.name)}`
              : `/brand/${createSlug(item.brand.name)}?id=${item.brand.id}`
          "
          class="group flex-none flex flex-col items-center gap-y-1 cursor-pointer text-nimoura-text-700 dark:text-white"
        >
          <NuxtImg
            loading="lazy"
            :src="item.images[0].url"
            class="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] object-cover rounded-full group-hover:grayscale group-hover:opacity-90 duration-300"
            :alt="item.title"
          />
          <p
            class="pt-1 text-sm lg:text-base line-clamp-1 max-w-[100px] lg:max-w-[120px] text-center"
          >
            {{ item.title }}
          </p>
        </NuxtLink>
      </div>
      <template #fallback>
        <div
          class="flex items-center justify-evenly flex-wrap mt-12 child:mb-8 gap-x-8 animate-pulse"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="flex flex-col items-center gap-y-1 duration-300 cursor-pointer text-nimoura-text-700 dark:text-white relative"
          >
            <div
              class="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] bg-gray-200 dark:bg-gray-700 rounded-full object-cover"
            ></div>
            <div class="pt-1 text-sm lg:text-lg">
              <div
                class="w-16 h-4 mt-1 bg-gray-300 dark:bg-gray-600 rounded-md"
              ></div>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
const { data, error }: any = await useFetch("/api/banners/list", {
  query: {
    position: "CATEGORY_SIDEBAR",
    sortOrder: "ASC",
  },
});
</script>

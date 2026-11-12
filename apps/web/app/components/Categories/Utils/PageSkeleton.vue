<template>
  <main class="container" aria-busy="true" aria-label="در حال بارگذاری محصولات">
    <!-- BREADCRUMB SKELETON -->
    <div class="mt-4 flex items-center gap-x-2 sm:mt-6">
      <Skeleton width="3rem" height="0.85rem" border-radius="0.375rem" />
      <Skeleton width="0.4rem" height="0.4rem" shape="circle" />
      <Skeleton width="4.5rem" height="0.85rem" border-radius="0.375rem" />
      <Skeleton width="0.4rem" height="0.4rem" shape="circle" />
      <Skeleton width="5.5rem" height="0.85rem" border-radius="0.375rem" />
    </div>

    <!-- CATEGORY H1 TITLE SKELETON -->
    <div class="mt-3">
      <Skeleton width="10rem" height="1.5rem" border-radius="0.5rem" />
    </div>

    <div class="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:gap-5">
      <!-- DESKTOP SIDEBAR SKELETON (SideFilterBox match) -->
      <aside
        class="hidden h-fit shrink-0 flex-col rounded-2xl border border-nimoura-text-100 bg-white py-4 shadow-sm lg:flex lg:w-1/4"
      >
        <div class="flex items-center justify-between px-3 xl:px-4">
          <Skeleton width="4.5rem" height="1.25rem" border-radius="0.375rem" />
          <Skeleton width="4rem" height="0.9rem" border-radius="0.375rem" />
        </div>

        <Divider class="!my-3 !border-nimoura-text-100" />

        <div class="flex items-center justify-between px-3 py-3 xl:px-4">
          <Skeleton width="6.5rem" height="0.95rem" border-radius="0.375rem" />
          <Skeleton width="2.5rem" height="1.4rem" border-radius="999px" />
        </div>

        <Divider class="!my-1 !border-nimoura-text-100" />

        <div class="flex items-center justify-between px-3 py-3 xl:px-4">
          <Skeleton width="5.5rem" height="0.95rem" border-radius="0.375rem" />
          <Skeleton width="2.5rem" height="1.4rem" border-radius="999px" />
        </div>

        <Divider class="!my-1 !border-nimoura-text-100" />

        <!-- FACET GROUPS SKELETON (first open, second collapsed) -->
        <div class="space-y-2.5 px-3 py-3.5 xl:px-4">
          <div class="flex items-center justify-between">
            <Skeleton width="5.5rem" height="0.95rem" border-radius="0.375rem" />
            <Skeleton width="0.85rem" height="0.85rem" border-radius="0.25rem" />
          </div>
          <div v-for="t in 3" :key="t" class="flex items-center gap-2.5 pt-1">
            <Skeleton width="1.15rem" height="1.15rem" border-radius="0.375rem" />
            <Skeleton width="60%" height="0.85rem" border-radius="0.375rem" />
            <Skeleton
              width="1.5rem"
              height="0.75rem"
              border-radius="0.25rem"
              class="ms-auto"
            />
          </div>
        </div>

        <Divider class="!my-1 !border-nimoura-text-100" />

        <div class="flex items-center justify-between px-3 py-3.5 xl:px-4">
          <Skeleton width="5rem" height="0.95rem" border-radius="0.375rem" />
          <Skeleton width="0.85rem" height="0.85rem" border-radius="0.25rem" />
        </div>

        <Divider class="!my-1 !border-nimoura-text-100" />

        <!-- PRICE RANGE SKELETON -->
        <div class="space-y-4 px-3 pt-3 xl:px-4">
          <div class="flex items-center justify-between">
            <Skeleton width="5rem" height="0.95rem" border-radius="0.375rem" />
            <Skeleton width="0.85rem" height="0.85rem" border-radius="0.25rem" />
          </div>
          <Skeleton width="100%" height="0.4rem" border-radius="999px" />
          <div class="flex items-center justify-between gap-2">
            <Skeleton width="42%" height="2rem" border-radius="0.5rem" />
            <Skeleton width="42%" height="2rem" border-radius="0.5rem" />
          </div>
        </div>
      </aside>

      <!-- MAIN COLUMN -->
      <div class="min-w-0 flex-1 lg:w-3/4">
        <!-- MOBILE TOOLBAR SKELETON -->
        <div class="mb-2 flex items-center gap-2 lg:hidden">
          <Skeleton width="6rem" height="2.125rem" border-radius="999px" />
          <Skeleton width="5rem" height="2.125rem" border-radius="999px" />
          <Skeleton
            width="3.25rem"
            height="1rem"
            border-radius="0.375rem"
            class="ms-auto"
          />
        </div>

        <!-- DESKTOP SORT BAR SKELETON -->
        <div
          class="mb-5 hidden items-center justify-between gap-4 rounded-xl lg:flex lg:py-2 xl:mb-6"
        >
          <div class="flex items-center gap-3">
            <Skeleton width="5.5rem" height="1.25rem" border-radius="0.375rem" />
            <Skeleton
              v-for="s in 4"
              :key="s"
              width="4.25rem"
              height="1.85rem"
              border-radius="0.5rem"
            />
          </div>
          <Skeleton
            width="3.75rem"
            height="1.15rem"
            border-radius="0.375rem"
            class="me-5"
          />
        </div>

        <!-- PRODUCTS GRID SKELETON -->
        <CategoriesUtilsProductGridSkeleton :count="pageSize" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    pageSize?: number;
  }>(),
  {
    pageSize: 9,
  },
);
</script>

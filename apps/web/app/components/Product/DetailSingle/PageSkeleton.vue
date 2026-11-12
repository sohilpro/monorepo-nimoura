<template>
  <div aria-busy="true" aria-label="در حال بارگذاری اطلاعات محصول">
    <!-- BREADCRUMB SKELETON -->
    <div class="mt-4 flex items-center gap-x-2 sm:mt-6">
      <Skeleton width="2.75rem" height="0.85rem" border-radius="0.375rem" />
      <Skeleton width="0.4rem" height="0.4rem" shape="circle" />
      <Skeleton width="4.5rem" height="0.85rem" border-radius="0.375rem" />
      <Skeleton width="0.4rem" height="0.4rem" shape="circle" />
      <Skeleton width="8.5rem" height="0.85rem" border-radius="0.375rem" />
    </div>

    <!-- HERO SECTION: IMAGE + INFO + PRICE BOX -->
    <section class="mt-2.5 flex flex-col items-start gap-4 lg:flex-row">
      <!-- Image + Info Card -->
      <div
        class="w-full rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_6px_24px_rgba(39,33,33,0.04)] sm:p-5 lg:min-w-0 lg:flex-1"
      >
        <div
          class="flex flex-col items-start justify-start gap-x-8 md:flex-row xl:gap-x-5"
        >
          <!-- Image Gallery Skeleton -->
          <div class="flex w-full flex-col items-center gap-y-4 md:w-2/4">
            <!-- Mobile Horizontal Strip -->
            <div class="flex w-full gap-1.5 overflow-hidden md:hidden">
              <Skeleton
                v-for="n in 2"
                :key="`ms-${n}`"
                width="14rem"
                height="14rem"
                border-radius="1rem"
                class="shrink-0"
              />
            </div>

            <!-- Desktop Main Image + Thumbnails -->
            <div class="hidden w-full flex-col gap-y-4 md:flex">
              <div class="aspect-square w-full overflow-hidden rounded-xl">
                <Skeleton width="100%" height="100%" border-radius="0.75rem" />
              </div>
              <div class="flex w-full gap-x-2">
                <div
                  v-for="n in 5"
                  :key="`ts-${n}`"
                  class="aspect-square w-[18%] shrink-0 overflow-hidden rounded-lg"
                >
                  <Skeleton width="100%" height="100%" border-radius="0.5rem" />
                </div>
              </div>
            </div>
          </div>

          <!-- Info Column Skeleton -->
          <div
            class="mt-3 flex w-full flex-col gap-y-3 md:w-3/4 lg:mt-0 lg:gap-y-6"
          >
            <!-- Brand / SubBrand -->
            <div class="flex items-center gap-2">
              <Skeleton width="4rem" height="0.95rem" border-radius="0.375rem" />
              <Skeleton width="0.4rem" height="0.4rem" shape="circle" />
              <Skeleton width="5rem" height="0.95rem" border-radius="0.375rem" />
            </div>

            <!-- Title, English Title & Actions -->
            <div class="flex flex-col gap-y-2.5">
              <Skeleton width="88%" height="1.5rem" border-radius="0.5rem" />
              <Skeleton width="45%" height="0.9rem" border-radius="0.375rem" />
              <div class="flex items-center gap-2 pt-0.5">
                <Skeleton width="1.75rem" height="1.75rem" shape="circle" />
                <Skeleton width="1.75rem" height="1.75rem" shape="circle" />
                <Skeleton width="4.5rem" height="1.15rem" border-radius="0.375rem" />
                <Skeleton width="4rem" height="1.35rem" border-radius="999px" />
              </div>
            </div>

            <!-- Short Description -->
            <div class="space-y-2 pt-1">
              <Skeleton width="100%" height="0.85rem" border-radius="0.375rem" />
              <Skeleton width="76%" height="0.85rem" border-radius="0.375rem" />
            </div>

            <!-- Variant Swatches -->
            <div class="space-y-2 pt-1">
              <Skeleton width="5.5rem" height="0.85rem" border-radius="0.375rem" />
              <div class="flex gap-2">
                <Skeleton
                  v-for="v in 4"
                  :key="`vs-${v}`"
                  width="2rem"
                  height="2rem"
                  shape="circle"
                />
              </div>
            </div>

            <!-- Specifications Preview -->
            <div class="flex flex-col gap-y-3 pt-1">
              <div class="flex items-center justify-between">
                <Skeleton width="4.5rem" height="1.2rem" border-radius="0.375rem" />
                <Skeleton
                  width="4rem"
                  height="0.9rem"
                  border-radius="0.375rem"
                  class="md:hidden"
                />
              </div>

              <!-- Mobile horizontal spec cards -->
              <div class="flex gap-2 overflow-hidden md:hidden">
                <Skeleton
                  v-for="s in 3"
                  :key="`msp-${s}`"
                  width="9.375rem"
                  height="4rem"
                  border-radius="0.5rem"
                  class="shrink-0"
                />
              </div>

              <!-- Desktop grid spec cards -->
              <div class="hidden grid-cols-12 gap-2 md:grid">
                <div
                  v-for="s in 6"
                  :key="`dsp-${s}`"
                  class="col-span-6 xl:col-span-4"
                >
                  <Skeleton width="100%" height="4rem" border-radius="0.5rem" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop PriceBox Skeleton -->
      <aside
        class="hidden w-full shrink-0 flex-col gap-5 rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] lg:flex lg:w-[290px] xl:w-[320px]"
      >
        <div class="flex items-center justify-between border-b border-nimoura-text-100/80 pb-3.5">
          <Skeleton width="5.5rem" height="0.95rem" border-radius="0.375rem" />
          <Skeleton width="4.5rem" height="1.5rem" border-radius="999px" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Skeleton width="5.5rem" height="0.9rem" border-radius="0.375rem" />
            <Skeleton width="4rem" height="1.25rem" border-radius="999px" />
          </div>
          <div class="flex items-baseline justify-between">
            <Skeleton width="3.5rem" height="0.85rem" border-radius="0.375rem" />
            <Skeleton width="8rem" height="1.75rem" border-radius="0.5rem" />
          </div>
        </div>
        <Skeleton width="100%" height="2.75rem" border-radius="0.75rem" />
        <Skeleton width="100%" height="2.75rem" border-radius="0.75rem" />
        <div class="space-y-2.5 border-t border-nimoura-text-100/80 pt-3.5">
          <Skeleton width="85%" height="0.8rem" border-radius="0.375rem" />
          <Skeleton width="78%" height="0.8rem" border-radius="0.375rem" />
          <Skeleton width="68%" height="0.8rem" border-radius="0.375rem" />
        </div>
      </aside>
    </section>

    <!-- SIMILAR SLIDER SKELETON -->
    <section class="mt-5 w-full">
      <div class="flex items-center gap-x-3 sm:gap-x-4">
        <Skeleton
          width="3rem"
          height="3rem"
          border-radius="1rem"
          class="hidden xs:block"
        />
        <div class="space-y-1.5">
          <Skeleton width="8.5rem" height="1.35rem" border-radius="0.5rem" />
        </div>
      </div>
      <div class="mt-5 flex gap-2.5 overflow-hidden px-6 sm:gap-3">
        <div v-for="c in 6" :key="`sim-${c}`" class="flex-none">
          <ProductCardSkeleton />
        </div>
      </div>
    </section>

    <!-- LOWER TWO-COLUMN CONTENT SKELETON -->
    <section class="mt-10 flex flex-col items-start gap-4 lg:flex-row">
      <div class="flex w-full min-w-0 flex-col gap-4 lg:flex-1">
        <!-- Introduce Card Skeleton -->
        <div class="w-full rounded-2xl border border-nimoura-text-100 bg-white p-5 space-y-3">
          <Skeleton width="4.5rem" height="1.25rem" border-radius="0.375rem" />
          <Skeleton width="100%" height="0.85rem" border-radius="0.375rem" />
          <Skeleton width="92%" height="0.85rem" border-radius="0.375rem" />
          <Skeleton width="70%" height="0.85rem" border-radius="0.375rem" />
        </div>

        <!-- Specifications Card Skeleton -->
        <div class="w-full overflow-hidden rounded-2xl border border-nimoura-border/60 bg-white">
          <div class="flex items-center gap-3 border-b border-nimoura-border/60 px-5 py-4">
            <Skeleton width="2.5rem" height="2.5rem" border-radius="0.75rem" />
            <Skeleton width="7.5rem" height="1.2rem" border-radius="0.375rem" />
          </div>
          <div v-for="r in 4" :key="`spec-sk-${r}`" class="flex items-center gap-4 px-5 py-3.5">
            <Skeleton width="28%" height="0.85rem" border-radius="0.375rem" />
            <Skeleton width="48%" height="0.85rem" border-radius="0.375rem" />
          </div>
        </div>

        <!-- Reviews Card Skeleton -->
        <div class="w-full rounded-2xl border border-gray-200 bg-white px-3 py-4 sm:p-6">
          <Skeleton width="8rem" height="1.35rem" border-radius="0.375rem" class="mb-5" />
          <div class="flex flex-col gap-5 xl:flex-row">
            <Skeleton
              width="100%"
              height="16rem"
              border-radius="1rem"
              class="xl:w-72! shrink-0"
            />
            <div class="min-w-0 flex-1 space-y-4">
              <Skeleton width="100%" height="7.5rem" border-radius="0.75rem" />
              <Skeleton width="100%" height="8rem" border-radius="0.75rem" />
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Sticky AsidePrice Skeleton -->
      <aside
        class="hidden w-[300px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:block xl:w-[320px]"
      >
        <div class="aspect-[4/3] w-full">
          <Skeleton width="100%" height="100%" border-radius="0" />
        </div>
        <div class="flex flex-col gap-4 p-5">
          <Skeleton width="7rem" height="1.5rem" border-radius="0.5rem" />
          <Skeleton width="100%" height="2.5rem" border-radius="0.75rem" />
          <Skeleton width="100%" height="2.25rem" border-radius="0.75rem" />
        </div>
      </aside>
    </section>

    <!-- MOBILE STICKY BOTTOM BAR SKELETON -->
    <div
      class="fixed inset-x-0 bottom-0 z-70 border-t border-nimoura-text-100/90 bg-white/95 px-3.5 pt-2 shadow-[0_-4px_20px_rgba(39,33,33,0.06)] backdrop-blur-md lg:hidden"
      :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }"
    >
      <div class="mx-auto flex max-w-screen-md items-center justify-between gap-3">
        <Skeleton width="8.5rem" height="2.25rem" border-radius="0.75rem" />
        <div class="flex flex-col items-end gap-1">
          <Skeleton width="4.5rem" height="0.75rem" border-radius="0.25rem" />
          <Skeleton width="6.5rem" height="1.15rem" border-radius="0.375rem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BannerLayout } from "#shared/types/banners";

const props = withDefaults(
  defineProps<{
    positionKey: string;
    layout?: BannerLayout;
    title?: string;
    viewAllLink?: string;
    autoplay?: number | false;
    heightClass?: string;
    aspectClass?: string;
    mobileScroll?: boolean;
    showTitle?: boolean;
    contained?: boolean;
    spacingClass?: string;
    lazy?: boolean;
  }>(),
  {
    layout: "carousel",
    autoplay: 4500,
    contained: true,
    spacingClass: "mt-3 sm:mt-6",
    // 🟢 مقدار پیش‌فرض استاندارد و متناسب
    heightClass: "aspect-[16/7] sm:aspect-[21/8] lg:aspect-[3/1]",
  },
);

const { banners, loading, start } = useBanners(() => props.positionKey, {
  lazy: props.lazy,
});

const listKey = computed(() => banners.value.map((b) => b.id).join("-"));

const root = useTemplateRef<HTMLElement>("root");

if (props.lazy) {
  onMounted(() => {
    const { stop } = useIntersectionObserver(
      root,
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
          stop();
        }
      },
      { rootMargin: "300px 0px" },
    );
  });
}
</script>

<template>
  <section
    v-if="loading || banners.length"
    ref="root"
    class="w-full"
    :class="[
      contained && 'mx-auto max-w-7xl px-3 sm:px-6 lg:px-8',
      spacingClass,
    ]"
  >
    <!-- Header -->
    <header v-if="title" class="mb-3 flex items-center justify-between sm:mb-4">
      <h2
        class="flex items-center gap-2 text-base font-extrabold text-vecaro-primary sm:text-lg"
      >
        <span
          class="h-5 w-1 rounded-full bg-vecaro-accent"
          aria-hidden="true"
        />
        {{ title }}
      </h2>
      <NuxtLink
        v-if="viewAllLink"
        :to="viewAllLink"
        class="text-xs font-medium text-vecaro-primary/70 transition-colors hover:text-vecaro-accent sm:text-sm"
      >
        مشاهده همه
      </NuxtLink>
    </header>

    <template v-if="layout === 'carousel'">
      <!-- 🟢 استفاده از همان heightClass برای لودینگ جهت جلوگیری از Layout Shift -->
      <div
        v-if="loading"
        class="w-full animate-pulse rounded-2xl bg-vecaro-primary/10"
        :class="heightClass"
      />
      <BannersCarousel
        v-else
        :key="listKey"
        :banners="banners"
        :autoplay="autoplay"
        :height-class="heightClass"
      />
    </template>

    <BannersGrid
      v-else
      :key="listKey"
      :banners="banners"
      :layout="layout"
      :loading="loading"
      :height-class="heightClass"
      :aspect-class="aspectClass"
      :mobile-scroll="mobileScroll"
      :show-title="showTitle"
    />
  </section>
</template>

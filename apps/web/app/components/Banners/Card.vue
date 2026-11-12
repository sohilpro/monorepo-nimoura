<script setup lang="ts">
import { NuxtLink } from "#components";
import type { BannerItem } from "#shared/types/banners";

const props = withDefaults(
  defineProps<{
    banner: BannerItem;
    priority?: boolean; // اولین بنر بالای صفحه (LCP) → eager + fetchpriority=high
    sizes?: string;
    overlay?: boolean; // گرادینت تیره پایین تصویر
    showTitle?: boolean;
    track?: boolean;
  }>(),
  { sizes: "100vw", track: true },
);

const tracker = useBannerTracker();
const el = useTemplateRef<HTMLElement>("el");

// Impression: حداقل ۵۰٪ بنر و حداقل ۱ ثانیه دیده شود
let timer: ReturnType<typeof setTimeout> | undefined;
const { stop } = useIntersectionObserver(
  el,
  ([entry]) => {
    if (!props.track) return;
    clearTimeout(timer);
    if (entry?.isIntersecting) {
      timer = setTimeout(() => {
        tracker.view(props.banner.id);
        stop();
      }, 1000);
    }
  },
  { threshold: 0.5 },
);
onScopeDispose(() => clearTimeout(timer));

const onClick = () => props.track && tracker.click(props.banner.id);
const onAuxClick = (e: MouseEvent) => e.button === 1 && onClick(); // کلیک وسط ماوس
</script>

<template>
  <component
    :is="banner.link ? NuxtLink : 'div'"
    ref="el"
    v-bind="banner.link ? { to: banner.link, target: banner.target } : {}"
    class="group/banner relative block size-full overflow-hidden bg-vecaro-primary/5 outline-vecaro-accent focus-visible:outline-2 focus-visible:-outline-offset-4"
    @click="onClick"
    @auxclick="onAuxClick"
  >
    <picture class="block size-full">
      <source
        v-if="banner.mobileImage"
        media="(max-width: 639px)"
        :srcset="formatImageUrl(banner.mobileImage)"
      />
      <img
        :src="formatImageUrl(banner.image)"
        :alt="banner.alt"
        :sizes="sizes"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        draggable="false"
        class="size-full select-none object-cover object-center transition-transform duration-700 ease-out group-hover/banner:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover/banner:scale-100"
      />
    </picture>

    <!-- <div
      v-if="overlay || showTitle"
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-vecaro-primary/60 via-transparent to-transparent"
    /> -->
    <p
      v-if="showTitle && banner.title"
      class="absolute inset-x-0 bottom-0 p-4 text-sm font-bold text-white sm:p-5 sm:text-base"
    >
      {{ banner.title }}
    </p>
  </component>
</template>

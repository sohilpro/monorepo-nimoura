<template>
  <nav class="mt-4 w-full sm:mt-6" aria-label="Breadcrumb">
    <ol
      class="breadcrumb-scroll flex w-full flex-nowrap items-center gap-x-1.5 overflow-x-auto whitespace-nowrap pb-1 text-xs text-nimoura-text-600 sm:gap-x-2 sm:text-sm"
    >
      <!-- HOME / FIRST ITEM -->
      <li v-if="items.length > 0" class="flex shrink-0 items-center">
        <NuxtLink
          :to="getLink(items[0])"
          class="group inline-flex items-center gap-x-1.5 rounded-md px-1 py-0.5 transition-colors duration-200 hover:text-nimoura-primary"
        >
          <span>{{ items[0].label }}</span>
        </NuxtLink>
      </li>

      <!-- OTHER ITEMS -->
      <template
        v-for="(item, index) in items.slice(1)"
        :key="getLink(item) || `${item.label}-${index}`"
      >
        <!-- SEPARATOR -->
        <li
          class="flex shrink-0 items-center text-nimoura-text-300"
          aria-hidden="true"
        >
          <svg
            class="size-3 rtl:rotate-180 sm:size-3.5"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="m1 9 4-4-4-4"
            />
          </svg>
        </li>

        <!-- ITEM -->
        <li class="flex shrink-0 items-center">
          <!-- دارای لینک (دسته‌های والد) -->
          <NuxtLink
            v-if="getLink(item)"
            :to="getLink(item)"
            class="group inline-flex items-center rounded-md px-1 py-0.5 transition-colors duration-200 hover:text-nimoura-primary"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>

          <!-- آیتم جاری -->
          <span
            v-else
            class="inline-flex items-center px-1 py-0.5 font-medium text-nimoura-primary"
            aria-current="page"
          >
            <span>{{ item.label }}</span>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string;
  href?: string;
  to?: string;
}

const props = withDefaults(
  defineProps<{
    items?: BreadcrumbItem[] | any;
  }>(),
  {
    items: () => [],
  },
);

// استخراج لینک از هر دو فیلد to یا href
function getLink(item?: BreadcrumbItem): string | undefined {
  return item?.to || item?.href;
}

function isHome(item?: BreadcrumbItem): boolean {
  const link = getLink(item);
  return link === "/" || link === "";
}

const listRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    const current = listRef.value?.querySelector('[aria-current="page"]')
    current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
})
</script>

<style scoped>
.breadcrumb-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.breadcrumb-scroll::-webkit-scrollbar {
  display: none;
}
</style>
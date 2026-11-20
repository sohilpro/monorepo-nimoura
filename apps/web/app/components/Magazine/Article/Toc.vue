<script setup lang="ts">
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

const props = defineProps<{
  items: TocItem[];
  activeId?: string;
}>();

const isMobileOpen = ref(false);

function scrollToHeading(id: string) {
  isMobileOpen.value = false;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<template>
  <div v-if="items.length > 0">
    <!-- نسخه موبایل: آکاردئون جمع‌شونده در بالای مقاله -->
    <div class="lg:hidden mb-8 rounded-2xl border border-nimoura-border/40 bg-white p-4 shadow-xs">
      <button
        type="button"
        class="flex w-full items-center justify-between text-right"
        @click="isMobileOpen = !isMobileOpen"
      >
        <span class="flex items-center gap-2 font-display text-sm font-bold text-nimoura-velvet">
          <i class="pi pi-list text-nimoura-primary" />
          فهرست مطالب این مقاله ({{ items.length }} بخش)
        </span>
        <i
          class="pi pi-chevron-down text-xs text-nimoura-text-400 transition-transform duration-300"
          :class="{ 'rotate-180': isMobileOpen }"
        />
      </button>

      <nav v-show="isMobileOpen" class="mt-4 pt-3 border-t border-nimoura-border/30 space-y-2">
        <button
          v-for="(item, idx) in items"
          :key="item.id"
          type="button"
          class="block w-full text-right text-xs py-1 transition-colors"
          :class="[
            item.level === 3 ? 'pr-4 text-nimoura-text-500' : 'font-medium text-nimoura-text-700',
            activeId === item.id ? '!text-nimoura-primary font-bold' : 'hover:text-nimoura-primary'
          ]"
          @click="scrollToHeading(item.id)"
        >
          {{ idx + 1 }}. {{ item.text }}
        </button>
      </nav>
    </div>

    <!-- نسخه دسکتاپ: سایدبار چسبان (Sticky) با هایلایت فعال -->
    <div class="hidden lg:block sticky top-24 rounded-3xl border border-nimoura-border/40 bg-white p-6 shadow-xs">
      <div class="flex items-center gap-2.5 pb-4 mb-4 border-b border-nimoura-border/30">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
          <i class="pi pi-align-right text-sm" />
        </span>
        <div>
          <h3 class="font-display text-sm font-bold text-nimoura-velvet">فهرست مطالب</h3>
          <span class="text-[11px] text-nimoura-text-400">دسترسی سریع به بخش‌ها</span>
        </div>
      </div>

      <nav class="max-h-[calc(100vh-220px)] overflow-y-auto space-y-1.5 pl-1 custom-scroll">
        <button
          v-for="(item, idx) in items"
          :key="item.id"
          type="button"
          class="group flex w-full items-start text-right text-xs leading-relaxed py-1.5 px-2.5 rounded-xl transition-all"
          :class="[
            item.level === 3 ? 'mr-3 text-nimoura-text-500' : 'font-medium text-nimoura-text-700',
            activeId === item.id
              ? 'bg-nimoura-primary/10 !text-nimoura-primary font-bold'
              : 'hover:bg-nimoura-base hover:text-nimoura-velvet'
          ]"
          @click="scrollToHeading(item.id)"
        >
          <span class="ml-2 font-mono text-[10px] text-nimoura-text-400 group-hover:text-nimoura-primary shrink-0">
            {{ idx + 1 }}.
          </span>
          <span class="line-clamp-2">{{ item.text }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2d9d9;
  border-radius: 9999px;
}
</style>

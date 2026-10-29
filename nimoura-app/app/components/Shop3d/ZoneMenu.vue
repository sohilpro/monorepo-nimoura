<!-- app/components/shop3d/ZoneMenu.vue -->
<script setup lang="ts">
const { activeZone, goTo } = useShopControls()
</script>

<template>
  <nav
    class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    aria-label="بخش‌های مغازه"
  >
    <ul
      class="pointer-events-auto flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-nimoura-velvet/70 p-1.5 shadow-xl backdrop-blur-md [scrollbar-width:none]"
    >
      <li v-for="v in VIEWPOINTS" :key="v.id" class="shrink-0">
        <button
          type="button"
          class="min-h-10 rounded-full px-4 text-sm whitespace-nowrap transition-colors"
          :class="
            activeZone === v.id
              ? 'bg-nimoura-primary text-white'
              : 'text-nimoura-base/90 hover:bg-white/10'
          "
          :aria-current="activeZone === v.id ? 'true' : undefined"
          @click="goTo(v.id)"
        >
          {{ v.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>
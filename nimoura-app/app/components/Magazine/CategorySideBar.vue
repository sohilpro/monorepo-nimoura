<script setup lang="ts">
const { data: categories } = useMagazineCategoriesTree();
const route = useRoute();
</script>

<template>
  <aside class="rounded-2xl bg-white p-5 ring-1 ring-nimoura-border/40">
    <h3 class="mb-4 font-display text-base font-bold text-nimoura-velvet">دسته‌بندی مجله</h3>

    <ul class="space-y-1">
      <li>
        <NuxtLink
          to="/magazine"
          class="block rounded-lg px-3 py-2 text-sm transition"
          :class="route.path === '/magazine' ? 'bg-nimoura-primary text-white' : 'text-nimoura-text-600 hover:bg-nimoura-accent/15'"
        >
          همه مطالب
        </NuxtLink>
      </li>
      <li v-for="cat in categories" :key="cat.id">
        <NuxtLink
          :to="`/magazine/category/${cat.slug}`"
          class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition"
          :class="route.params.slug === cat.slug ? 'bg-nimoura-primary text-white' : 'text-nimoura-text-600 hover:bg-nimoura-accent/15'"
        >
          <span class="flex items-center gap-2">
            <i v-if="cat.icon" :class="`pi ${cat.icon}`" />
            {{ cat.name }}
          </span>
        </NuxtLink>

        <ul v-if="cat.children?.length" class="mr-4 mt-1 space-y-1 border-r border-nimoura-border/40 pr-3">
          <li v-for="child in cat.children" :key="child.id">
            <NuxtLink
              :to="`/magazine/category/${child.slug}`"
              class="block rounded-lg px-3 py-1.5 text-xs text-nimoura-text-500 hover:bg-nimoura-accent/15 hover:text-nimoura-primary"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

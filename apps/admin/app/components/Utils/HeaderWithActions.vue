<template>
  <div class="flex items-end justify-between mb-6">
    <!-- Breadcrumb -->
    <div>
      <nav class="text-sm text-muted-foreground mb-1">
        <ol class="flex items-center space-x-1 rtl:space-x-reverse">
          <li
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            class="flex items-center"
          >
            <span v-if="index > 0" class="mx-1 text-muted-foreground">›</span>
            <NuxtLink
              v-if="index !== breadcrumbs.length - 1"
              :to="crumb.href"
              class="text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span v-else class="text-foreground font-medium text-blue-500">
              {{ crumb.label }}
            </span>
          </li>
        </ol>
      </nav>
      <h2 class="text-3xl mt-3 font-bold tracking-tight">{{ title }}</h2>
      <p class="text-muted-foreground mt-1">{{ subtitle }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        v-if="discardLabel"
        class="border rounded-md px-4 py-2 text-sm text-foreground hover:bg-accent"
        @click="$emit('discard')"
      >
        {{ discardLabel }}
      </button>

      <button
        v-if="publishLabel"
        :form
        class="bg-blue-500 text-white flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-500/90"
        @click="$emit('publish')"
        :class="{ 'opacity-50': isLoading }"
        :disabled="isLoading"
      >
        {{ publishLabel }}
        <IconsLoading class="w-5 h-5" v-if="isLoading" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { breadcrumbs, discardLabel, publishLabel, subtitle, title, form } =
  defineProps<{
    title: string;
    subtitle?: string;
    breadcrumbs: { label: string; href: string }[];
    discardLabel?: string;
    publishLabel?: string;
    form?: string;
  }>();

const { isLoading } = useLoading();
</script>

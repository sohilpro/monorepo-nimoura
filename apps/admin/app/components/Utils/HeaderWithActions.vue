<template>
  <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
    <!-- Breadcrumb -->
    <div>
      <nav class="text-sm text-gray-500 mb-1">
        <ol class="flex items-center space-x-1 rtl:space-x-reverse">
          <li
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            class="flex items-center"
          >
            <span v-if="index > 0" class="mx-1 text-gray-400">›</span>
            <NuxtLink
              v-if="index !== breadcrumbs.length - 1"
              :to="crumb.href"
              class="text-gray-500 hover:text-gray-800 transition-colors"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span v-else class="font-medium text-brand-600">
              {{ crumb.label }}
            </span>
          </li>
        </ol>
      </nav>
      <h2 class="text-2xl sm:text-3xl mt-3 font-bold tracking-tight text-gray-900">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-sm text-gray-500 mt-1">
        {{ subtitle }}
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        v-if="discardLabel"
        type="button"
        class="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        @click="$emit('discard')"
      >
        {{ discardLabel }}
      </button>

      <button
        v-if="publishLabel"
        :form="form"
        class="bg-brand-500 text-white flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs hover:bg-brand-600 transition"
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

<script setup lang="ts">
import type { Article } from '~~/server/types/magazine';

withDefaults(defineProps<{ article: Article; size?: 'md' | 'lg' }>(), {
  size: 'md',
});
</script>

<template>
  <NuxtLink :to="`/magazine/${article.slug}`" class="group flex flex-col">
    <div
      class="relative overflow-hidden rounded-2xl bg-nimoura-accent/15"
      :class="size === 'lg' ? 'aspect-[16/11]' : 'aspect-[4/3]'"
    >
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.coverImageAlt || article.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
      />
    </div>

    <div class="flex flex-1 flex-col pt-4">
      <span class="text-xs font-semibold text-nimoura-primary">{{ article.category?.name }}</span>

      <h3
        class="mt-1.5 font-display font-bold text-nimoura-velvet transition-colors group-hover:text-nimoura-primary"
        :class="size === 'lg' ? 'text-2xl leading-snug' : 'text-lg leading-snug'"
      >
        {{ article.title }}
      </h3>

      <p class="mt-2 line-clamp-2 text-[15px] leading-7 text-nimoura-text-600">
        {{ article.summary }}
      </p>

      <div class="mt-3 flex items-center gap-2 border-t border-nimoura-border/50 pt-3 text-xs text-nimoura-text-500">
        <span>{{ article.author?.name }}</span>
        <span class="text-nimoura-accent">✦</span>
        <span>{{ article.readingTime }} دقیقه مطالعه</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Article } from '~~/server/types/magazine';

const props = withDefaults(defineProps<{ article: Article; size?: 'md' | 'lg' }>(), {
  size: 'md',
});

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <NuxtLink
    :to="`/magazine/${article.slug}`"
    class="group flex flex-col rounded-3xl bg-white border border-nimoura-border/40 p-3 sm:p-4 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-nimoura-primary/40"
  >
    <!-- تصویر کاور با نسبت تصویر شکیل -->
    <div
      class="relative overflow-hidden rounded-2xl bg-nimoura-accent/15"
      :class="size === 'lg' ? 'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[4/3]'"
    >
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.coverImageAlt || article.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
      />
      <div v-else class="h-full w-full flex items-center justify-center bg-nimoura-base text-nimoura-primary/40 font-bold">
        مجله نیمورا
      </div>

      <!-- برچسب دسته‌بندی روی کاور -->
      <span
        v-if="article.category?.name"
        class="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-nimoura-primary shadow-xs backdrop-blur"
      >
        {{ article.category?.name }}
      </span>
    </div>

    <!-- متون و اطلاعات -->
    <div class="flex flex-1 flex-col pt-3.5">
      <h3
        class="font-display font-bold text-nimoura-velvet transition-colors group-hover:text-nimoura-primary"
        :class="size === 'lg' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg leading-snug'"
      >
        {{ article.title }}
      </h3>

      <p class="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-nimoura-text-600">
        {{ article.summary }}
      </p>

      <!-- اطلاعات نویسنده و زمان -->
      <div class="mt-auto pt-4 flex items-center justify-between border-t border-nimoura-border/30 text-[11px] text-nimoura-text-400">
        <div class="flex items-center gap-1.5">
          <span class="font-medium text-nimoura-text-600">{{ article.author?.name || 'تحریریه نیمورا' }}</span>
          <span>·</span>
          <span>{{ article.readingTime || 3 }} دقیقه مطالعه</span>
        </div>

        <div class="flex items-center gap-3">
          <span v-if="article.publishedAt" class="text-nimoura-text-400">
            {{ formatDate(article.publishedAt) }}
          </span>
          <span v-if="article.likeCount > 0" class="flex items-center gap-1 text-nimoura-primary font-medium">
            <i class="pi pi-heart-fill text-[10px]" />
            {{ article.likeCount }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<template>
  <section
    v-if="hasContent"
    class="mt-10 rounded-2xl border border-nimoura-text-100 bg-white p-5 sm:mt-14 sm:p-7"
    aria-label="توضیحات دسته‌بندی"
  >
    <div
      class="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
      :style="
        shouldCollapse && !expanded
          ? { maxHeight: `${COLLAPSED_HEIGHT}px` }
          : undefined
      "
    >
      <article
        ref="articleRef"
        class="category-seo-content text-sm leading-7 text-nimoura-text-600"
        v-html="category?.seoText"
      />

      <div
        v-if="shouldCollapse && !expanded"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent"
      />
    </div>

    <div v-if="shouldCollapse" class="mt-3 flex justify-center sm:justify-start">
      <Button
        :label="expanded ? 'نمایش کمتر' : 'مشاهده توضیحات کامل'"
        :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
        icon-pos="end"
        link
        size="small"
        class="!px-0 !text-xs !font-semibold !text-nimoura-primary sm:!text-sm"
        @click="expanded = !expanded"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface SeoCategory {
  name?: string;
  seoText?: string | null;
}

const props = defineProps<{
  category?: SeoCategory | null;
}>();

const COLLAPSED_HEIGHT = 240;

const articleRef = ref<HTMLElement | null>(null);
const shouldCollapse = ref(false);
const expanded = ref(false);

const hasContent = computed(() => {
  const html = props.category?.seoText ?? '';
  return html.replace(/<[^>]+>/g, '').trim().length > 0;
});

function measureHeight() {
  if (!articleRef.value) {
    shouldCollapse.value = false;
    return;
  }
  shouldCollapse.value = articleRef.value.scrollHeight > COLLAPSED_HEIGHT + 40;
}

onMounted(measureHeight);

watch(
  () => props.category?.seoText,
  async () => {
    expanded.value = false;
    await nextTick();
    measureHeight();
  },
);
</script>

<style scoped>
.category-seo-content :deep(h1) {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.7;
  color: var(--color-nimoura-text-800);
}

.category-seo-content :deep(h2) {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 1.075rem;
  font-weight: 700;
  line-height: 1.7;
  color: var(--color-nimoura-text-800);
}

.category-seo-content :deep(h3),
.category-seo-content :deep(h4) {
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.7;
  color: var(--color-nimoura-text-700);
}

.category-seo-content :deep(p) {
  margin-bottom: 0.75rem;
  text-align: justify;
}

.category-seo-content :deep(ul),
.category-seo-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-inline-start: 1.25rem;
}

.category-seo-content :deep(ul) {
  list-style-type: disc;
}

.category-seo-content :deep(ol) {
  list-style-type: decimal;
}

.category-seo-content :deep(li) {
  margin-bottom: 0.35rem;
}

.category-seo-content :deep(a) {
  color: var(--color-nimoura-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.category-seo-content :deep(strong),
.category-seo-content :deep(b) {
  font-weight: 600;
  color: var(--color-nimoura-text-800);
}

.category-seo-content :deep(blockquote) {
  margin: 0.75rem 0;
  border-inline-start: 3px solid var(--color-nimoura-primary);
  background: var(--color-nimoura-base);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-nimoura-text-700);
}

.category-seo-content :deep(img) {
  max-width: 100%;
  border-radius: 0.75rem;
  margin: 1rem auto;
}
</style>

<script setup lang="ts">
import type { TocItem } from './Toc.vue';

const props = defineProps<{
  content: string;
}>();

const emit = defineEmits<{
  (e: 'headings-extracted', items: TocItem[]): void;
}>();

interface ContentBlock {
  type: 'html' | 'slider';
  html?: string;
  ids?: string;
  title?: string;
}

const blocks = ref<ContentBlock[]>([]);
const extractedHeadings = ref<TocItem[]>([]);

function slugifyPersian(text: string): string {
  return text
    .trim()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

function processContent(rawHtml: string) {
  if (!rawHtml) {
    blocks.value = [];
    extractedHeadings.value = [];
    emit('headings-extracted', []);
    return;
  }

  const headings: TocItem[] = [];
  let headingCounter = 0;

  // ۱. شناسایی و استخراج تیترها (H2 و H3) و اختصاص ID
  const htmlWithAnchors = rawHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerText) => {
      headingCounter++;
      const cleanText = innerText.replace(/<[^>]*>/g, '').trim();
      const slug = slugifyPersian(cleanText) || `section-${headingCounter}`;
      const id = `heading-${slug}-${headingCounter}`;

      headings.push({
        id,
        text: cleanText,
        level: Number(levelStr),
      });

      const existingClassMatch = attrs.match(/class="([^"]*)"/i);
      let classAttr = 'scroll-mt-24';
      if (existingClassMatch) {
        classAttr += ` ${existingClassMatch[1]}`;
      }

      return `<h${levelStr} id="${id}" class="${classAttr}">${innerText}</h${levelStr}>`;
    }
  );

  extractedHeadings.value = headings;
  emit('headings-extracted', headings);

  // ۲. استایل‌دهی و بسته‌بندی جداول برای اسکرول ریسپانسیو و زیبایی ظاهری
  const styledHtml = htmlWithAnchors.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (match, attrs, innerTable) => {
      return `<div class="table-container my-8 overflow-x-auto rounded-2xl border border-nimoura-border/40 bg-white shadow-xs">
        <table class="nimoura-magazine-table w-full text-right border-collapse text-xs sm:text-sm"${attrs}>
          ${innerTable}
        </table>
      </div>`;
    }
  );

  // ۳. جداسازی اسلایدرهای محصول درون متن
  // فرمت: <div class="nimoura-product-slider..." data-ids="..." data-title="..."></div>
  const sliderRegex = /<div[^>]*class="[^"]*nimoura-product-slider[^"]*"[^>]*data-ids="([^"]*)"(?:[^>]*data-title="([^"]*)")?[^>]*>[\s\S]*?<\/div>/gi;

  const newBlocks: ContentBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sliderRegex.exec(styledHtml)) !== null) {
    const textBefore = styledHtml.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      newBlocks.push({ type: 'html', html: textBefore });
    }

    const ids = match[1] || '';
    const title = match[2] || 'محصولات پیشنهادی این بخش';

    if (ids.trim()) {
      newBlocks.push({
        type: 'slider',
        ids: ids.trim(),
        title,
      });
    }

    lastIndex = sliderRegex.lastIndex;
  }

  const remaining = styledHtml.slice(lastIndex);
  if (remaining.trim()) {
    newBlocks.push({ type: 'html', html: remaining });
  }

  blocks.value = newBlocks.length > 0 ? newBlocks : [{ type: 'html', html: styledHtml }];
}

watch(
  () => props.content,
  (newContent) => {
    processContent(newContent || '');
  },
  { immediate: true }
);
</script>

<template>
  <div class="article-content-wrapper text-nimoura-text-700 leading-relaxed text-sm sm:text-base">
    <template v-for="(block, idx) in blocks" :key="idx">
      <!-- بلوک محتوای HTML -->
      <div
        v-if="block.type === 'html'"
        class="prose-content"
        v-html="block.html"
      />

      <!-- بلوک اسلایدر محصول درون متن -->
      <div
        v-else-if="block.type === 'slider' && block.ids"
        class="in-content-slider my-10 rounded-3xl bg-white border border-nimoura-border/40 p-4 sm:p-6 shadow-xs"
      >
        <UtilsProductSlider
          :title="block.title || 'محصولات پیشنهادی'"
          sub-title=""
          description="برگزیده‌های معرفی‌شده در این بخش از مقاله — خرید با ضمانت اصالت"
          :endpoint="`/api/products?ids=${block.ids}&limit=12`"
          :dont-show-btn-all="true"
          :hide-when-empty="true"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
:deep(.prose-content) {
  line-height: 2.1;
  word-break: break-word;
}

:deep(.prose-content p) {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  color: var(--color-nimoura-text-700, #4e4545);
}

:deep(.prose-content h2) {
  font-family: var(--font-modam, sans-serif);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-nimoura-velvet, #3b2f45);
  margin-top: 2.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(196, 196, 196, 0.35);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.prose-content h2::before) {
  content: "";
  display: inline-block;
  width: 5px;
  height: 1.2em;
  background-color: var(--color-nimoura-primary, #b76e79);
  border-radius: 9999px;
  flex-shrink: 0;
}

:deep(.prose-content h3) {
  font-family: var(--font-modam, sans-serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-nimoura-velvet, #3b2f45);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

:deep(.prose-content h4) {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-nimoura-velvet, #3b2f45);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.prose-content ul) {
  list-style-type: disc;
  padding-right: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  space-y: 0.5rem;
}

:deep(.prose-content ol) {
  list-style-type: decimal;
  padding-right: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  space-y: 0.5rem;
}

:deep(.prose-content li) {
  margin-bottom: 0.5rem;
  line-height: 1.9;
}

:deep(.prose-content blockquote) {
  margin: 1.75rem 0;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to left, rgba(255, 248, 244, 0.8), rgba(217, 198, 226, 0.15));
  border-right: 4px solid var(--color-nimoura-primary, #b76e79);
  border-radius: 0 1rem 1rem 0;
  font-style: italic;
  color: var(--color-nimoura-velvet, #3b2f45);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

:deep(.prose-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 1.25rem;
  margin: 2rem auto;
  display: block;
  box-shadow: 0 4px 20px -2px rgba(59, 47, 69, 0.08);
  border: 1px solid rgba(196, 196, 196, 0.35);
}

:deep(.prose-content a) {
  color: var(--color-nimoura-primary, #b76e79);
  text-decoration: underline;
  text-underline-offset: 4px;
  font-weight: 600;
  transition: color 0.15s ease;
}

:deep(.prose-content a:hover) {
  color: var(--color-nimoura-velvet, #3b2f45);
}

/* جدول‌های مقاله */
:deep(.nimoura-magazine-table th) {
  background-color: rgba(59, 47, 69, 0.05);
  color: var(--color-nimoura-velvet, #3b2f45);
  font-weight: 700;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(196, 196, 196, 0.4);
}

:deep(.nimoura-magazine-table td) {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(196, 196, 196, 0.25);
  vertical-align: middle;
}

:deep(.nimoura-magazine-table tr:nth-child(even)) {
  background-color: rgba(255, 248, 244, 0.5);
}

:deep(.nimoura-magazine-table tr:hover) {
  background-color: rgba(183, 110, 121, 0.06);
}
</style>

<script setup lang="ts">
export interface FaqItem {
  question: string;
  answer: string;
}

const props = defineProps<{
  faqs: FaqItem[];
}>();

const activeIndexes = ref<number[]>([0]); // باز بودن اولین سوال به صورت پیش‌فرض

function toggleFaq(index: number) {
  if (activeIndexes.value.includes(index)) {
    activeIndexes.value = activeIndexes.value.filter((i) => i !== index);
  } else {
    activeIndexes.value.push(index);
  }
}

// ساخت ساختار اسکیما برای گوگل (FAQPage JSON-LD)
const faqSchema = computed(() => {
  if (!props.faqs || props.faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
});

useHead(() => ({
  script: faqSchema.value
    ? [
        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema.value),
        },
      ]
    : [],
}));
</script>

<template>
  <section v-if="faqs && faqs.length > 0" class="my-12">
    <!-- تیتر بخش سوالات متداول -->
    <div class="mb-6 flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
        <i class="pi pi-question-circle text-lg" />
      </span>
      <div>
        <h3 class="font-display text-xl sm:text-2xl font-bold text-nimoura-velvet">
          سوالات متداول شما
        </h3>
        <p class="text-xs text-nimoura-text-500 mt-0.5">
          پاسخ کارشناسان مجله نیمورا به پرتکرارترین پرسش‌ها
        </p>
      </div>
    </div>

    <!-- لیست آکاردئونی سوالات -->
    <div class="space-y-3">
      <div
        v-for="(faq, idx) in faqs"
        :key="idx"
        class="overflow-hidden rounded-2xl border transition-all duration-300"
        :class="
          activeIndexes.includes(idx)
            ? 'border-nimoura-primary/50 bg-white shadow-xs'
            : 'border-nimoura-border/40 bg-white/70 hover:bg-white hover:border-nimoura-border/80'
        "
      >
        <button
          type="button"
          class="flex w-full items-center justify-between p-4 sm:p-5 text-right font-display text-sm sm:text-base font-bold text-nimoura-velvet transition-colors"
          :class="{ 'text-nimoura-primary': activeIndexes.includes(idx) }"
          @click="toggleFaq(idx)"
        >
          <span class="flex items-center gap-3">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-mono"
              :class="activeIndexes.includes(idx) ? 'bg-nimoura-primary text-white' : 'bg-nimoura-base text-nimoura-text-500'"
            >
              {{ idx + 1 }}
            </span>
            {{ faq.question }}
          </span>
          <i
            class="pi pi-chevron-down text-xs text-nimoura-text-400 transition-transform duration-300 mr-2 shrink-0"
            :class="{ 'rotate-180 text-nimoura-primary': activeIndexes.includes(idx) }"
          />
        </button>

        <div
          v-show="activeIndexes.includes(idx)"
          class="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-nimoura-text-600 border-t border-nimoura-border/20"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </section>
</template>

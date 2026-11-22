<script setup lang="ts">
import type { Article } from "~~/server/types/magazine";
import type { TocItem } from "~/components/Magazine/Article/Toc.vue";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const toast = useAppToast();

// دریافت اطلاعات مقاله و مطالب مرتبط
const { data, pending, error } = await useAsyncData(
  `magazine-article-${slug.value}`,
  () => $fetch<{ article: Article; related: Article[] }>(`/api/magazine/articles/${slug.value}`)
);

const article = computed<Article | null>(() => {
  const d = data.value as any;
  return d?.data?.article ?? d?.article ?? null;
});

const relatedArticles = computed<Article[]>(() => {
  const d = data.value as any;
  const list = d?.data?.related ?? d?.related ?? [];
  return Array.isArray(list) ? list : [];
});

if (error.value || !article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "مقاله مورد نظر یافت نشد یا هنوز منتشر نشده است.",
    fatal: true,
  });
}

// سئو و متادیتا
const pageTitle = computed(
  () => article.value?.metaTitle || `${article.value?.title} | مجله زیبایی نیمورا`
);
const pageDescription = computed(
  () => article.value?.metaDescription || article.value?.summary
);

useHead(() => {
  if (!article.value) return {};

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.value.title,
    description: article.value.summary,
    image: article.value.coverImage ? [article.value.coverImage] : [],
    datePublished: article.value.publishedAt,
    dateModified: (article.value as any).updatedAt || article.value.publishedAt,
    author: {
      "@type": "Person",
      name: article.value.author?.name || "تحریریه نیمورا",
    },
    publisher: {
      "@type": "Organization",
      name: "فروشگاه و مجله زیبایی نیمورا",
      logo: {
        "@type": "ImageObject",
        url: "https://nimoura.ir/logo.png",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "صفحه اصلی",
        item: "https://nimoura.ir/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "مجله زیبایی",
        item: "https://nimoura.ir/magazine",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.value.category?.name || "مقالات",
        item: `https://nimoura.ir/magazine?category=${article.value.category?.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.value.title,
        item: `https://nimoura.ir/magazine/${article.value.slug}`,
      },
    ],
  };

  return {
    title: pageTitle.value,
    meta: [
      { name: "description", content: pageDescription.value },
      { name: "keywords", content: article.value.metaKeywords || "" },
      // OpenGraph
      { property: "og:title", content: pageTitle.value },
      { property: "og:description", content: pageDescription.value },
      { property: "og:type", content: "article" },
      {
        property: "og:image",
        content: article.value.coverImage || "https://nimoura.ir/og-image.png",
      },
      {
        property: "og:url",
        content: `https://nimoura.ir/magazine/${article.value.slug}`,
      },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle.value },
      { name: "twitter:description", content: pageDescription.value },
      {
        name: "twitter:image",
        content: article.value.coverImage || "https://nimoura.ir/og-image.png",
      },
    ],
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify(articleSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema),
      },
    ],
  };
});

// نوار پیشرفت مطالعه مقاله
const readingProgress = ref(0);
function updateReadingProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (docHeight > 0) {
    readingProgress.value = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
  }
}

onMounted(() => {
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateReadingProgress);
});

// مدیریت فهرست مطالب (TOC)
const tocItems = ref<TocItem[]>([]);
const activeHeadingId = ref<string>("");

function onHeadingsExtracted(items: TocItem[]) {
  tocItems.value = items;
}

// ترکینگ اسکرول برای هایلایت سکشن فعال در TOC
let headingObserver: IntersectionObserver | null = null;
onMounted(() => {
  nextTick(() => {
    headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeHeadingId.value = entry.target.id;
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    document.querySelectorAll("h2[id], h3[id]").forEach((el) => {
      headingObserver?.observe(el);
    });
  });
});

onUnmounted(() => {
  headingObserver?.disconnect();
});

// لایک مقاله
const likeCount = ref(article.value?.likeCount ?? 0);
const hasLiked = ref(false);
const liking = ref(false);

async function toggleLike() {
  if (liking.value || !article.value) return;
  liking.value = true;
  try {
    const res: any = await $fetch("/api/magazine/articles/like", {
      method: "POST",
      body: { id: article.value.id },
    });
    const result = res?.data ?? res;
    hasLiked.value = !!result?.liked;
    if (typeof result?.likeCount === "number") {
      likeCount.value = result.likeCount;
    } else {
      likeCount.value += hasLiked.value ? 1 : -1;
    }
    toast.add({
      severity: "success",
      summary: hasLiked.value ? "مقاله لایک شد" : "لایک برداشته شد",
      life: 2000,
    });
  } catch {
    toast.add({
      severity: "info",
      summary: "شما قبلاً به این مقاله واکنش نشان داده‌اید",
      life: 2500,
    });
  } finally {
    liking.value = false;
  }
}

// اشتراک‌گذاری
function copyArticleLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    toast.add({
      severity: "success",
      summary: "لینک مقاله کپی شد",
      detail: "می‌توانید آن را با دوستان خود به اشتراک بگذارید.",
      life: 2500,
    });
  });
}

function shareTelegram() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.value?.title || "");
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
}

function shareWhatsApp() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.value?.title || "");
  window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, "_blank");
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div v-if="article" class="bg-nimoura-base min-h-screen pb-20">
    <!-- نوار چسبان پیشرفت مطالعه بالای صفحه -->
    <div
      class="fixed top-0 left-0 right-0 z-50 h-1 bg-nimoura-primary transition-all duration-150"
      :style="{ width: `${readingProgress}%` }"
    />

    <!-- ============ بخش هدر مقاله و بردکرامب ============ -->
    <header class="border-b border-nimoura-border/30 bg-white/70 backdrop-blur-md pt-6 pb-8">
      <div class="mx-auto max-w-5xl px-5 sm:px-8">
        <!-- مسیر راهنما (Breadcrumb) -->
        <nav class="flex flex-wrap items-center gap-2 text-xs text-nimoura-text-500 mb-6">
          <NuxtLink to="/" class="hover:text-nimoura-primary transition">خانه</NuxtLink>
          <span class="text-nimoura-border">/</span>
          <NuxtLink to="/magazine" class="hover:text-nimoura-primary transition">مجله زیبایی</NuxtLink>
          <span class="text-nimoura-border">/</span>
          <NuxtLink
            v-if="article.category"
            :to="`/magazine?category=${article.category.slug}`"
            class="text-nimoura-primary font-medium hover:underline"
          >
            {{ article.category.name }}
          </NuxtLink>
        </nav>

        <!-- برچسب دسته‌بندی و ویژه -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span
            v-if="article.category?.name"
            class="rounded-full bg-nimoura-primary/10 px-3.5 py-1 text-xs font-bold text-nimoura-primary"
          >
            {{ article.category.name }}
          </span>
          <span
            v-if="article.isFeatured"
            class="rounded-full bg-nimoura-accent/40 px-3 py-1 text-xs font-semibold text-nimoura-velvet"
          >
            ✦ پیشنهاد ویژه
          </span>
        </div>

        <!-- تیتر اصلی مقاله (H1) -->
        <h1 class="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-nimoura-velvet leading-tight sm:leading-snug mb-6">
          {{ article.title }}
        </h1>

        <!-- نوار اطلاعات متای مقاله (نویسنده، تاریخ، زمان مطالعه، دکمه‌های لایک و اشتراک) -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-nimoura-border/30 pt-4">
          <!-- مشخصات نویسنده و زمان -->
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nimoura-accent/25 overflow-hidden border border-nimoura-primary/20">
              <img
                v-if="article.author?.avatar"
                :src="formatImageUrl(article.author.avatar)"
                :alt="article.author.name"
                class="h-full w-full object-cover"
              />
              <span v-else class="text-xs font-bold text-nimoura-velvet">
                {{ article.author?.name?.charAt(0) || 'ن' }}
              </span>
            </div>
            <div>
              <p class="font-display text-xs sm:text-sm font-bold text-nimoura-velvet">
                {{ article.author?.name || 'تحریریه زیبایی نیمورا' }}
              </p>
              <div class="flex items-center gap-2 text-[11px] text-nimoura-text-400 mt-0.5">
                <span>{{ formatDate(article.publishedAt) }}</span>
                <span>·</span>
                <span>{{ article.readingTime || 4 }} دقیقه مطالعه</span>
                <span>·</span>
                <span class="flex items-center gap-1">
                  <i class="pi pi-eye text-[10px]" />
                  {{ article.viewCount || 0 }} بازدید
                </span>
              </div>
            </div>
          </div>

          <!-- دکمه‌های تعاملی لایک و اشتراک‌گذاری -->
          <div class="flex items-center gap-2">
            <!-- دکمه لایک -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
              :class="
                hasLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-nimoura-text-600 border border-nimoura-border/50 hover:border-rose-300 hover:text-rose-500'
              "
              :disabled="liking"
              @click="toggleLike"
            >
              <i :class="hasLiked ? 'pi pi-heart-fill' : 'pi pi-heart'" />
              <span>{{ likeCount }}</span>
            </button>

            <!-- دکمه اشتراک‌گذاری تلگرام -->
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-nimoura-text-600 border border-nimoura-border/50 hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc] transition shadow-xs"
              title="اشتراک در تلگرام"
              @click="shareTelegram"
            >
              <i class="pi pi-telegram text-xs" />
            </button>

            <!-- دکمه اشتراک واتساپ -->
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-nimoura-text-600 border border-nimoura-border/50 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition shadow-xs"
              title="اشتراک در واتساپ"
              @click="shareWhatsApp"
            >
              <i class="pi pi-whatsapp text-xs" />
            </button>

            <!-- کپی لینک -->
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-nimoura-text-600 border border-nimoura-border/50 hover:bg-nimoura-primary hover:text-white hover:border-nimoura-primary transition shadow-xs"
              title="کپی لینک مقاله"
              @click="copyArticleLink"
            >
              <i class="pi pi-link text-xs" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ============ تصویر کاور شاخص مقاله ============ -->
    <div class="mx-auto max-w-5xl px-5 sm:px-8 mt-8">
      <div class="relative overflow-hidden rounded-3xl border border-nimoura-border/40 shadow-sm aspect-[16/9] sm:aspect-[21/10] bg-nimoura-velvet/5">
        <img
          v-if="article.coverImage"
          :src="formatImageUrl(article.coverImage)"
          :alt="article.coverImageAlt || article.title"
          class="h-full w-full object-cover"
        />
        <div v-else class="h-full w-full flex items-center justify-center bg-nimoura-accent/20 text-nimoura-velvet font-bold">
          تصویر شاخص مقاله نیمورا
        </div>
      </div>
      <p v-if="article.coverImageAlt" class="mt-2 text-center text-xs text-nimoura-text-400 italic">
        {{ article.coverImageAlt }}
      </p>

      <!-- جعبه خلاصه و چکیده مقاله (Lead summary) -->
      <div v-if="article.summary" class="mt-8 rounded-2xl border-r-4 border-nimoura-primary bg-white p-5 sm:p-6 shadow-xs">
        <p class="font-display text-sm sm:text-base font-medium leading-relaxed text-nimoura-velvet">
          💡 {{ article.summary }}
        </p>
      </div>
    </div>

    <!-- ============ ساختار دو ستونه: متن مقاله + سایدبار فهرست ============ -->
    <main class="mx-auto max-w-5xl px-5 sm:px-8 mt-10">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <!-- ستون کناری دسکتاپ: فهرست مطالب و پروفایل نویسنده (۴ ستون) -->
        <aside class="order-2 lg:order-1 lg:col-span-4 space-y-6">
          <!-- فهرست مطالب خودکار -->
          <MagazineArticleToc :items="tocItems" :active-id="activeHeadingId" />

          <!-- کارت نویسنده -->
          <div class="rounded-3xl border border-nimoura-border/40 bg-white p-6 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-nimoura-accent/30 overflow-hidden border border-nimoura-primary/20">
                <img
                  v-if="article.author?.avatar"
                  :src="formatImageUrl(article.author.avatar)"
                  :alt="article.author.name"
                  class="h-full w-full object-cover"
                />
                <span v-else class="font-bold text-nimoura-velvet text-sm">
                  {{ article.author?.name?.charAt(0) || 'ن' }}
                </span>
              </div>
              <div>
                <h4 class="font-display text-sm font-bold text-nimoura-velvet">
                  {{ article.author?.name || 'تحریریه نیمورا' }}
                </h4>
                <p class="text-xs text-nimoura-primary mt-0.5">
                  {{ article.author?.jobTitle || 'کارشناس ارشد زیبایی و مراقبت پوست' }}
                </p>
              </div>
            </div>
            <p v-if="article.author?.bio" class="mt-3 text-xs leading-relaxed text-nimoura-text-600 border-t border-nimoura-border/30 pt-3">
              {{ article.author.bio }}
            </p>
          </div>

          <!-- بنر دعوت به خرید با ارسال رایگان -->
          <div class="rounded-3xl bg-gradient-to-br from-nimoura-primary to-nimoura-velvet p-6 text-white shadow-md text-center">
            <i class="pi pi-shield text-2xl text-nimoura-accent mb-2" />
            <h4 class="font-display text-base font-bold text-white">ضمانت اصالت ۱۰۰٪ نیمورا</h4>
            <p class="mt-1.5 text-xs text-white/80 leading-relaxed">
              تمام محصولات معرفی‌شده در مجله نیمورا با برچسب اصالت کالا و ارسال سریع به سراسر ایران عرضه می‌شوند.
            </p>
            <NuxtLink
              to="/"
              class="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-nimoura-velvet shadow-sm hover:bg-nimoura-base transition"
            >
              مشاهده فروشگاه نیمورا
            </NuxtLink>
          </div>
        </aside>

        <!-- ستون اصلی متن مقاله (۸ ستون) -->
        <article class="order-1 lg:order-2 lg:col-span-8 rounded-3xl border border-nimoura-border/30 bg-white p-6 sm:p-10 shadow-xs">
          <!-- رندرکننده محتوای مقاله، استایل تیترها، جداول و اسلایدرهای درون متنی -->
          <MagazineArticleContentRenderer
            :content="article.content"
            @headings-extracted="onHeadingsExtracted"
          />

          <!-- برچسب‌های مقاله (Tags) -->
          <div v-if="article.tags && article.tags.length > 0" class="mt-12 border-t border-nimoura-border/30 pt-6">
            <span class="block text-xs font-bold text-nimoura-velvet mb-3 flex items-center gap-1.5">
              <i class="pi pi-tags text-nimoura-primary text-xs" />
              برچسب‌های این مقاله:
            </span>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in article.tags"
                :key="tag.id"
                :to="`/magazine?tag=${tag.slug}`"
                class="rounded-full border border-nimoura-border/50 bg-nimoura-base/60 px-3.5 py-1 text-xs text-nimoura-text-600 transition hover:border-nimoura-primary hover:bg-nimoura-primary hover:text-white"
              >
                #{{ tag.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- بازخورد و لایک انتهای مقاله -->
          <div class="mt-8 rounded-2xl bg-nimoura-base/50 p-5 text-center border border-nimoura-border/30">
            <p class="font-display text-sm font-bold text-nimoura-velvet mb-3">
              آیا این مقاله برای شما مفید و آموزنده بود؟
            </p>
            <div class="flex justify-center items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs"
                :class="
                  hasLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-nimoura-text-700 border border-nimoura-border/50 hover:bg-rose-50 hover:text-rose-600'
                "
                @click="toggleLike"
              >
                <i :class="hasLiked ? 'pi pi-heart-fill' : 'pi pi-heart'" />
                {{ hasLiked ? 'ممنون از بازخورد شما!' : 'بله، مفید بود' }}
                <span>({{ likeCount }})</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs text-nimoura-text-600 border border-nimoura-border/50 hover:bg-gray-50 transition shadow-xs"
                @click="copyArticleLink"
              >
                <i class="pi pi-share-alt text-xs" />
                اشتراک با دوستان
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- ============ اسلایدر محصولات معرفی‌شده در مقاله (پایین مقاله) ============ -->
      <section
        v-if="article.relatedProductIds && article.relatedProductIds.length > 0"
        class="mt-16 rounded-3xl bg-white border border-nimoura-border/40 p-6 sm:p-8 shadow-xs"
      >
        <UtilsProductSlider
          title="محصولات معرفی‌شده در این مقاله"
          sub-title=""
          description="خرید با ضمانت اصالت کالا و ارسال سریع از فروشگاه نیمورا"
          :endpoint="`/api/products?ids=${article.relatedProductIds.join(',')}&limit=12`"
          :dont-show-btn-all="true"
          :hide-when-empty="true"
        />
      </section>

      <!-- ============ سوالات متداول انتهای مقاله (FAQ Accordion) ============ -->
      <MagazineArticleFaqAccordion
        v-if="article.faqs && article.faqs.length > 0"
        :faqs="article.faqs"
      />

      <!-- ============ بخش دیدگاه‌ها و نظرات ============ -->
      <MagazineArticleComments
        :article-id="article.id"
        :comment-count="article.commentCount || 0"
      />

      <!-- ============ مقالات مرتبط (پیشنهادی) ============ -->
      <section v-if="relatedArticles.length > 0" class="mt-16">
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="h-6 w-1 rounded-full bg-nimoura-primary" />
            <h3 class="font-display text-xl sm:text-2xl font-bold text-nimoura-velvet">
              شاید این مقالات را هم دوست داشته باشید
            </h3>
          </div>
          <NuxtLink to="/magazine" class="text-xs font-bold text-nimoura-primary hover:underline">
            مشاهده همه مطالب
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MagazineArticleCard
            v-for="rel in relatedArticles"
            :key="rel.id"
            :article="rel"
          />
        </div>
      </section>
    </main>
  </div>
</template>

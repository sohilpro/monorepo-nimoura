<template>
  <section
    id="reviews"
    class="w-full rounded-2xl border border-gray-200 bg-white px-3 py-4 sm:p-6"
    dir="rtl"
  >
    <h2 class="mb-1 text-lg font-medium text-nimoura-text-700 sm:text-xl">
      نظرات خریداران
    </h2>
    <div class="mb-5 h-[1.5px] w-10 rounded bg-nimoura-primary" />

    <div class="flex flex-col gap-5 xl:flex-row">
      <!-- ══ RIGHT COLUMN: comment form ══ -->
      <ProductCommentsForm :product-id="product.id" />

      <!-- ══ LEFT COLUMN: stats + comments ══ -->
      <div class="min-w-0 flex-1 space-y-5">
        <!-- Rating summary -->
        <div
          class="flex items-center gap-4 rounded-xl border border-nimoura-border bg-nimoura-base p-4 sm:gap-6 sm:p-5"
        >
          <div class="shrink-0 text-center">
            <div
              class="font-modam text-4xl font-medium leading-none text-nimoura-text-800 sm:text-5xl"
            >
              {{ formattedAverageRating }}
              <span class="font-modam text-sm font-normal text-nimoura-primary">/۵</span>
            </div>
            <div class="mt-1.5 text-sm text-nimoura-primary">
              {{ starsFilled(roundedAverageRating) }}
            </div>
            <div class="mt-1 font-modam text-[11px] text-nimoura-text-500">
              {{ numberFormat(totalCommentsCount) }} نظر
            </div>
          </div>

          <div class="min-w-0 flex-1 space-y-1.5">
            <div
              v-for="row in computedRatingDist"
              :key="row.star"
              class="flex items-center gap-2"
            >
              <span class="w-3 shrink-0 font-modam text-xs text-nimoura-text-500">
                {{ numberFormat(row.star) }}
              </span>
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full rounded-full bg-nimoura-primary transition-all duration-700"
                  :style="{ width: row.percent + '%' }"
                />
              </div>
              <span
                class="w-4 shrink-0 text-end font-modam text-[11px] text-nimoura-text-400"
              >
                {{ numberFormat(row.count) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Buyer photos -->
        <div v-if="allImages.length">
          <p class="mb-2.5 text-sm font-medium text-nimoura-text-700">
            تصاویر خریداران
          </p>
          <div class="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1">
            <button
              v-for="(img, i) in allImages.slice(0, 12)"
              :key="i"
              type="button"
              class="h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border border-nimoura-border transition-opacity hover:opacity-85 sm:h-20 sm:w-20"
              @click="lightboxSrc = img"
            >
              <img :src="img" alt="تصویر خریدار" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-if="loadingComments" class="space-y-3">
          <div
            v-for="n in 3"
            :key="n"
            class="animate-pulse rounded-xl border border-nimoura-border bg-nimoura-base p-4"
          >
            <div class="mb-3 flex gap-3">
              <div class="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
              <div class="flex-1 space-y-2 pt-1">
                <div class="h-3 w-28 rounded-full bg-gray-200" />
                <div class="h-2 w-16 rounded-full bg-gray-200" />
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-2.5 w-full rounded-full bg-gray-200" />
              <div class="h-2.5 w-4/5 rounded-full bg-gray-200" />
              <div class="h-2.5 w-2/3 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!comments.length"
          class="flex flex-col items-center justify-center gap-3 rounded-xl border border-nimoura-border bg-nimoura-base py-14 text-nimoura-text-400"
        >
          <i class="pi pi-comments text-3xl opacity-40" />
          <p class="text-sm">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
        </div>

        <!-- Comment cards -->
        <div v-else class="space-y-3">
          <div
            v-for="c in comments"
            :key="c.id"
            class="rounded-xl border border-nimoura-border bg-nimoura-base p-4"
          >
            <div class="mb-3 flex items-start gap-3">
              <Avatar
                :label="avatarLetter(c.user?.first_name)"
                shape="circle"
                class="shrink-0 !bg-nimoura-accent/30 !text-nimoura-primary"
              />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="truncate text-sm font-medium text-nimoura-text-700">
                    {{ c.user?.first_name }} {{ c.user?.last_name }}
                  </span>
                  <span
                    v-if="c.isVerifiedBuyer"
                    class="shrink-0 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-600"
                  >
                    خریدار تأیید شده
                  </span>
                </div>
                <div class="mt-0.5 text-[11px] text-gray-400">
                  {{ formatDate(c.createdAt) }}
                </div>
              </div>
            </div>

            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span class="text-sm leading-none text-nimoura-primary">
                {{ starsFilled(c.rating ?? 0) }}
              </span>
              <span class="text-sm font-medium text-nimoura-text-700">
                {{ c.subject }}
              </span>
            </div>

            <p class="mb-3 whitespace-pre-line text-sm leading-6 text-nimoura-text-600">
              {{ c.description }}
            </p>

            <div v-if="c.images?.length" class="mb-3 flex flex-wrap gap-2">
              <button
                v-for="(img, i) in c.images"
                :key="i"
                type="button"
                class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-nimoura-border transition-opacity hover:opacity-85 sm:h-16 sm:w-16"
                @click="lightboxSrc = img"
              >
                <img :src="img" alt="تصویر نظر" class="h-full w-full object-cover" />
              </button>
            </div>

            <div
              class="flex flex-wrap items-center gap-3 border-t border-nimoura-border/50 pt-2.5"
            >
              <span class="text-xs text-nimoura-text-400">
                آیا این نظر مفید بود؟
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  :disabled="reactingIds.has(c.id)"
                  class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-60"
                  :class="
                    c._liked
                      ? 'bg-green-50 font-medium text-green-600'
                      : 'text-nimoura-text-500 hover:bg-gray-100'
                  "
                  @click="react(c, 'like')"
                >
                  <i class="pi pi-thumbs-up text-[12px]" />
                  {{ numberFormat(c.likesCount) }}
                </button>
                <button
                  type="button"
                  :disabled="reactingIds.has(c.id)"
                  class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-60"
                  :class="
                    c._disliked
                      ? 'bg-red-50 font-medium text-red-500'
                      : 'text-nimoura-text-500 hover:bg-gray-100'
                  "
                  @click="react(c, 'dislike')"
                >
                  <i class="pi pi-thumbs-down text-[12px]" />
                  {{ numberFormat(c.dislikesCount) }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentPage < totalPages" class="flex justify-center pt-2">
            <Button
              label="مشاهده نظرات بیشتر"
              outlined
              size="small"
              :loading="loadingMore"
              class="!border-nimoura-primary/40 !text-nimoura-primary"
              @click="loadMoreComments"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="lightboxSrc"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
        @click="lightboxSrc = null"
      >
        <img
          :src="lightboxSrc"
          alt="بزرگ‌نمایی تصویر نظر"
          class="max-h-[90dvh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
interface CommentUser {
  first_name: string;
  last_name: string;
}

interface Comment {
  id: number;
  subject: string;
  description: string;
  images: string[] | null;
  user: CommentUser;
  isVerifiedBuyer: boolean;
  likesCount: number;
  dislikesCount: number;
  rating?: number;
  myReaction?: "like" | "dislike" | null;
  createdAt: string;
  _liked?: boolean;
  _disliked?: boolean;
}

interface RatingRow {
  star: number;
  count: number;
  percent: number;
}

const props = defineProps<{
  product: {
    id: number;
    averageRating?: number;
    ratingsCount?: number;
  };
  ratingDistribution?: RatingRow[];
}>();

const auth = useAuth();
const toast = useAppToast();

const lightboxSrc = ref<string | null>(null);
const loadingComments = ref(false);
const loadingMore = ref(false);
const comments = ref<Comment[]>([]);
const serverRatingDist = ref<RatingRow[] | null>(null);
const totalComments = ref<number | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const reactingIds = reactive(new Set<number>());

const computedRatingDist = computed<RatingRow[]>(() =>
  serverRatingDist.value ??
  props.ratingDistribution ??
  [5, 4, 3, 2, 1].map((s) => ({ star: s, count: 0, percent: 0 })),
);

const totalCommentsCount = computed(
  () => totalComments.value ?? props.product.ratingsCount ?? 0,
);

const averageRatingValue = computed(() => {
  const val = Number(props.product?.averageRating);
  return Number.isFinite(val) && val > 0 ? val : 5;
});

const formattedAverageRating = computed(() =>
  averageRatingValue.value.toFixed(1),
);

const roundedAverageRating = computed(() =>
  Math.min(5, Math.max(0, Math.round(averageRatingValue.value))),
);

const allImages = computed(() =>
  comments.value.flatMap((c) => c.images ?? []),
);

const avatarLetter = (name?: string) => name?.charAt(0) ?? "؟";
const starsFilled = (n: number) => {
  const safe = Math.min(5, Math.max(0, Math.round(Number(n) || 0)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
};

function mapComments(raw: Comment[]): Comment[] {
  return raw.map((c) => ({
    ...c,
    _liked: c.myReaction === "like",
    _disliked: c.myReaction === "dislike",
  }));
}

async function fetchPage(page: number) {
  const res: any = await $fetch(`/api/comments/${props.product.id}`, {
    query: { page, limit: 10 },
  });
  const payload = res?.data ?? res;
  return {
    list: mapComments(payload?.comments ?? []),
    total: Number(payload?.total ?? 0),
    totalPages: Number(payload?.totalPages ?? 1),
    ratingDistribution: payload?.ratingDistribution ?? null,
  };
}

async function loadComments() {
  if (!props.product?.id) return;
  loadingComments.value = true;
  currentPage.value = 1;
  try {
    const res = await fetchPage(1);
    comments.value = res.list;
    totalComments.value = res.total;
    totalPages.value = res.totalPages;
    if (res.ratingDistribution) {
      serverRatingDist.value = res.ratingDistribution;
    }
  } catch {
    toast.error("بارگذاری نظرات ناموفق بود");
  } finally {
    loadingComments.value = false;
  }
}

async function loadMoreComments() {
  if (loadingMore.value || currentPage.value >= totalPages.value) return;
  loadingMore.value = true;
  const nextPage = currentPage.value + 1;
  try {
    const res = await fetchPage(nextPage);
    comments.value.push(...res.list);
    currentPage.value = nextPage;
    totalPages.value = res.totalPages;
  } catch {
    toast.error("بارگذاری نظرات بیشتر ناموفق بود");
  } finally {
    loadingMore.value = false;
  }
}

async function react(c: Comment, type: "like" | "dislike") {
  if (!auth.value) {
    toast.info("برای ثبت واکنش ابتدا وارد حساب کاربری خود شوید");
    return;
  }
  if (reactingIds.has(c.id)) return;

  const prev = {
    _liked: c._liked,
    _disliked: c._disliked,
    likesCount: c.likesCount,
    dislikesCount: c.dislikesCount,
  };

  if (type === "like") {
    if (c._liked) {
      c.likesCount = Math.max(0, c.likesCount - 1);
      c._liked = false;
    } else {
      c.likesCount++;
      c._liked = true;
      if (c._disliked) {
        c.dislikesCount = Math.max(0, c.dislikesCount - 1);
        c._disliked = false;
      }
    }
  } else {
    if (c._disliked) {
      c.dislikesCount = Math.max(0, c.dislikesCount - 1);
      c._disliked = false;
    } else {
      c.dislikesCount++;
      c._disliked = true;
      if (c._liked) {
        c.likesCount = Math.max(0, c.likesCount - 1);
        c._liked = false;
      }
    }
  }

  reactingIds.add(c.id);
  try {
    const res: any = await $fetch(`/api/comments/${c.id}/${type}`, {
      method: "POST",
    });
    const updated = res?.data ?? res;
    if (updated && typeof updated.likesCount === "number") {
      c.likesCount = updated.likesCount;
      c.dislikesCount = updated.dislikesCount;
      c._liked = updated.myReaction === "like";
      c._disliked = updated.myReaction === "dislike";
    }
  } catch (err: any) {
    c._liked = prev._liked;
    c._disliked = prev._disliked;
    c.likesCount = prev.likesCount;
    c.dislikesCount = prev.dislikesCount;
    const msg =
      err?.data?.statusMessage ||
      err?.data?.message ||
      "ثبت واکنش ناموفق بود";
    toast.error(msg);
  } finally {
    reactingIds.delete(c.id);
  }
}

onMounted(loadComments);
</script>

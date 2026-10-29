export interface ExploreCategory {
  id: number;
  name: string;
}

export interface ExploreProduct {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  priceDiscount: number;
}

export interface ExploreVideo {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  posterUrl: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked?: boolean;
  product?: ExploreProduct | null;
  category?: ExploreCategory | null;
}

interface UseExploreFeedOptions {
  // چون هوم (تیزر) و صفحه‌ی /explore هرکدوم فید مستقل خودشون رو دارن (یکی
  // بدون فیلتر، یکی با فیلتر دسته‌بندی)، باید state جداگونه داشته باشن؛
  // وگرنه فیلتر کردن تو /explore لیست هوم رو هم خراب می‌کنه.
  // مودال چون videos رو مستقیم به‌عنوان prop از هوم می‌گیره (نه از این
  // composable)، به این جداسازی وابسته نیست و درست کار می‌کنه.
  scope?: string;
  categoryId?: Ref<number | null>;
}

export function useExploreFeed(options: UseExploreFeedOptions = {}) {
  const scope = options.scope ?? "home";
  const categoryId = options.categoryId;

  const videos = useState<ExploreVideo[]>(
    `explore-feed-videos-${scope}`,
    () => [],
  );
  const nextCursor = useState<number | null>(
    `explore-feed-cursor-${scope}`,
    () => null,
  );
  const pending = useState<boolean>(
    `explore-feed-pending-${scope}`,
    () => false,
  );
  const finished = useState<boolean>(
    `explore-feed-finished-${scope}`,
    () => false,
  );

  async function loadMore() {
    if (pending.value || finished.value) return;
    pending.value = true;
    try {
      const res: any = await $fetch<{
        items: ExploreVideo[];
        nextCursor: number | null;
      }>("/api/explore/videos", {
        query: {
          cursor: nextCursor.value ?? undefined,
          limit: 5,
          categoryId: categoryId?.value ?? undefined,
        },
      });
      videos.value.push(...res.data.items);
      nextCursor.value = res.nextCursor;
      if (!res.nextCursor) finished.value = true;
    } finally {
      pending.value = false;
    }
  }

  function reset() {
    videos.value = [];
    nextCursor.value = null;
    finished.value = false;
  }

  if (categoryId) {
    watch(categoryId, () => {
      reset();
      loadMore();
    });
  }

  return { videos, pending, finished, loadMore, reset };
}

export function useExploreCategories() {
  const categories = useState<ExploreCategory[]>(
    "explore-categories",
    () => [],
  );
  const pending = ref(false);

  async function fetchCategories() {
    if (categories.value.length) return;
    pending.value = true;
    try {
      const res: any = await $fetch<ExploreCategory[]>(
        "/api/explore/categories",
      );
      console.log(res);
      
      categories.value = res.data;
    } finally {
      pending.value = false;
    }
  }

  return { categories, pending, fetchCategories };
}

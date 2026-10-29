export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon?: string;
  children: CategoryNode[];
}

export function useCategories() {
  const { data, pending, error, refresh } = useFetch<{ data: CategoryNode[] }>(
    "/api/categories/tree",
    {
      key: "categories-tree", // کلید ثابت = کش مشترک بین همه‌ی کامپوننت‌ها در کل اپ
    }
  );

  const categories = computed(() => data.value?.data ?? []);

  return { categories, pending, error, refresh };
}
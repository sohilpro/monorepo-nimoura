import type { SitemapUrlInput } from "#sitemap/types";

export default defineSitemapEventHandler(async () => {
  // 📌 دریافت دسته‌بندی‌ها از API
  const categories: any = await $fetch<{ id: string; slug: string }[]>(
    `/api/categories/list`,
    { query: { limit: 100 } }
  );

  // 📌 ساخت آدرس دسته‌بندی‌ها
  return categories.data.categories.map((c: any) => ({
    loc: `/categories/${c.id}/${c.name}`,
    changefreq: "weekly",
    priority: 0.8,
    lastmod: new Date().toISOString(),
  })) satisfies SitemapUrlInput[];
});

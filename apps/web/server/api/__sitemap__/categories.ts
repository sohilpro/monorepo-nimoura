import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";

export default defineSitemapEventHandler(async () => {
  const { apiBase } = useRuntimeConfig();

  // دریافت دسته‌بندی‌ها از API
  const response: any = await $fetch(`${apiBase}/categories`, {
    query: { limit: 100 },
  });

  const categories = response?.data?.categories ?? response?.categories ?? [];

  // ساخت آدرس یکتای دسته‌بندی‌ها بر اساس اسلاگ خود دسته‌بندی
  return categories.map((c: any) => ({
    loc: `/categories/${c.slug || createSlug(c.name)}`,
    changefreq: "weekly",
    priority: 0.8,
    lastmod: c.updatedAt || new Date().toISOString(),
  })) satisfies SitemapUrlInput[];
});

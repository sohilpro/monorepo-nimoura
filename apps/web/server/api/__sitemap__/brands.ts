import type { SitemapUrlInput } from "#sitemap/types";

export default defineSitemapEventHandler(async () => {
  // 📌 دریافت برندها از API
  const brands: any = await $fetch<{ id: string; slug: string }[]>(
    `/api/brand/list`,
    { query: { limit: 100 } }
  );

  // 📌 ساخت آدرس برندها
  return brands.data.brands.map((b: any) => ({
    loc: `/brand/${b.name}/?id=${b.id}`,
    changefreq: "weekly",
    priority: 0.7,
    lastmod: new Date().toISOString(),
  })) satisfies SitemapUrlInput[];
});

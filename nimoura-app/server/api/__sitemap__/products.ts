import type { SitemapUrlInput } from "#sitemap/types";

export default defineSitemapEventHandler(async () => {
  const products: any = await $fetch("/api/products/list", {
    query: {
      limit: 100,
    },
  });

  return products.data.products.map((p: any) => ({
    loc: `/product/${p.id}/${p.title}`,
    lastmod: new Date(p.updatedAt).toISOString(),
    changefreq: "daily",
    priority: 0.9,
  })) satisfies SitemapUrlInput[];
});

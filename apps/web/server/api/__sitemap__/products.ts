import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";

export default defineSitemapEventHandler(async () => {
  const { apiBase } = useRuntimeConfig();

  const response: any = await $fetch(`${apiBase}/products/catalog`, {
    query: {
      limit: 100,
    },
  });

  const products = response?.data?.products ?? response?.products ?? [];

  return products.map((p: any) => ({
    loc: `/product/${p.slug || createSlug(p.title)}`,
    lastmod: new Date(p.updatedAt || Date.now()).toISOString(),
    changefreq: "daily",
    priority: 0.9,
  })) satisfies SitemapUrlInput[];
});

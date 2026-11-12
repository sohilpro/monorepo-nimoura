import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";

export default defineSitemapEventHandler(async () => {
  const { apiBase } = useRuntimeConfig();

  const response: any = await $fetch(`${apiBase}/brands`, {
    query: { limit: 100 },
  });

  const brands = response?.data?.brands ?? response?.brands ?? [];
  const entries: SitemapUrlInput[] = [];
  const now = new Date().toISOString();

  for (const b of brands) {
    const brandSlug = b.slug || createSlug(b.name);
    if (!brandSlug) continue;

    entries.push({
      loc: `/brand/${brandSlug}`,
      changefreq: "weekly",
      priority: 0.7,
      lastmod: b.updatedAt || now,
    });

    for (const sb of b.subBrands ?? []) {
      const subSlug = sb.slug || createSlug(sb.name);
      if (!subSlug) continue;
      entries.push({
        loc: `/brand/${brandSlug}/${subSlug}`,
        changefreq: "weekly",
        priority: 0.6,
        lastmod: b.updatedAt || now,
      });
    }
  }

  return entries;
});

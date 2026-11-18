import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";
import { apiFetch } from "../../utils/apiFetch";
import { unwrapCollection, type SitemapBrand } from "../../types/sitemap";

export default defineSitemapEventHandler(async (event) => {
  const response = await apiFetch(event, "/brands", {
    query: { limit: 100 },
  });

  const brands = unwrapCollection<SitemapBrand>(response as never);
  const entries: SitemapUrlInput[] = [];
  const now = new Date().toISOString();

  for (const brand of brands) {
    const brandSlug = brand.slug || createSlug(brand.name);
    if (!brandSlug) continue;

    entries.push({
      loc: `/brand/${brandSlug}`,
      changefreq: "weekly",
      priority: 0.7,
      lastmod: brand.updatedAt || now,
    });

    for (const subBrand of brand.subBrands ?? []) {
      const subSlug = subBrand.slug || createSlug(subBrand.name);
      if (!subSlug) continue;
      entries.push({
        loc: `/brand/${brandSlug}/${subSlug}`,
        changefreq: "weekly",
        priority: 0.6,
        lastmod: brand.updatedAt || now,
      });
    }
  }

  return entries;
});

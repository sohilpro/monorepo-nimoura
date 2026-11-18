import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";
import { apiFetch } from "../../utils/apiFetch";
import { unwrapCollection, type SitemapCategory } from "../../types/sitemap";

export default defineSitemapEventHandler(async (event) => {
  const response = await apiFetch(event, "/categories", {
    query: { limit: 100 },
  });

  const categories = unwrapCollection<SitemapCategory>(response as never);

  return categories.map((category) => ({
    loc: `/categories/${category.slug || createSlug(category.name)}`,
    changefreq: "weekly",
    priority: 0.8,
    lastmod: category.updatedAt || new Date().toISOString(),
  })) satisfies SitemapUrlInput[];
});

import type { SitemapUrlInput } from "#sitemap/types";
import { createSlug } from "@nimoura/utils";
import { apiFetch } from "../../utils/apiFetch";
import { unwrapCollection, type SitemapProduct } from "../../types/sitemap";

export default defineSitemapEventHandler(async (event) => {
  const response = await apiFetch(event, "/products/catalog", {
    query: { limit: 100 },
  });

  const products = unwrapCollection<SitemapProduct>(response as never);

  return products.map((product) => ({
    loc: `/product/${product.slug || createSlug(product.title)}`,
    lastmod: new Date(product.updatedAt || Date.now()).toISOString(),
    changefreq: "daily",
    priority: 0.9,
  })) satisfies SitemapUrlInput[];
});

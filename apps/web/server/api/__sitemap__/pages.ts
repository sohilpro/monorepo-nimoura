import type { SitemapUrlInput } from "#sitemap/types";

export default defineSitemapEventHandler(() => {
  return [
    { loc: "/products/amazing", changefreq: "daily", priority: 0.8 },
    { loc: "/products/newest", changefreq: "daily", priority: 0.8 },
    { loc: "/products/best-seller", changefreq: "daily", priority: 0.8 },
    { loc: "/about-us" },
    { loc: "/contact-us" },
    { loc: "/faq" },
    { loc: "/rules" },
    { loc: "/terms" },
    { loc: "/shipping-pay" },
    { loc: "/return-policy" },
  ] satisfies SitemapUrlInput[];
});

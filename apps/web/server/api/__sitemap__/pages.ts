import type { SitemapUrlInput } from "#sitemap/types";

export default defineSitemapEventHandler(() => {
  return [
    { loc: "/about-us" },
    { loc: "/contact-us" },
    { loc: "/faq" },
    { loc: "/rules" },
    { loc: "/terms" },
    { loc: "/shipping-pay" },
    { loc: "/return-policy" },
  ] satisfies SitemapUrlInput[];
});

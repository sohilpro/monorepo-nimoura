import { createSlug } from './slug.js';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface CategoryNode {
  id: number;
  name: string;
  slug?: string;
  parent?: CategoryNode | null;
}

export function buildCategoryBreadcrumb(
  category: CategoryNode | null | undefined,
  basePath: string = '/categories',
  options?: { currentLabel?: string },
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'خانه', href: '/' },
  ];

  if (!category) {
    if (options?.currentLabel) {
      items.push({ label: options.currentLabel });
    }
    return items;
  }

  const chain: CategoryNode[] = [];
  const visited = new Set<number>();

  let current: CategoryNode | null | undefined = category;
  while (current) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    chain.push(current);
    current = current.parent;
  }

  chain.reverse();

  const hasCurrentLabel = Boolean(options?.currentLabel);

  chain.forEach((cat, index) => {
    const isLast = !hasCurrentLabel && index === chain.length - 1;
    const slug = cat.slug || createSlug(cat.name);

    items.push({
      label: cat.name || '',
      href: isLast ? undefined : `${basePath}/${encodeURIComponent(slug)}`,
    });
  });

  if (options?.currentLabel) {
    items.push({ label: options.currentLabel });
  }

  return items;
}

export interface BrandNode {
  id: number;
  name: string;
  slug?: string;
  subBrand?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
}

export function buildBrandBreadcrumb(
  brand: BrandNode | null | undefined,
  basePath: string = '/brand',
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'خانه', href: '/' }];

  if (!brand) return items;

  const brandSlug = brand.slug || createSlug(brand.name);
  const encodedBrandSlug = encodeURIComponent(brandSlug);

  if (brand.subBrand) {
    items.push({
      label: brand.name || '',
      href: `${basePath}/${encodedBrandSlug}`,
    });
    items.push({
      label: brand.subBrand.name || '',
      href: undefined,
    });
  } else {
    items.push({
      label: brand.name || '',
      href: undefined,
    });
  }

  return items;
}

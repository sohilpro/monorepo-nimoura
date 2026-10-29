import { createSlug } from './slug';

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
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'خانه', href: '/' },
  ];

  if (!category) return items;

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

  chain.forEach((cat, index) => {
    const isLast = index === chain.length - 1;
    const slug = cat.slug || createSlug(cat.name);

    items.push({
      label: cat.name || '',
      href: isLast ? undefined : `${basePath}/${cat.id}/${slug}`,
    });
  });

  return items;
}

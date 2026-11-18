export interface ApiEnvelope<T> {
  data?: T;
  message?: string | string[];
  success?: boolean;
}

export interface SitemapBrand {
  name: string;
  slug?: string | null;
  updatedAt?: string | Date | null;
  subBrands?: Array<{ name: string; slug?: string | null }>;
}

export interface SitemapCategory {
  name: string;
  slug?: string | null;
  updatedAt?: string | Date | null;
}

export interface SitemapProduct {
  title: string;
  slug?: string | null;
  updatedAt?: string | Date | null;
}

export type CollectionResponse<T> =
  | T[]
  | { brands?: T[]; categories?: T[]; products?: T[]; items?: T[] }
  | ApiEnvelope<{ brands?: T[]; categories?: T[]; products?: T[]; items?: T[] }>;

export function unwrapCollection<T>(response: CollectionResponse<T>): T[] {
  const envelope = response && typeof response === 'object' && 'data' in response
    ? response.data
    : response;
  if (Array.isArray(envelope)) return envelope;
  if (!envelope || typeof envelope !== 'object') return [];
  const collection = envelope as Record<string, unknown>;
  for (const key of ['items', 'brands', 'categories', 'products']) {
    if (Array.isArray(collection[key])) return collection[key] as T[];
  }
  return [];
}

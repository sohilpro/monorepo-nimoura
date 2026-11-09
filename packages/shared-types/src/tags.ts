export interface TagGroup {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  isFilterable: boolean;
  /** only in admin listings */
  tagCount?: number;
  /** only in public / product-form listings */
  tags?: Tag[];
}

export interface Tag {
  id: number;
  groupId: number;
  name: string;
  slug: string;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
  /** only in admin listings */
  productCount?: number;
}

export interface CreateTagGroupPayload {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFilterable?: boolean;
}

export type UpdateTagGroupPayload = Partial<CreateTagGroupPayload>;

export interface CreateTagPayload {
  groupId: number;
  name: string;
  slug?: string;
  color?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;

/** Sidebar filter data returned by GET /products/catalog/facets. */
export interface FacetTag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  count: number;
  selected: boolean;
}

export interface FacetGroup {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  tags: FacetTag[];
}

export interface ProductFacets {
  groups: FacetGroup[];
  price: { min: number; max: number };
  counts: { total: number; inStock: number; onSale: number };
}

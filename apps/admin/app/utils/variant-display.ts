export interface VariantDisplay {
  /** Human readable label, e.g. "۵۰۰ میلی‌لیتر" or "رزگلد". */
  label: string;
  /** "#RRGGBB" for color variants, otherwise null. */
  colorHex: string | null;
  kind: 'volume' | 'weight' | 'color' | 'custom' | null;
}

/**
 * Normalizes the shapes a variant can have in the admin app:
 * - raw API entity: attributeValues[{ value, colorHex, attribute: { kind } }]
 * - storefront / saved order snapshot: { alt, value, colorHex }
 */
export function getVariantDisplay(variant: any): VariantDisplay {
  if (!variant) return { label: '', colorHex: null, kind: null };

  const attrs: any[] = variant.attributeValues ?? [];
  const colorAttr = attrs.find((a) => a?.colorHex || a?.attribute?.kind === 'color');

  const legacyHex =
    typeof variant.value === 'string' && /^#[0-9a-fA-F]{6}$/.test(variant.value) ? variant.value : null;
  const colorHex: string | null = variant.colorHex ?? colorAttr?.colorHex ?? legacyHex;

  const label: string =
    variant.alt || attrs.map((a) => a?.value).filter(Boolean).join(' / ') || variant.sku || '';

  const kind = variant.kind ?? colorAttr?.attribute?.kind ?? attrs[0]?.attribute?.kind ?? (colorHex ? 'color' : null);

  return { label, colorHex, kind };
}

/** Price the customer actually pays: the discounted price when it is valid, otherwise the main price. */
export function getEffectivePrice(item: { price?: number | string; priceDiscount?: number | string } | null | undefined): number {
  const price = Number(item?.price) || 0;
  const discount = Number(item?.priceDiscount) || 0;
  return discount > 0 && discount < price ? discount : price;
}

export function isVariantSellable(variant: { stock?: number; isAvailable?: boolean } | null | undefined): boolean {
  return !!variant && variant.isAvailable !== false && (variant.stock ?? 0) > 0;
}

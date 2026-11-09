export const ATTRIBUTE_KINDS = ['volume', 'weight', 'color', 'custom'] as const;

export type AttributeKind = (typeof ATTRIBUTE_KINDS)[number];

export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/** Default Persian attribute name for each kind. */
export const ATTRIBUTE_KIND_NAMES: Record<AttributeKind, string> = {
  volume: 'حجم',
  weight: 'وزن',
  color: 'رنگ',
  custom: 'ویژگی',
};

/** Infer an attribute kind from its Persian name when the client does not send one. */
export function inferAttributeKind(name: string): AttributeKind {
  const trimmed = name.trim();
  for (const kind of ['volume', 'weight', 'color'] as const) {
    if (ATTRIBUTE_KIND_NAMES[kind] === trimmed) return kind;
  }
  return 'custom';
}

export const ALLOWED_TYPES = [
  "nature", // ماهیت محصول
  "brand-line", // لاین برند
  "skin-type", // نوع پوست
  "hair-type", // جنس مو
  "benefit", // مزیت
] as const;

export type AllowedType = (typeof ALLOWED_TYPES)[number];

export const TYPE_LABELS_FA: Record<AllowedType, string> = {
  nature: "ماهیت محصول",
  "brand-line": "لاین برند",
  "skin-type": "نوع پوست",
  "hair-type": "جنس مو",
  benefit: "مزیت",
};

export function normalizeType(t: string) {
  return t?.trim(); // می‌تونی toLowerCase هم اضافه کنی
}

export function normalizeValue(v: string) {
  return v?.replace(/\s+/g, " ").trim(); // حذف فاصله‌های اضافی
}

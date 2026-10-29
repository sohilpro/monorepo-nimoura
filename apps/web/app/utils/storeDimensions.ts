// app/utils/storeDimensions.ts
export type Vec3 = [number, number, number]

/** همه اندازه‌ها به متر */
export const STORE = {
  width: 12,   // محور X
  depth: 9,    // محور Z (ورودی در z مثبت)
  height: 3.6, // محور Y
  wall: 0.2,   // ضخامت دیوار
  door: { width: 2.4, height: 2.8 },
  eyeHeight: 1.65,
} as const
// app/composables/useShopQuality.ts
export interface AtlasQuality {
  scale: number; // ضریب نسبت به ۲۰۴۸
  mipmaps: boolean;
  anisotropy: number;
  flushMs: number; // فاصله آپلود اطلس به GPU
  concurrency: number; // تعداد دانلود هم‌زمان عکس
}

export interface ShopQuality {
  tier: QualityTier;
  bloom: boolean;
  dust: number;
  dpr: number; // سقف pixel ratio
  antialias: boolean;
  washes: boolean; // نورتابش افزایشی روی قفسه‌ها و سقف
  extraLights: boolean; // spot روی جزیره + نور لوستر
  batch: boolean; // ادغام مش‌های ثابت
  atlas: AtlasQuality;
}

type Preset = Omit<ShopQuality, "tier" | "batch">;

const PRESETS: Record<QualityTier, Preset> = {
  high: {
    bloom: true,
    dust: 240,
    dpr: 2,
    antialias: true,
    washes: true,
    extraLights: true,
    atlas: {
      scale: 1,
      mipmaps: true,
      anisotropy: 4,
      flushMs: 250,
      concurrency: 6,
    },
  },
  medium: {
    bloom: false,
    dust: 90,
    dpr: 1.5,
    antialias: true,
    washes: true,
    extraLights: true,
    atlas: {
      scale: 0.75,
      mipmaps: true,
      anisotropy: 2,
      flushMs: 400,
      concurrency: 4,
    },
  },
  low: {
    bloom: false,
    dust: 40,
    dpr: 1,
    antialias: false,
    washes: false,
    extraLights: false,
    atlas: {
      scale: 0.5,
      mipmaps: false,
      anisotropy: 1,
      flushMs: 600,
      concurrency: 3,
    },
  },
};

const KEY = "shop3d:quality";
const TTL = 14 * 24 * 3600 * 1000;
const ORDER: QualityTier[] = ["low", "medium", "high"];

interface Stored {
  tier: QualityTier;
  scale: number;
  t: number;
}

function readStored(): Stored | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Stored | null;
    return s && Date.now() - s.t < TTL && ORDER.includes(s.tier) ? s : null;
  } catch {
    return null;
  }
}

/** ذخیره نتیجه کنترلر تطبیقی برای دفعه بعد (۱۴ روز اعتبار) */
export function saveQuality(tier: QualityTier, scale: number) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ tier, scale, t: Date.now() } satisfies Stored),
    );
  } catch {
    /* حالت خصوصی مرورگر */
  }
}

export function storedScale(tier: QualityTier): number {
  const s = readStored();
  return s && s.tier === tier ? s.scale : 1;
}

let cached: ShopQuality | null = null;

/**
 * override برای تست: ?quality=low|medium|high   ?quality=reset (پاک‌کردن ذخیره)
 *                    ?bloom=0   ?batch=0
 */
export function useShopQuality(): ShopQuality {
  if (cached) return cached;
  if (!import.meta.client)
    return { tier: "low", ...PRESETS.low, bloom: false, dust: 0, batch: false };

  const params = new URLSearchParams(location.search);
  if (params.get("quality") === "reset") localStorage.removeItem(KEY);

  const s = evaluateSupport();
  const detected: QualityTier = s.ok ? s.tier : "low";
  const forced = params.get("quality") as QualityTier | null;
  const stored = readStored();

  let tier = detected;
  if (forced && ORDER.includes(forced)) tier = forced;
  else if (stored && ORDER.indexOf(stored.tier) < ORDER.indexOf(detected))
    tier = stored.tier;

  const p = PRESETS[tier];
  const mobile = s.ok && s.profile.mobile;
  const dprParam = Number(params.get("dpr")); // برای تست A/B: ?dpr=1
  cached = {
    tier,
    ...p,
    dpr:
      dprParam >= 0.5 && dprParam <= 3
        ? dprParam
        : mobile
          ? Math.min(p.dpr, 1.25)
          : p.dpr,
    bloom: params.get("bloom") === "0" ? false : p.bloom,
    dust: s.ok && s.profile.reducedMotion ? 0 : p.dust, // احترام به «کاهش حرکت»
    batch: params.get("batch") !== "0",
    atlas: { ...p.atlas },
  };
  return cached;
}

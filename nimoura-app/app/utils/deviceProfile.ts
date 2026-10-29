// app/utils/deviceProfile.ts
export type QualityTier = "low" | "medium" | "high";

export interface DeviceProfile {
  renderer: string;
  maxTexture: number;
  mobile: boolean;
  ios: boolean;
  cores: number;
  memory: number | null; // GB؛ فقط Chrome/Android، سقف ۸
  saveData: boolean;
  reducedMotion: boolean;
  integrated: boolean;
  weakGpu: boolean;
  veryWeakGpu: boolean;
}

export type Support =
  | { ok: true; profile: DeviceProfile; tier: QualityTier }
  | { ok: false; reason: "no-webgl2" | "software" | "weak-device" };

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;
// قدیمی‌ترین‌ها: ۳D برایشان معنی ندارد
const VERY_WEAK =
  /mali-4\d\d|mali-t[0-7]\d\d|adreno[^0-9]*[23]\d\d\b|powervr sgx|videocore/i;
// ضعیف ولی قابل‌قبول با کیفیت پایین
const WEAK =
  /mali-t8\d\d|mali-g(31|51|52)\b|adreno[^0-9]*(4|5[0-2])\d\b|powervr|apple a[789]\b/i;
const INTEGRATED = /intel|radeon\(tm\) graphics|\bvega\b.*graphics|mesa/i;

function profileOf(gl: WebGL2RenderingContext): DeviceProfile {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const ua = nav.userAgent;
  const ios =
    /iPhone|iPad|iPod/.test(ua) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  const mobile =
    ios ||
    /Android|Mobile/i.test(ua) ||
    matchMedia("(pointer: coarse)").matches;

  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(
    ext
      ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  );

  return {
    renderer,
    maxTexture: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0,
    mobile,
    ios,
    cores: nav.hardwareConcurrency ?? 4,
    memory: nav.deviceMemory ?? null,
    saveData: !!nav.connection?.saveData,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    integrated: INTEGRATED.test(renderer),
    weakGpu: WEAK.test(renderer),
    veryWeakGpu: VERY_WEAK.test(renderer),
  };
}

/** حدس اولیه سطح کیفیت. کنترلر تطبیقی بعداً اصلاحش می‌کند */
export function detectTier(p: DeviceProfile): QualityTier {
  if (p.saveData || p.weakGpu) return "low";
  if (p.memory !== null && p.memory <= 2) return "low";
  if (!p.ios && p.cores <= 2) return "low";
  if (!p.mobile && !p.integrated && p.cores >= 6) return "high";
  return "medium";
}

function forced(): boolean {
  try {
    if (new URLSearchParams(location.search).get("force3d") === "1")
      sessionStorage.setItem("shop3d:force", "1");
    return sessionStorage.getItem("shop3d:force") === "1";
  } catch {
    return false;
  }
}

function compute(): Support {
  const ctx2 = (opts?: WebGLContextAttributes) => {
    try {
      return document
        .createElement("canvas")
        .getContext("webgl2", opts) as WebGL2RenderingContext | null;
    } catch {
      return null;
    }
  };

  if (forced()) {
    const any = ctx2();
    if (!any) return { ok: false, reason: "no-webgl2" };
    const profile = profileOf(any);
    any.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, profile, tier: "low" };
  }

  // با این گزینه مرورگر روی رندر نرم‌افزاری (بدون GPU) context نمی‌دهد
  const gl = ctx2({ failIfMajorPerformanceCaveat: true });
  if (!gl) {
    const any = ctx2();
    any?.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: false, reason: any ? "software" : "no-webgl2" };
  }

  const profile = profileOf(gl);
  gl.getExtension("WEBGL_lose_context")?.loseContext(); // سقف تعداد context محدود است

  if (SOFTWARE.test(profile.renderer)) return { ok: false, reason: "software" };
  if (
    profile.maxTexture < 2048 ||
    profile.veryWeakGpu ||
    (profile.memory !== null && profile.memory <= 1)
  ) {
    return { ok: false, reason: "weak-device" };
  }
  return { ok: true, profile, tier: detectTier(profile) };
}

let memo: Support | null = null;

/** نتیجه یک‌بار محاسبه و cache می‌شود */
export function evaluateSupport(): Support {
  if (!import.meta.client) return { ok: false, reason: "no-webgl2" };
  return (memo ??= compute());
}

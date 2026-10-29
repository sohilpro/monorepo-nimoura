
type ColorEntry = { name: string; hex: `#${string}` };

export const PERSIAN_COLOR_PALETTE: ColorEntry[] = [
  { name: "سفید", hex: "#FFFFFF" },
  { name: "سیاه", hex: "#000000" },
  { name: "خاکستری روشن", hex: "#D3D3D3" },
  { name: "خاکستری", hex: "#808080" },
  { name: "نقره‌ای", hex: "#C0C0C0" },
  { name: "زرشکی", hex: "#800000" },
  { name: "قرمز", hex: "#FF0000" },
  { name: "قرمز آجری", hex: "#B22222" },
  { name: "زرد", hex: "#FFFF00" },
  { name: "سبز", hex: "#008000" },
  { name: "سبز روشن", hex: "#90EE90" },
  { name: "سبز یشمی", hex: "#2E8B57" },
  { name: "آبی", hex: "#0000FF" },
  { name: "سرمه‌ای", hex: "#000080" },
  { name: "فیروزه‌ای", hex: "#40E0D0" },
  { name: "آبی نفتی", hex: "#2F4F4F" },
  { name: "لاجوردی", hex: "#1E90FF" },
  { name: "بنفش", hex: "#800080" },
  { name: "یاسی", hex: "#D8BFD8" },
  { name: "صورتی", hex: "#FFC0CB" },
  { name: "صورتی چرک", hex: "#DB7093" },
  { name: "رزگلد", hex: "#B76E79" },
  { name: "نارنجی", hex: "#FFA500" },
  { name: "هلویی", hex: "#FFDAB9" },
  { name: "گلبهی", hex: "#F4C2C2" },
  { name: "قهوه‌ای", hex: "#8B4513" },
  { name: "کرم", hex: "#FFFDD0" },
  { name: "شیری", hex: "#F5F5DC" },
  { name: "طلایی", hex: "#D4AF37" },
  { name: "زیتونی", hex: "#808000" },
  { name: "خاکی", hex: "#BDB76B" },
  { name: "یاقوتی", hex: "#E0115F" },
  { name: "آلبالویی", hex: "#8B0000" },
  { name: "نیلی", hex: "#4B0082" },
  { name: "لاجوردی تیره", hex: "#003366" },
  { name: "آبی درباری", hex: "#4169E1" },
  { name: "سبز فسفری", hex: "#7FFF00" },
  { name: "سبز آبی (تیل)", hex: "#008080" },
  { name: "یشمی روشن", hex: "#00FA9A" },
];

// ——— 2) پارسر ورودی به RGB ———
type RGB = { r: number; g: number; b: number };

function parseColor(input: string): RGB {
  const s = input.trim().toLowerCase();

  // #rgb or #rrggbb
  if (s.startsWith("#")) {
    const hex: any = s.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    throw new Error("فرمت هگز نامعتبر است.");
  }

  // rgb(…, …, …)
  const rgbMatch: any = s.match(
    /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/
  );
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10));
    const g = Math.min(255, parseInt(rgbMatch[2], 10));
    const b = Math.min(255, parseInt(rgbMatch[3], 10));
    return { r, g, b };
  }

  throw new Error("فرمت رنگ پشتیبانی نمی‌شود. از #rrggbb یا rgb() استفاده کنید.");
}

// ——— 3) تبدیل sRGB → Lab ———
type Lab = { L: number; a: number; b: number };

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function rgbToXyz({ r, g, b }: RGB): { x: number; y: number; z: number } {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  // ماتریس sRGB D65
  const x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
  return { x, y, z };
}

function xyzToLab({ x, y, z }: { x: number; y: number; z: number }): Lab {
  // مرجع D65
  const Xr = 0.95047;
  const Yr = 1.00000;
  const Zr = 1.08883;

  const fx = f(x / Xr);
  const fy = f(y / Yr);
  const fz = f(z / Zr);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };

  function f(t: number): number {
    return t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
  }
}

function rgbToLab(rgb: RGB): Lab {
  return xyzToLab(rgbToXyz(rgb));
}

// ——— 4) ΔE2000 (پیاده‌سازی فشرده ولی دقیق) ———
function deltaE2000(lab1: Lab, lab2: Lab): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const avgLp = (L1 + L2) / 2;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = hp(b1, a1p);
  const h2p = hp(b2, a2p);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  const dhp = dhPrime(C1p, C2p, h1p, h2p);
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);

  const avgLpM = (L1 + L2) / 2;
  const avgCp = (C1p + C2p) / 2;
  const avghp = hPrimeAvg(C1p, C2p, h1p, h2p);

  const T =
    1 -
    0.17 * Math.cos(deg2rad(avghp - 30)) +
    0.24 * Math.cos(deg2rad(2 * avghp)) +
    0.32 * Math.cos(deg2rad(3 * avghp + 6)) -
    0.20 * Math.cos(deg2rad(4 * avghp - 63));

  const dRo = 30 * Math.exp((-((avghp - 275) / 25)) ** 2);
  const Rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * (avgLpM - 50) ** 2) / Math.sqrt(20 + (avgLpM - 50) ** 2);
  const Sc = 1 + 0.045 * avgCp;
  const Sh = 1 + 0.015 * avgCp * T;
  const Rt = -Math.sin(deg2rad(2 * dRo)) * Rc;

  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh)
  );

  function hp(b: number, ap: number): number {
    const h = Math.atan2(b, ap);
    const deg = rad2deg(h);
    return deg >= 0 ? deg : deg + 360;
  }
  function dhPrime(C1p: number, C2p: number, h1p: number, h2p: number): number {
    if (C1p * C2p === 0) return 0;
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) return diff;
    if (diff > 180) return diff - 360;
    return diff + 360;
  }
  function hPrimeAvg(C1p: number, C2p: number, h1p: number, h2p: number): number {
    if (C1p * C2p === 0) return h1p + h2p;
    if (Math.abs(h1p - h2p) <= 180) return (h1p + h2p) / 2;
    if (h1p + h2p < 360) return (h1p + h2p + 360) / 2;
    return (h1p + h2p - 360) / 2;
  }
  function deg2rad(d: number) { return (d * Math.PI) / 180; }
  function rad2deg(r: number) { return (r * 180) / Math.PI; }
}

// ——— 5) کمکی: hex → Lab ———
function hexToLab(hex: string): Lab {
  return rgbToLab(parseColor(hex));
}

// ——— 6) هسته: نزدیک‌ترین نام فارسی ———
export function nearestPersianColorName(
  inputColor: string,
  palette: ColorEntry[] = PERSIAN_COLOR_PALETTE
): { name: string; hex: string; distance: number } {
  const targetLab = rgbToLab(parseColor(inputColor));
  let best = { name: "", hex: "", distance: Number.POSITIVE_INFINITY };

  for (const entry of palette) {
    const lab = hexToLab(entry.hex);
    const dE = deltaE2000(targetLab, lab);
    if (dE < best.distance) best = { name: entry.name, hex: entry.hex, distance: dE };
  }
  return best;
}

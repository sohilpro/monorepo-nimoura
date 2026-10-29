export function generateOrderCode(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
  const randomPart = Math.floor(1000 + Math.random() * 9000); // عدد 4 رقمی رندوم
  return `VC-${date}${randomPart}`;
}

export function calculateShipping(methodOrCost: string | number): number {
  const rates: Record<string, number> = {
    post: 90_000,
    tipax: 120_000,
    shiraz: 20_000,
    free: 0,
  };

  // اگر عدد بود
  if (typeof methodOrCost === "number") return methodOrCost;

  // اگر رشته بود ولی قابل تبدیل به عدد بود
  const str = methodOrCost.trim();
  const asNumber = Number(str);
  if (!Number.isNaN(asNumber)) return asNumber;

  // در غیر این صورت از جدول نرخ‌ها
  const key = str.toLowerCase();
  if (!(key in rates)) throw new Error("روش ارسال نامعتبر است");

  return rates[key];
}


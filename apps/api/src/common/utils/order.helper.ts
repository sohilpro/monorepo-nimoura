export function generateOrderCode(prefix: string = 'NM'): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}${randomPart}`;
}

export function calculateShipping(methodOrCost: string | number): number {
  const rates: Record<string, number> = {
    post: 90_000,
    tipax: 120_000,
    shiraz: 20_000,
    free: 0,
  };

  if (typeof methodOrCost === 'number') return methodOrCost;

  const str = methodOrCost.trim();
  const asNumber = Number(str);
  if (!Number.isNaN(asNumber)) return asNumber;

  const key = str.toLowerCase();
  if (!(key in rates)) throw new Error('روش ارسال نامعتبر است');

  return rates[key];
}

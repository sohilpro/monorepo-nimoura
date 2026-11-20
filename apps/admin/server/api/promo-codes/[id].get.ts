export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await adminApiFetch<any>(event, `/promotions/${id}`, {
    method: "GET",
  });
  const raw = res?.data ?? res;
  if (!raw) return res;

  const normalized = {
    ...raw,
    code: raw.promoCode || raw.code || "",
    promoCode: raw.promoCode || raw.code || "",
    discountType:
      raw.type === "PERCENTAGE" || raw.discountType === "percentage"
        ? "percentage"
        : "fixed_amount",
    discountValue: String(raw.amount ?? raw.discountValue ?? 0),
    maxDiscountAmount: raw.maxAmount ? String(raw.maxAmount) : null,
    minOrderAmount: raw.minOrderAmount ? String(raw.minOrderAmount) : null,
    usageLimit: raw.maxTotalUses ?? raw.usageLimit ?? null,
    maxTotalUses: raw.maxTotalUses ?? 0,
    usageLimitPerUser: raw.maxUsesPerUser ?? raw.usageLimitPerUser ?? 1,
    maxUsesPerUser: raw.maxUsesPerUser ?? 1,
    usedCount: raw.totalUsed ?? raw.usedCount ?? 0,
    totalUsed: raw.totalUsed ?? 0,
    startDate: raw.startDate,
    endDate: raw.endDate || null,
    isActive: Boolean(raw.isActive),
    isPublic: Boolean(raw.isPublic ?? true),
  };

  return {
    success: true,
    data: normalized,
    ...normalized,
  };
});

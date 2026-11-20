export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cleanQuery: Record<string, any> = {};

  if (query.page) cleanQuery.page = query.page;
  if (query.limit) cleanQuery.limit = query.limit;
  if (query.search && String(query.search).trim() !== "" && query.search !== "undefined") {
    cleanQuery.search = String(query.search).trim();
  }
  if (query.isActive !== undefined && query.isActive !== "" && query.isActive !== "undefined") {
    cleanQuery.isActive = query.isActive === "true" || query.isActive === true;
  }
  const sort = query.sortBy || query.sort;
  if (sort && sort !== "undefined") {
    cleanQuery.sortBy = sort;
  }
  const sortDir = query.sortOrder || query.sortDir;
  if (sortDir && sortDir !== "undefined") {
    cleanQuery.sortOrder = String(sortDir).toUpperCase();
  }

  const res = await adminApiFetch<any>(event, "/promotions", {
    method: "GET",
    query: cleanQuery,
  });

  const rawData = res?.data ?? res;
  const list = rawData?.promotions ?? rawData?.items ?? [];
  const total = Number(rawData?.total ?? list.length);
  const page = Number(cleanQuery.page || rawData?.page || 1);
  const limit = Number(cleanQuery.limit || rawData?.limit || 20);
  const totalPages = Number(rawData?.totalPages ?? (Math.ceil(total / limit) || 1));

  // Normalize items so both usePromoCodes and legacy Promotion components work seamlessly
  const normalizedItems = list.map((p: any) => ({
    id: p.id,
    title: p.title || "",
    code: p.promoCode || p.code || "",
    promoCode: p.promoCode || p.code || "",
    description: p.description || null,
    type: p.type,
    discountType:
      p.type === "PERCENTAGE" || p.discountType === "percentage"
        ? "percentage"
        : "fixed_amount",
    amount: p.amount,
    discountValue: String(p.amount ?? p.discountValue ?? 0),
    maxAmount: p.maxAmount,
    maxDiscountAmount: p.maxAmount ? String(p.maxAmount) : null,
    minOrderAmount: p.minOrderAmount ? String(p.minOrderAmount) : null,
    usageLimit: p.maxTotalUses ?? p.usageLimit ?? null,
    maxTotalUses: p.maxTotalUses ?? 0,
    usageLimitPerUser: p.maxUsesPerUser ?? p.usageLimitPerUser ?? 1,
    maxUsesPerUser: p.maxUsesPerUser ?? 1,
    usedCount: p.totalUsed ?? p.usedCount ?? 0,
    totalUsed: p.totalUsed ?? 0,
    startDate: p.startDate,
    endDate: p.endDate || null,
    isActive: Boolean(p.isActive),
    isPublic: Boolean(p.isPublic ?? true),
    firstOrderOnly: Boolean(p.firstOrderOnly ?? false),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const payload = {
    items: normalizedItems,
    promotions: normalizedItems,
    total,
    page,
    limit,
    totalPages,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };

  return {
    success: true,
    data: payload,
    ...payload,
  };
});

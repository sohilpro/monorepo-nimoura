export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const promoCode = (body.promoCode || body.code || "").trim();
  const type =
    body.discountType === "percentage" ||
    body.type === "PERCENTAGE" ||
    body.discountType === "PERCENTAGE"
      ? "PERCENTAGE"
      : "FIXED";

  const payload: any = {
    title: body.title || (promoCode ? `کد تخفیف ${promoCode}` : "کد تخفیف"),
    description: body.description || undefined,
    type,
    amount: Number(body.amount ?? body.discountValue ?? 0),
    promoCode: promoCode || undefined,
    code: promoCode || undefined,
    startDate: body.startDate ? new Date(body.startDate) : new Date(),
    endDate: body.endDate
      ? new Date(body.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    firstOrderOnly: Boolean(body.firstOrderOnly),
  };

  if (body.maxDiscountAmount !== undefined && body.maxDiscountAmount !== null) {
    payload.maxAmount = Number(body.maxDiscountAmount);
  } else if (body.maxAmount !== undefined && body.maxAmount !== null) {
    payload.maxAmount = Number(body.maxAmount);
  }

  if (body.minOrderAmount !== undefined && body.minOrderAmount !== null) {
    payload.minOrderAmount = Number(body.minOrderAmount);
  }

  if (body.usageLimit !== undefined && body.usageLimit !== null) {
    payload.maxTotalUses = Number(body.usageLimit);
  } else if (body.maxTotalUses !== undefined && body.maxTotalUses !== null) {
    payload.maxTotalUses = Number(body.maxTotalUses);
  }

  if (body.usageLimitPerUser !== undefined && body.usageLimitPerUser !== null) {
    payload.maxUsesPerUser = Number(body.usageLimitPerUser);
  } else if (body.maxUsesPerUser !== undefined && body.maxUsesPerUser !== null) {
    payload.maxUsesPerUser = Number(body.maxUsesPerUser);
  }

  if (Array.isArray(body.productIds)) payload.productIds = body.productIds;
  if (Array.isArray(body.categoryIds)) payload.categoryIds = body.categoryIds;
  if (Array.isArray(body.brandIds)) payload.brandIds = body.brandIds;

  return await adminApiFetch(event, "/promotions", {
    method: "POST",
    body: payload,
  });
});

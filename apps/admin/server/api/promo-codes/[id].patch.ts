export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  const payload: any = {};
  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  if (body.type || body.discountType) {
    payload.type =
      body.discountType === "percentage" ||
      body.type === "PERCENTAGE" ||
      body.discountType === "PERCENTAGE"
        ? "PERCENTAGE"
        : "FIXED";
  }
  if (body.amount !== undefined || body.discountValue !== undefined) {
    payload.amount = Number(body.amount ?? body.discountValue);
  }
  if (body.promoCode !== undefined || body.code !== undefined) {
    payload.promoCode = (body.promoCode || body.code || "").trim();
    payload.code = payload.promoCode;
  }
  if (body.startDate) payload.startDate = new Date(body.startDate);
  if (body.endDate) payload.endDate = new Date(body.endDate);
  if (body.isPublic !== undefined) payload.isPublic = Boolean(body.isPublic);
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);
  if (body.maxDiscountAmount !== undefined) payload.maxAmount = Number(body.maxDiscountAmount);
  if (body.maxAmount !== undefined) payload.maxAmount = Number(body.maxAmount);
  if (body.minOrderAmount !== undefined) payload.minOrderAmount = Number(body.minOrderAmount);
  if (body.usageLimit !== undefined) payload.maxTotalUses = Number(body.usageLimit);
  if (body.maxTotalUses !== undefined) payload.maxTotalUses = Number(body.maxTotalUses);
  if (body.usageLimitPerUser !== undefined) payload.maxUsesPerUser = Number(body.usageLimitPerUser);
  if (body.maxUsesPerUser !== undefined) payload.maxUsesPerUser = Number(body.maxUsesPerUser);

  return await adminApiFetch(event, `/promotions/${id}`, {
    method: "PUT",
    body: payload,
  });
});

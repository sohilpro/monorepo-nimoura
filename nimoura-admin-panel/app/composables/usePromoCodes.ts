import type {
  PromoCode,
  PromoCodeFormState,
  PromoCodeQuery,
  PaginatedResponse,
} from "~~/server/types/promo-code";

/**
 * Admin composable for managing promo codes.
 * All requests go through Nuxt's server routes (server/api/admin/promo-codes/**)
 * which forward to the NestJS backend with the user's auth cookie.
 */
export function usePromoCodes() {
  const items = useState<PromoCode[]>("promo-codes:list", () => []);
  const meta = useState<PaginatedResponse<PromoCode>["meta"]>(
    "promo-codes:meta",
    () => ({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }),
  );
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchList(query: PromoCodeQuery = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await $fetch<{ data: PaginatedResponse<PromoCode> }>(
        "/api/promo-codes",
        {
          query,
        },
      );
      items.value = res.data.items;
      meta.value = res.data.meta;
      return res.data;
    } catch (e: any) {
      error.value =
        e?.data?.statusMessage ??
        e?.statusMessage ??
        "خطا در دریافت لیست کدهای تخفیف";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createPromoCode(payload: PromoCodeFormState) {
    return $fetch<PromoCode>("/api/promo-codes", {
      method: "POST",
      body: toApiPayload(payload),
    });
  }

  async function updatePromoCode(
    id: string,
    payload: Partial<PromoCodeFormState>,
  ) {
    return $fetch<PromoCode>(`/api/promo-codes/${id}`, {
      method: "PATCH",
      body: toApiPayload(payload),
    });
  }

  async function deletePromoCode(id: string) {
    return $fetch(`/api/promo-codes/${id}`, { method: "DELETE" });
  }

  async function toggleActive(id: string) {
    return $fetch<PromoCode>(`/api/promo-codes/${id}/toggle-active`, {
      method: "PATCH",
    });
  }

  async function generateCode(prefix?: string) {
    const res = await $fetch<{ data: { code: string } }>(
      "/api/promo-codes/generate-code",
      {
        method: "POST",
        body: { prefix },
      },
    );
    return res.data.code;
  }

  async function fetchUsages(id: string, page = 1, limit = 20) {
    return $fetch(`/api/promo-codes/${id}/usages`, {
      query: { page, limit },
    });
  }

  return {
    items,
    meta,
    loading,
    error,
    fetchList,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActive,
    generateCode,
    fetchUsages,
  };
}

/** Converts form state (Date objects, nulls) into the API's expected JSON shape. */
function toApiPayload(payload: Partial<PromoCodeFormState>) {
  return {
    ...payload,
    startDate:
      payload.startDate instanceof Date
        ? payload.startDate.toISOString()
        : payload.startDate,
    endDate:
      payload.endDate instanceof Date
        ? payload.endDate.toISOString()
        : payload.endDate,
    discountValue: payload.discountValue ?? undefined,
    maxDiscountAmount: payload.maxDiscountAmount ?? undefined,
    minOrderAmount: payload.minOrderAmount ?? undefined,
    usageLimit: payload.usageLimit ?? undefined,
    usageLimitPerUser: payload.usageLimitPerUser ?? undefined,
  };
}

// composables/usePaymentResult.ts
export interface PaymentResult {
  status: "loading" | "success" | "failed";
  gateway: "zarinpal" | "torobpay" | null;
  refId: string | number | null;
  message: string;
  date: Date | any;
}

export function usePaymentResult() {
  const route = useRoute();
  const cart: any = useCartStore();
  const toast = useToast();

  const result = reactive<PaymentResult>({
    status: "loading",
    gateway: null,
    refId: null,
    message: "در حال تایید نهایی تراکنش...",
    date: new Date(),
  });

  function resetCartOnSuccess() {
    cart.clearCart();
  }

  function clearTorobSession() {
    const tokenCookie = useCookie("paymentToken");
    const orderCookie = useCookie("lastOrderId");
    tokenCookie.value = null;
    orderCookie.value = null;

    if (import.meta.client) {
      sessionStorage.removeItem("paymentToken");
      sessionStorage.removeItem("lastOrderId");
    }
  }

  async function verifyZarinpal() {
    result.gateway = "zarinpal";

    const data: any = await $fetch("/api/payment/verify", {
      query: route.query,
    });

    result.status = data.data.success ? "success" : "failed";
    result.refId = data.data.refId ?? null;
    result.message = data.data.message;

    toast.add({
      severity: data.data.success ? "success" : "error",
      summary: data.data.success ? "پرداخت موفق" : "پرداخت ناموفق",
      detail: data.data.message,
      life: 4000,
    });

    if (data.data.success) resetCartOnSuccess();
  }

  async function verifyTorob(paymentToken: string, orderId: string | null) {
    result.gateway = "torobpay";

    const data: any = await $fetch("/api/torob/callback", {
      method: "POST",
      body: { paymentToken, orderId },
    });

    result.status = data.success ? "success" : "failed";
    result.refId = data.transactionId ?? null;
    result.message =
      data.message ??
      (data.success ? "پرداخت با موفقیت انجام شد" : "تراکنش توسط درگاه تایید نشد.");

    toast.add({
      severity: data.success ? "success" : "error",
      summary: data.success ? "پرداخت موفق" : "پرداخت ناموفق",
      detail: result.message,
      life: 4000,
    });

    if (data.success) resetCartOnSuccess();
  }

  async function verify() {
    // زرین‌پال همیشه Authority/Status رو در URL برمی‌گردونه — این تشخیص قطعیه
    const isZarinpalCallback = !!route.query.Authority || !!route.query.Status;

    try {
      if (isZarinpalCallback) {
        await verifyZarinpal();
      } else {
        const paymentToken =
          useCookie("paymentToken").value || useSessionStorage("paymentToken").value;
        const orderId =
          useCookie("lastOrderId").value || useSessionStorage("lastOrderId").value;

        if (!paymentToken) {
          result.status = "failed";
          result.message = "اطلاعات پرداخت یافت نشد.";

          toast.add({
            severity: "error",
            summary: "خطا",
            detail: result.message,
            life: 4000,
          });
          return;
        }

        await verifyTorob(paymentToken, orderId);
      }
    } catch (err: any) {
      result.status = "failed";
      result.message =
        err?.data?.data?.message || err?.data?.message || "خطا در برقراری ارتباط با سرور.";

      toast.add({
        severity: "error",
        summary: "خطا",
        detail: result.message,
        life: 4000,
      });
    } finally {
      clearTorobSession();
      useSessionStorage("lastOrderId").value = null;
    }
  }

  return { result, verify };
}
<script setup lang="ts">
const toast = useAppToast();
const router = useRouter();
const cart = useCartSummary();
const checkout = useCheckout();
const { clearCart } = useCartActions();

const submitting = ref(false);
const isTorobEligible = ref(false);

// آیا کد تخفیف روی سفارش فعاله؟ (ترب‌پی و اسنپ‌پی با تخفیف همزمان پشتیبانی نمی‌شن)
const hasPromotion = computed(() => !!checkout.value.promotionId);

// فقط ۳ روش پرداختی که بک‌اند پشتیبانی می‌کنه (مطابق enum PaymentMethod)
const methods = [
  {
    id: 'zarinpal',
    title: 'زرین‌پال',
    desc: 'پرداخت آنلاین با تمامی کارت‌های بانکی عضو شتاب',
    icon: 'pi-credit-card',
  },
  {
    id: 'snapp_pay',
    title: 'اسنپ‌پی',
    desc: 'خرید اعتباری، پرداخت در اقساط بدون کارمزد',
    icon: 'pi-wallet',
    badge: 'به‌زودی',
  },
  {
    id: 'torobpay',
    title: 'ترب‌پی',
    desc: 'پرداخت آنلاین از طریق درگاه ترب‌پی',
    icon: 'pi-send',
  },
] as const;

// حذف کامل گزینه‌های ناسازگار با تخفیف از لیست، مثل نسخه‌ی قبلی
const visibleMethods = computed(() =>
  methods.filter((m) => {
    if (hasPromotion.value && (m.id === 'torobpay' || m.id === 'snapp_pay')) {
      return false;
    }
    return true;
  })
);

function isMethodDisabled(id: string) {
  if (id === 'snapp_pay') return true; // بک‌اند هنوز آماده نیست
  if (id === 'torobpay') return !isTorobEligible.value;
  return false;
}

onMounted(async () => {
  // هم addressId (آدرس قبلی) و هم address کامل رو چک می‌کنیم
  if (!checkout.value.addressId && !checkout.value.address) {
    router.replace('/checkout');
    return;
  }
  await cart.refresh();
  if (!checkout.value.paymentMethod) checkout.value.paymentMethod = 'zarinpal';
});

function buildOrderPayload() {
  return {
    items: cart.items.value.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      ...(i.variant ? { variant: i.variant } : {}),
    })),
    shippingInfo: {
      first_name: checkout.value.firstName,
      last_name: checkout.value.lastName,
      phone: checkout.value.phone,
      note: checkout.value.note || undefined,
      addressId: checkout.value.addressId || undefined,
      address: checkout.value.address,
    },
    paymentInfo: {
      method: checkout.value.paymentMethod,
      isPaid: false,
    },
    ...(checkout.value.promotionId
      ? { promotionId: checkout.value.promotionId }
      : {}),
    ...(checkout.value.shippingCost !== undefined &&
    checkout.value.shippingCost !== null
      ? { shippingCost: String(checkout.value.shippingCost) }
      : {}),
  };
}

// ============================================================
// درخواست پرداخت با ترب‌پی — همون منطق و همون بادی نسخه‌ی قبلی
// ============================================================
async function payWithTorob(orderId: number) {
  const response: any = await $fetch('/api/torob/request', {
    method: 'POST',
    body: {
      totalPrice: cart.totalPrice.value,
      orderId,
      cartItems: cart.items.value.map((i: any) => ({
        id: i.productId,
        title: i.title,
        price: i.price,
        priceDiscount: i.priceDiscount,
        quantity: i.quantity,
        sku: i.sku,
        thumbnail: i.thumbnail,
      })),
    },
  });

  if (response?.token) {
    const tokenCookie = useCookie('paymentToken', { maxAge: 60 * 15 });
    tokenCookie.value = response.token;
    useSessionStorage('paymentToken').value = response.token;
  }

  if (response?.url) {
    await navigateTo(response.url, { external: true });
  }
}

// ============================================================
// درخواست پرداخت با زرین‌پال (و سایر درگاه‌های عمومی) — همون منطق قبلی
// ============================================================
async function payWithGateway(orderId: number) {
  
  const data: any = await $fetch('/api/payment/create', {
    method: 'POST',
    body: {
      orderId,
      amount: cart.totalPrice.value,
    },
  });

  await navigateTo(data.data.redirectUrl.url, { external: true });

  // پاکسازی سبد خرید فقط بعد از هدایت موفق به درگاه (رفتار قبلی حفظ شد)
  await clearCart();
}

async function submitOrder() {
  if (!checkout.value.paymentMethod) return;
  if (isMethodDisabled(checkout.value.paymentMethod)) return;

  submitting.value = true;

  try {
    // ۱. ثبت سفارش
    const orderRes = await $fetch<any>('/api/orders', {
      method: 'POST',
      body: buildOrderPayload(),
    });

    const orderId = orderRes.data.orderId;

    // ۲. هدایت به درگاه، بسته به روش پرداخت انتخاب‌شده
    if (checkout.value.paymentMethod === 'torobpay') {
      await payWithTorob(orderId);
    } else {
      await payWithGateway(orderId);
    }
  } catch (e: any) {
    console.error('Payment Error:', e);

    toast.add({
      severity: 'error',
      summary: 'خطا در پرداخت',
      detail:
        e?.data?.message ??
        e?.data?.data?.message ??
        'مشکلی پیش آمد، دوباره تلاش کنید.',
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  shopTrackPurchase({
    id: order.id,
    total: order.total,
    productIds: order.items.map((i: any) => i.productId),
  })
})
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
    <!-- کامپوننت eligibility ترب‌پی — فقط برای گرفتن eligibility مونت می‌شه، UI خودش نمایش داده نمی‌شه -->
    <ClientOnly>
      <CartTorobPay class="hidden" @torob-eligible="(el) => (isTorobEligible = el)" />
    </ClientOnly>

    <!-- استپر -->
    <CartCheckoutStepper current="payment" />

    <!-- انتخاب روش پرداخت -->
    <div class="grid lg:grid-cols-3 gap-8 items-start">
      <div class="lg:col-span-2 space-y-4">
        <h3 class="font-display text-lg text-nimoura-text-900 mb-2">روش پرداخت را انتخاب کنید</h3>

        <label
          v-for="m in visibleMethods"
          :key="m.id"
          class="flex items-center gap-4 border rounded-2xl p-5 transition-colors bg-white"
          :class="[
            checkout.paymentMethod === m.id
              ? 'border-nimoura-text-primary ring-1 ring-nimoura-primary/30'
              : 'border-nimoura-text-100 hover:border-nimoura-text-300',
            isMethodDisabled(m.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]"
        >
          <input
            type="radio"
            class="accent-nimoura-primary w-4 h-4"
            :value="m.id"
            v-model="checkout.paymentMethod"
            :disabled="isMethodDisabled(m.id)"
          />
          <div class="w-11 h-11 rounded-full bg-nimoura-primary/10 flex items-center justify-center text-nimoura-primary">
            <i class="pi" :class="m.icon"></i>
          </div>
          <div class="flex-1">
            <p class="flex items-center gap-2 font-medium text-nimoura-text-800">
              {{ m.title }}
              <span
                v-if="m.badge || (m.id === 'torobpay' && !isTorobEligible)"
                class="rounded-full bg-nimoura-text-100 px-2 py-0.5 text-[10px] font-bold text-nimoura-text-500"
              >
                {{ m.badge || 'غیرفعال' }}
              </span>
            </p>
            <p class="text-xs text-nimoura-text-500 mt-0.5">{{ m.desc }}</p>
          </div>
        </label>
      </div>

      <!-- خلاصه سفارش -->
      <div class="lg:sticky lg:top-6">
        <div class="bg-white border border-nimoura-text-100 rounded-2xl p-6 shadow-sm">
          <h3 class="font-display text-lg text-nimoura-text-900 mb-5">خلاصه پرداخت</h3>
          <div class="space-y-2.5 text-sm text-nimoura-text-600 mb-4">
            <div class="flex justify-between"><span>جمع سبد خرید</span><span>{{ numberFormat(cart.totalPrice.value) }}</span></div>
            <div class="flex justify-between"><span>هزینه ارسال</span><span class="text-nimoura-primary">پس کرایه</span></div>
          </div>
          <Divider />
          <div class="flex justify-between items-center mb-6">
            <span class="font-display text-nimoura-text-800">مبلغ قابل پرداخت</span>
            <span class="font-display text-xl text-nimoura-primary font-semibold font-modam">{{ numberFormat(cart.totalPrice.value) }}</span>
          </div>

          <Button
            label="پرداخت و ثبت نهایی سفارش"
            icon="pi pi-lock"
            icon-pos="left"
            :loading="submitting"
            :disabled="!checkout.paymentMethod || isMethodDisabled(checkout.paymentMethod)"
            class="!w-full !bg-nimoura-primary !border-nimoura-primary !py-3 !rounded-full"
            @click="submitOrder"
          />
          <p class="text-[11px] text-nimoura-text-400 text-center mt-3">
            با کلیک روی دکمه، قوانین و مقررات فروشگاه را می‌پذیرید.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
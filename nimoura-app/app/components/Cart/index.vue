<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const cartActions = useCartActions();
const cartStore = useCartStore();
const {
  isLoggedIn,
  loading,
  items,
  totalCount,
  totalPrice,
  totalDiscount,
  refresh,
} = useCartSummary();

const validating = ref(false);
const syncingGuestCart = ref(false);
const promoCode = ref("");
const applyingPromo = ref(false);

async function handleRemove(item: any) {
  await cartActions.removeItem(item.productId, item.variant);
}

async function handleQty(item: any, dir: "inc" | "dec") {
  if (dir === "dec" && item.quantity <= 1) {
    return handleRemove(item);
  }
  const nextQty = dir === "inc" ? item.quantity + 1 : item.quantity - 1;
  await cartActions.updateQuantity(item.productId, nextQty, item.variant);
}

// آیا آیتم‌های داخل استور، آیتم‌های «مهمان» هستن (ساختار فلت، بدون product تو در تو)؟
function hasGuestShapedItems() {
  return cartStore.items.some((i: any) => !i.product);
}

// سینک سبد مهمان با بک‌اند بعد از لاگین
async function syncGuestCartIfNeeded() {
  if (!isLoggedIn.value) return;
  if (!hasGuestShapedItems() || cartStore.items.length === 0) return;

  syncingGuestCart.value = true;
  try {
    const ok = await cartActions.syncCart();
    if (ok) {
      await refresh(); // سبد رو از سرور (بعد از سینک) دوباره می‌خونیم
    }
  } finally {
    syncingGuestCart.value = false;
  }
}

async function goToCheckout() {
  // اگه لاگین نیست، اول باید بره احراز هویت و بعد برگرده همینجا
  if (!isLoggedIn.value) {
    router.push({ path: "/auth", query: { redirect: "/cart" } });
    return;
  }

  validating.value = true;
  try {
    const res = await cartActions.validatePrices();
    if (res.changed) {
      if (isLoggedIn.value) await refresh();
      return;
    }
    router.push("/cart/checkout");
  } finally {
    validating.value = false;
  }
}

async function applyPromo() {
  if (!promoCode.value) return;
  applyingPromo.value = true;
  try {
    // اعمال نهایی کد تخفیف در مرحله پرداخت انجام می‌شود
  } finally {
    applyingPromo.value = false;
  }
}

onMounted(async () => {
  // اگه از صفحه‌ی auth با ریدایرکت به اینجا برگشتیم و کاربر لاگین کرده، اول سینک کن
  await syncGuestCartIfNeeded();
  await refresh();
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
    <!-- استپر مراحل -->
    <CartCheckoutStepper v-if="items.length !== 0"/>

    <div
      v-if="syncingGuestCart"
      class="flex items-center justify-center gap-2 py-4 text-sm text-nimoura-500 mb-4"
    >
      <i class="pi pi-spin pi-spinner"></i>
      در حال هماهنگ‌سازی سبد خرید شما...
    </div>

    <!-- حالت لودینگ (فقط واکشی اولیه سبد کاربر لاگین‌شده) -->
    <div v-if="loading" class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <Skeleton v-for="n in 3" :key="n" height="7rem" class="rounded-2xl" />
      </div>
      <Skeleton height="20rem" class="rounded-2xl" />
    </div>

    <!-- سبد خالی -->
    <div
      v-else-if="items.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <i class="pi pi-shopping-bag text-6xl! text-nimoura-text-300 mb-6"></i>
      <h2 class="font-display text-xl text-nimoura-text-800 mb-2">
        سبد خرید شما خالی است
      </h2>
      <p class="text-nimoura-text-500 mb-8">
        هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.
      </p>
      <NuxtLink to="/products">
        <Button
          label="مشاهده محصولات"
          class="!bg-nimoura-primary !border-nimoura-primary !px-8 !py-3 !rounded-full"
        />
      </NuxtLink>
    </div>

    <!-- محتوای اصلی -->
    <div v-else class="grid lg:grid-cols-3 gap-8 items-start">
      <!-- لیست آیتم‌ها -->
      <div class="lg:col-span-2 space-y-4">
        <TransitionGroup name="list">
          <div
            v-for="item in items"
            :key="item.key"
            class="group bg-white/70 backdrop-blur border border-nimoura-text-100 rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <NuxtLink :to="`/products/${item.slug}`" class="shrink-0">
              <img
                :src="item.thumbnail || '/images/placeholder-product.jpg'"
                :alt="item.title"
                class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-nimoura-text-100"
              />
            </NuxtLink>

            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div class="flex justify-between gap-3">
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/products/${item.slug}`"
                    class="font-display text-nimoura-text-900 text-base sm:text-lg hover:text-nimoura-primary transition-colors line-clamp-1"
                  >
                    {{ item.title }}
                  </NuxtLink>
                  <Tag
                    v-if="item.variant"
                    :value="item.variant.alt"
                    class="!bg-nimoura-100 !text-nimoura-text-700 !text-xs mt-2"
                  />
                </div>
                <button
                  class="text-nimoura-text-300 text-red-400 transition-colors h-fit"
                  @click="handleRemove(item)"
                  aria-label="حذف از سبد"
                >
                  <i class="pi pi-trash text-lg"></i>
                </button>
              </div>

              <div class="flex items-center justify-between mt-4">
                <!-- استپر تعداد -->
                <div
                  class="flex items-center border border-nimoura-text-200 rounded-full overflow-hidden"
                >
                  <button
                    class="w-9 h-9 flex items-center justify-center text-nimoura-text-600 hover:bg-nimoura-100 disabled:opacity-40 transition-colors"
                    @click="handleQty(item, 'dec')"
                  >
                    <i class="pi pi-minus text-xs"></i>
                  </button>
                  <span
                    class="w-10 text-center font-medium text-nimoura-text-800 select-none font-modam"
                    >{{ item.quantity }}</span
                  >
                  <button
                    class="w-9 h-9 flex items-center justify-center text-nimoura-text-600 hover:bg-nimoura-100 transition-colors"
                    @click="handleQty(item, 'inc')"
                  >
                    <i class="pi pi-plus text-xs"></i>
                  </button>
                </div>

                <!-- قیمت -->
                <div class="text-left">
                  <p
                    v-if="item.priceDiscount > 0"
                    class="text-xs text-nimoura-text-400 line-through font-modam"
                  >
                    {{ numberFormat(item.price * item.quantity) }}
                  </p>
                  <p class="font-semibold text-nimoura-text-900 font-modam">
                    {{
                      numberFormat(
                        (item.priceDiscount > 0
                          ? item.priceDiscount
                          : item.price) * item.quantity,
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- خلاصه سفارش -->
      <div class="lg:sticky lg:top-6">
        <div
          class="bg-white border border-nimoura-text-100 rounded-2xl p-6 shadow-sm"
        >
          <h3 class="font-display text-lg text-nimoura-text-900 mb-5">
            خلاصه سفارش
          </h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-nimoura-text-600">
              <span>تعداد کالا</span>
              <span
                ><span class="font-modam">{{ totalCount }}</span> عدد</span
              >
            </div>
            <div
              v-if="totalDiscount > 0"
              class="flex justify-between text-nimoura-text-600"
            >
              <span>تخفیف کالاها</span>
              <span class="text-nimoura-primary font-modam"
                >{{ numberFormat(totalDiscount) }}-</span
              >
            </div>
          </div>

          <!-- کد تخفیف -->
          <div class="mt-5">
            <label class="text-xs text-nimoura-text-500 mb-1.5 block"
              >کد تخفیف</label
            >
            <div class="flex gap-2">
              <input
                v-model="promoCode"
                type="text"
                placeholder="کد تخفیف را وارد کنید"
                class="flex-1 border border-nimoura-text-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nimoura-primary/30 focus:border-text-primary"
              />
              <Button
                label="اعمال"
                :loading="applyingPromo"
                class="bg-nimoura-text-800! !border-nimoura-text-800 !text-sm !px-4"
                @click="applyPromo"
              />
            </div>
            <p class="text-[11px] text-nimoura-text-400 mt-1.5">
              کد تخفیف در مرحله پرداخت نهایی اعمال می‌شود.
            </p>
          </div>

          <Divider />

          <div class="flex justify-between items-center mb-6">
            <span class="font-display text-nimoura-text-800">جمع کل</span>
            <span
              class="font-display text-xl text-nimoura-primary font-semibold font-modam"
              >{{ numberFormat(totalPrice) }}</span
            >
          </div>

          <Button
            label="ادامه فرآیند خرید"
            icon="pi pi-arrow-left"
            icon-pos="left"
            :loading="validating"
            class="!w-full !bg-nimoura-primary !border-nimoura-primary !py-3 !rounded-full"
            @click="goToCheckout"
          />

          <div
            class="flex items-center justify-center gap-4 mt-6 text-nimoura-text-400 text-xs"
          >
            <span class="flex items-center gap-1"
              ><i class="pi pi-shield"></i> پرداخت امن</span
            >
            <span class="flex items-center gap-1"
              ><i class="pi pi-refresh"></i> بازگشت کالا</span
            >
            <span class="flex items-center gap-1"
              ><i class="pi pi-truck"></i> ارسال سریع</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

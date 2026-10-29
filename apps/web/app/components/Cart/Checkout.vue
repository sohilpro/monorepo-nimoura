<script setup lang="ts">
const toast = useToast();
const router = useRouter();
const cart = useCartSummary();
const checkout = useCheckout();

const { addresses, loading, fetchAddresses } = useAddresses();
const auth = useAuth();
const showAddDialog = ref(false);
const isSelfRecipient = ref(false);

const inputClass =
  "w-full border border-nimoura-text-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nimoura-primary/30 focus:border-nimoura-primary";

function warnToast(summary: string, detail: string) {
  toast.add({ severity: "warn", summary, detail, life: 3000 });
}

// وقتی «گیرنده خودم هستم» تیک بخوره، نام و نام‌خانوادگی از پروفایل کاربر پر می‌شه.
// اگر کاربر این اطلاعات رو در پروفایلش نداشته باشه، فیلدها همچنان باز و قابل‌ویرایش
// می‌مونن تا خودش دستی وارد کنه.
watch(isSelfRecipient, (checked) => {
  if (!checked) return;
  if (auth.value?.first_name) checkout.value.firstName = auth.value.first_name;
  if (auth.value?.last_name) checkout.value.lastName = auth.value.last_name;
  if (auth.value?.mobile) checkout.value.phone = auth.value.mobile;
});

function goToPayment() {
  if (!checkout.value.addressId) {
    warnToast("انتخاب آدرس", "لطفاً یک آدرس انتخاب کنید.");
    return;
  }
  if (
    !checkout.value.firstName ||
    !checkout.value.lastName ||
    !checkout.value.phone
  ) {
    warnToast("اطلاعات ناقص", "نام، نام‌خانوادگی و شماره تماس الزامی است.");
    return;
  }
  router.push("/cart/payment");
}

onMounted(async () => {
  await Promise.all([fetchAddresses(), cart.refresh()]);
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
    <!-- استپر مراحل -->
    <CartCheckoutStepper current="shipping" />

    <div class="grid lg:grid-cols-3 gap-8 items-start">
      <div class="lg:col-span-2 space-y-8">
        <!-- انتخاب آدرس -->
        <div
          class="bg-white border border-nimoura-text-100 rounded-2xl p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-display text-lg text-nimoura-text-900">
              آدرس تحویل سفارش
            </h3>
            <button
              class="text-nimoura-primary text-sm flex items-center gap-1 hover:underline"
              @click="showAddDialog = true"
            >
              <i class="pi pi-plus text-xs"></i> افزودن آدرس جدید
            </button>
          </div>

          <!-- اسکلتون: دقیقاً هم‌شکل گرید و کارت‌های واقعی آدرس -->
          <div v-if="loading" class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="n in 2"
              :key="n"
              class="border border-nimoura-text-200 rounded-xl p-4"
            >
              <div class="flex items-start gap-3">
                <Skeleton shape="circle" size="1.1rem" class="mt-1 shrink-0" />
                <div class="flex-1 space-y-2">
                  <Skeleton width="35%" height="0.9rem" />
                  <Skeleton width="90%" height="0.8rem" />
                  <Skeleton width="50%" height="0.7rem" />
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="addresses.length === 0"
            class="text-center py-8 text-nimoura-text-400"
          >
            <i class="pi pi-map-marker text-3xl mb-3 block"></i>
            هنوز آدرسی ثبت نکرده‌اید.
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-3">
            <label
              v-for="addr in addresses"
              :key="addr.id"
              class="cursor-pointer border rounded-xl p-4 transition-colors"
              :class="
                checkout.addressId === addr.id
                  ? 'border-nimoura-primary bg-nimoura-primary/5'
                  : 'border-nimoura-text-200 hover:border-nimoura-text-300'
              "
            >
              <div class="flex items-start gap-3">
                <input
                  type="radio"
                  class="mt-1 accent-nimoura-primary"
                  :value="addr.id"
                  v-model="checkout.addressId"
                />
                <div class="text-sm">
                  <p class="font-medium text-nimoura-text-800">
                    {{ addr.title || "آدرس" }}
                  </p>
                  <p class="text-nimoura-text-500 mt-1 leading-6">
                    {{ addr.state }}، {{ addr.city }}، {{ addr.address }}
                  </p>
                  <p class="text-nimoura-text-400 text-xs mt-1">
                    کد پستی:
                    <span class="font-modam"> {{ addr.postal_code }}</span>
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- اطلاعات گیرنده -->
        <div
          class="bg-white border border-nimoura-text-100 rounded-2xl p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-display text-lg text-nimoura-text-900">
              اطلاعات گیرنده
            </h3>
            <label
              class="flex items-center gap-2 text-sm text-nimoura-text-600 cursor-pointer"
            >
              <Checkbox
                v-model="isSelfRecipient"
                binary
                :pt="{
                  box: {
                    class: isSelfRecipient
                      ? 'bg-nimoura-primary! border-nimoura-primary!'
                      : '',
                  },
                }"
              />
              گیرنده خودم هستم
            </label>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-nimoura-text-500 mb-1.5 block"
                >نام</label
              >
              <input
                v-model="checkout.firstName"
                type="text"
                :class="inputClass"
              />
            </div>
            <div>
              <label class="text-xs text-nimoura-text-500 mb-1.5 block"
                >نام خانوادگی</label
              >
              <input
                v-model="checkout.lastName"
                type="text"
                :class="inputClass"
              />
            </div>
            <div>
              <label class="text-xs text-nimoura-text-500 mb-1.5 block"
                >شماره تماس</label
              >
              <input
                v-model="checkout.phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                :class="[inputClass, 'font-modam']"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-nimoura-text-500 mb-1.5 block"
                >توضیحات (اختیاری)</label
              >
              <textarea
                v-model="checkout.note"
                rows="2"
                placeholder="یادداشتی برای پیک یا بسته‌بندی..."
                :class="[inputClass, 'resize-none']"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- خلاصه سفارش -->
      <div class="lg:sticky lg:top-6">
        <div
          class="bg-white border border-nimoura-text-100 rounded-2xl p-6 shadow-sm"
        >
          <h3 class="font-display text-lg text-nimoura-text-900 mb-5">
            خلاصه سفارش
          </h3>
          <div class="space-y-3 max-h-64 overflow-y-auto pl-1">
            <div
              v-for="item in cart.items.value"
              :key="item.key"
              class="flex gap-3 text-sm"
            >
              <img
                :src="item.thumbnail || '/images/placeholder-product.jpg'"
                class="w-12 h-12 rounded-lg object-cover border border-nimoura-text-100"
              />
              <div class="flex-1 min-w-0">
                <p class="text-nimoura-text-800 line-clamp-1">
                  {{ item.title }}
                </p>
                <p class="text-nimoura-text-400 text-xs font-modam">
                  {{ item.quantity }} عدد
                </p>
              </div>
              <p class="text-nimoura-text-700 whitespace-nowrap">
                {{
                  numberFormat(
                    (item.priceDiscount > 0 ? item.priceDiscount : item.price) *
                      item.quantity,
                  )
                }}
              </p>
            </div>
          </div>

          <Divider />

          <div class="flex justify-between items-center mb-6">
            <span class="font-display text-nimoura-text-800">جمع کل</span>
            <span
              class="font-display text-xl text-nimoura-primary font-semibold"
            >
              {{ numberFormat(cart.totalPrice.value) }}
            </span>
          </div>

          <Button
            label="ادامه به پرداخت"
            icon="pi pi-arrow-left"
            icon-pos="left"
            class="!w-full !bg-nimoura-primary !border-nimoura-primary !py-3 !rounded-full"
            @click="goToPayment"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- دیالوگ افزودن آدرس -->
  <ProfileAddressFormDialog v-model:visible="showAddDialog" />
</template>

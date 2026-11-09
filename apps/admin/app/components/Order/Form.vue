<template>
  <form @submit.prevent="onSubmit">
    <!-- Header -->
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold tracking-tight"></h1>
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
          :class="badgeTone(form.status)"
        >
          <span class="size-2 rounded-full" :class="dotTone(form.status)" />
          {{ statusLabel(form.status) }}
        </span>
        <span class="text-xs text-neutral-500"
          >کد سفارش: {{ form.orderCode }}</span
        >
      </div>
    </div>

    <!-- Grid Layout -->
    <div class="grid relative grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left: Main columns -->
      <div class="lg:col-span-2 space-y-6">
        <!-- بخش اطلاعات سفارش -->
        <OrderCard title="اطلاعات سفارش">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OrderInputField
              v-model.trim="form.orderCode"
              label="کد سفارش"
              placeholder="NIM-2508…"
              readonly
            />

            <OrderSelectField
              v-model="form.status"
              :options="statusOptions"
              label="وضعیت"
            />

            <OrderNumberField
              v-model.number="form.shippingCost"
              label="هزینه ارسال"
              suffix="تومان"
              min="0"
            />
            <OrderNumberField
              v-model.number="form.discount"
              label="تخفیف"
              suffix="تومان"
              min="0"
            />
            <OrderInputField
              v-model.trim="form.postalBarcode"
              label="بارکد پستی"
              placeholder="2508…"
            />

            <OrderInputField
              v-if="form.shippedAt"
              :model-value="formattedShippedAt"
              label="تاریخ و زمان ارسال"
              readonly
            />
          </div>
        </OrderCard>

        <!-- بخش پرداخت -->
        <OrderCard title="پرداخت">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OrderSelectField
              v-model="form.paymentInfo.method"
              :options="paymentMethods"
              label="روش پرداخت"
            />

            <OrderToggleField
              v-model="form.paymentInfo.isPaid"
              label="پرداخت شده؟"
            />

            <OrderInputField
              v-model.trim="form.paymentInfo.trackingCode"
              label="کد رهگیری پرداخت"
              placeholder="مثال: A123-BC45"
              :readonly="!form.paymentInfo.isPaid"
            />

            <OrderInputField
              v-model.trim="form.paymentRefId"
              label="شماره ارجاع درگاه"
              placeholder="RefId…"
            />

            <!-- <OrderInputField
              v-model="form.paymentInfo.paidAt"
              label="تاریخ پرداخت"
              type="datetime-local"
              :readonly="!form.paymentInfo.isPaid"
            /> -->

            <DatePicker
              v-model="form.paymentInfo.paidAt"
              label="تاریخ پرداخت"
              :disabled="!form.paymentInfo.isPaid"
              :class="{ 'opacity-50': !form.paymentInfo.isPaid }"
              placeholder="YYYY/MM/DD"
              format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              display-format="jYYYY/jMM/jDD"
              editable
              simple
            />
          </div>
        </OrderCard>

        <!-- بخش گیرنده و آدرس -->
        <OrderCard title="مشخصات گیرنده و آدرس ارسال">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OrderInputField
              v-model.trim="form.shippingInfo.first_name"
              label="نام گیرنده"
              placeholder="مثال: رضا"
              required
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.last_name"
              label="نام خانوادگی"
              placeholder="مثال: خباز"
              required
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.phone"
              label="شماره تماس"
              placeholder="0912…"
              required
              pattern="^0\d{10}$"
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.note"
              label="یادداشت"
              placeholder="مثال: تماس قبل از تحویل"
            />
          </div>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OrderInputField
              v-model.trim="form.shippingInfo.address.state"
              label="استان"
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.address.city"
              label="شهر"
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.address.postal_code"
              label="کدپستی"
              placeholder="10 رقم"
              pattern="^\d{10}$"
            />
            <OrderTextareaField
              v-model.trim="form.shippingInfo.address.address"
              label="نشانی دقیق"
              rows="3"
            />
          </div>
        </OrderCard>

        <!-- آیتم‌های سفارش -->
        <OrderCard title="آیتم‌های سفارش">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-neutral-500">
                  <th class="p-2 text-right font-medium">محصول</th>
                  <!-- <th class="p-2 text-right font-medium">SKU</th> -->
                  <th class="p-2 text-right font-medium">قیمت واحد (تومان)</th>
                  <th class="p-2 text-right font-medium">تعداد</th>
                  <th class="p-2 text-right font-medium">مجموع</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(it, idx) in form.items"
                  :key="it.id"
                  class="border-b border-neutral-100"
                >
                  <td class="p-2">
                    <div class="flex items-center gap-3">
                      <img
                        :src="it.product.thumbnail"
                        class="size-10 rounded-lg object-cover"
                        alt="thumb"
                      />
                      <div>
                        <p class="font-medium leading-none line-clamp-1">
                          {{ it.product.title }}
                        </p>
                        <div
                          v-if="it.variant"
                          class="flex items-center gap-2 mt-1"
                        >
                          <span
                            v-if="getVariantDisplay(it.variant).colorHex"
                            class="w-4 h-4 rounded-full border border-gray-300"
                            :style="{ backgroundColor: getVariantDisplay(it.variant).colorHex! }"
                          ></span>
                          {{ getVariantDisplay(it.variant).label }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <!-- <td class="p-2 ltr:font-mono">{{ it.product.sku }}</td> -->
                  <td class="p-2">
                    <OrderInputField v-model.number="it.unitPrice" />
                  </td>
                  <td class="p-2">
                    <OrderNumberInput
                      v-model.number="it.quantity"
                      min="0"
                      class="w-24"
                    />
                  </td>
                  <td class="p-2 font-medium">
                    {{ formatCurrency(it.quantity * it.unitPrice) }}
                  </td>
                  <td class="p-2 text-left">
                    <button
                      type="button"
                      class="btn-ghost"
                      @click="removeItem(idx)"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <button
              type="button"
              class="btn-secondary"
              @click="showAddModal = true"
            >
              افزودن آیتم
            </button>
            <div class="text-sm text-neutral-600">
              تعداد کل: <span class="font-medium">{{ itemCount }}</span>
            </div>
          </div>
        </OrderCard>
      </div>

      <!-- Right: Summary -->
      <div class="lg:col-span-1 sticky top-24 h-max">
        <OrderCard title="خلاصه مالی">
          <dl class="space-y-3">
            <div class="flex items-center justify-between">
              <dt class="text-neutral-500">زیرمجموع</dt>
              <dd class="font-medium">{{ formatCurrency(subtotal) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-neutral-500">هزینه ارسال</dt>
              <dd class="font-medium">
                {{ formatCurrency(form.shippingCost || 0) }}
              </dd>
            </div>
            <div
              v-if="(form.discount || 0) > 0"
              class="flex items-center justify-between"
            >
              <dt class="text-neutral-500">تخفیف</dt>
              <dd class="font-medium">
                - {{ formatCurrency(form.discount || 0) }}
              </dd>
            </div>
            <div class="border-t pt-3 flex items-center justify-between">
              <dt class="text-neutral-700">مبلغ نهایی</dt>
              <dd class="text-lg font-extrabold">
                {{ formatCurrency(finalTotal) }}
              </dd>
            </div>
          </dl>
          <p v-if="serverFinalMismatch" class="mt-3 text-xs text-amber-600">
            توجه: مبلغ نهایی محاسبه‌شده با مقدار سمت سرور متفاوت است. پس از
            ذخیره، مقدار نهایی از سرور نمایش داده می‌شود.
          </p>
        </OrderCard>

        <div class="sticky bottom-4 mt-6 space-y-3">
          <button type="submit" class="btn-primary w-full">
            ذخیره تغییرات
          </button>
          <button
            type="button"
            class="btn-ghost w-full"
            @click="emit('cancel')"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>

    <OrderProductSearchModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @select="handleAddProduct"
    />
  </form>
</template>

<script setup lang="ts">
import { OrderStatus, PaymentMethod } from '@nimoura/shared-types';
import { formatPrice } from '@nimoura/utils';

interface OrderAddress {
  id?: number;
  title?: string;
  postal_code?: string;
  state?: string;
  city?: string;
  address?: string;
}

interface ShippingInfo {
  first_name: string;
  last_name: string;
  phone: string;
  note?: string;
  address: OrderAddress;
}

interface PaymentInfo {
  method?: string;
  trackingCode?: string | null;
  isPaid?: boolean;
  paidAt?: string | null;
}

interface ProductSnapshot {
  id: number;
  title: string;
  slug?: string;
  thumbnail?: string;
  sku?: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product: ProductSnapshot;
  variant?: any;
}

interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  shippingCost: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  paymentRefId?: string | null;
  postalBarcode?: string | null;
  paymentInfo: PaymentInfo;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  shippedAt?: Date | string | null;
}

const props = defineProps<{ order: Order }>();
const emit = defineEmits<{
  (e: 'submit', payload: any): void;
  (e: 'cancel'): void;
  (e: 'add-item'): void;
}>();

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj || {}));
}

const rawInitial = deepClone(props.order || {} as any);
if (!rawInitial.shippingInfo) {
  rawInitial.shippingInfo = { first_name: '', last_name: '', phone: '', note: '', address: {} };
}
if (!rawInitial.shippingInfo.address || typeof rawInitial.shippingInfo.address !== 'object') {
  rawInitial.shippingInfo.address = { state: '', city: '', postal_code: '', address: '' };
}
if (!rawInitial.paymentInfo) {
  rawInitial.paymentInfo = { method: PaymentMethod.ZARINPAL, isPaid: false, trackingCode: '', paidAt: null };
}
if (!Array.isArray(rawInitial.items)) {
  rawInitial.items = [];
}

const form = reactive<Order>(rawInitial);

const statusOptions = [
  { value: OrderStatus.PENDING, label: 'در انتظار پرداخت' },
  { value: OrderStatus.PAID, label: 'پرداخت شده' },
  { value: OrderStatus.PROCESSING, label: 'در حال پردازش' },
  { value: OrderStatus.SHIPPED, label: 'ارسال شده' },
  { value: OrderStatus.DELIVERED, label: 'تحویل داده شده' },
  { value: OrderStatus.CANCELLED, label: 'لغو شده' },
];

const paymentMethods = [
  { value: PaymentMethod.ZARINPAL, label: 'زرین‌پال' },
  { value: PaymentMethod.TOROB_PAY, label: 'ترب‌پی' },
  { value: PaymentMethod.SNAPP_PAY, label: 'اسنپ‌پی' },
];

function statusLabel(st: OrderStatus) {
  return statusOptions.find((o) => o.value === st)?.label ?? st;
}

function badgeTone(st: OrderStatus) {
  switch (st) {
    case OrderStatus.PAID:
    case OrderStatus.DELIVERED:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case OrderStatus.CANCELLED:
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case OrderStatus.SHIPPED:
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case OrderStatus.PENDING:
    case OrderStatus.PROCESSING:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-neutral-50 text-neutral-700 border border-neutral-200';
  }
}

function dotTone(st: OrderStatus) {
  switch (st) {
    case OrderStatus.PAID:
    case OrderStatus.DELIVERED:
      return 'bg-emerald-500';
    case OrderStatus.CANCELLED:
      return 'bg-rose-500';
    case OrderStatus.SHIPPED:
      return 'bg-blue-500';
    case OrderStatus.PENDING:
    case OrderStatus.PROCESSING:
      return 'bg-amber-500';
    default:
      return 'bg-neutral-400';
  }
}

const subtotal = computed(() =>
  form.items.reduce(
    (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0),
    0,
  ),
);

const finalTotal = computed(() =>
  Math.max(
    0,
    subtotal.value +
      (Number(form.shippingCost) || 0) -
      (Number(form.discount) || 0),
  ),
);

const itemCount = computed(() =>
  form.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
);

const serverFinalMismatch = computed(
  () => Number(form.finalTotal || 0) !== Number(finalTotal.value || 0),
);

watch([subtotal, () => form.shippingCost, () => form.discount], () => {
  form.finalTotal = finalTotal.value;
});

function normalizeOrderForForm(o: any): any {
  return {
    status: o.status,
    shippingCost: Number(o.shippingCost) || 0,
    discount: Number(o.discount) || 0,
    postalBarcode: o.postalBarcode || undefined,
    paymentRefId: o.paymentRefId || undefined,
    shippingInfo: o.shippingInfo
      ? {
          first_name: o.shippingInfo.first_name,
          last_name: o.shippingInfo.last_name,
          phone: o.shippingInfo.phone,
          note: o.shippingInfo.note,
          address:
            typeof o.shippingInfo.address === 'object' && o.shippingInfo.address !== null
              ? {
                  title: o.shippingInfo.address.title,
                  postal_code: o.shippingInfo.address.postal_code || '1111111111',
                  state: o.shippingInfo.address.state || '',
                  city: o.shippingInfo.address.city || '',
                  address: o.shippingInfo.address.address || '',
                }
              : undefined,
        }
      : undefined,
    paymentInfo: o.paymentInfo
      ? {
          method: o.paymentInfo.method,
          isPaid: !!o.paymentInfo.isPaid,
          trackingCode: o.paymentInfo.trackingCode,
          paidAt: o.paymentInfo.paidAt,
        }
      : undefined,
    items: Array.isArray(o.items)
      ? o.items.map((i: any) => ({
          productId: i.product?.id || i.productId,
          variantId: i.variant?.id ?? null,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || undefined,
        }))
      : [],
  };
}

function onSubmit() {
  const errs: string[] = [];
  if (!form.shippingInfo?.first_name?.trim())
    errs.push('نام گیرنده را وارد کنید');
  if (!form.shippingInfo?.last_name?.trim())
    errs.push('نام خانوادگی گیرنده را وارد کنید');
  if (!/^0\d{10}$/.test(form.shippingInfo?.phone || ''))
    errs.push('شماره تماس معتبر نیست (باید ۱۱ رقم و با ۰ شروع شود)');
  if (form.items.length === 0)
    errs.push('سفارش باید حداقل دارای یک قلم کالا باشد');

  if (errs.length) {
    alert(errs.join('\n'));
    return;
  }

  const finalForm = normalizeOrderForForm(form);
  emit('submit', deepClone(toRaw(finalForm)));
}

function removeItem(idx: number) {
  form.items.splice(idx, 1);
}

function formatCurrency(n: number | null | undefined) {
  return formatPrice(n);
}

const showAddModal = ref(false);

function handleAddProduct(product: any) {
  const existingItem = form.items.find((item) => {
    const sameProduct = item.product?.id === product.id;
    const sameVariant =
      (!product.selectedVariant && !item.variant) ||
      (product.selectedVariant &&
        item.variant &&
        item.variant.id === product.selectedVariant.id);
    return sameProduct && sameVariant;
  });

  if (existingItem) {
    existingItem.quantity++;
    return;
  }

  form.items.push({
    id: Date.now(),
    quantity: 1,
    unitPrice: product.price,
    product: {
      id: product.id,
      title: product.title,
      slug: product.slug,
      thumbnail: product.thumbnail,
      sku: product.sku,
    },
    variant: product.selectedVariant
      ? {
          id: product.selectedVariant.id,
          value: product.selectedVariant.value,
          alt: product.selectedVariant.alt,
          colorHex: product.selectedVariant.colorHex,
          price: product.selectedVariant.price,
        }
      : null,
  });
}

const formattedShippedAt = computed(() => {
  if (!form.shippedAt) return '';
  const d = new Date(form.shippedAt);
  const dateStr = d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${timeStr} - ${dateStr}`;
});
</script>

<style scoped>
@reference "tailwindcss";
/* Buttons */
.btn-primary {
  @apply inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm bg-blue-500 text-white hover:bg-blue-800 transition;
}
.btn-secondary {
  @apply inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm border border-neutral-200 hover:bg-neutral-50 transition;
}
.btn-ghost {
  @apply inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition;
}

/* Card */
.card {
  @apply rounded-2xl border border-neutral-200 bg-white shadow-sm;
}
.card-header {
  @apply flex items-center justify-between border-b border-neutral-100 px-4 py-3;
}
.card-title {
  @apply text-sm font-semibold text-neutral-800;
}
.card-body {
  @apply p-4;
}

/* Inputs */
.input {
  @apply w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100;
}
.label {
  @apply mb-1 block text-xs font-medium text-neutral-600;
}
.toggle {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition;
}
.toggle input {
  display: none;
}
.toggle .dot {
  @apply absolute left-1 h-4 w-4 rounded-full bg-white transition;
}
.toggle.on {
  @apply bg-neutral-900;
}
.toggle.off {
  @apply bg-neutral-300;
}
.toggle.on .dot {
  @apply translate-x-6;
}

/* Table */
.table {
  @apply min-w-full text-sm;
}
</style>

<template>
  <form @submit.prevent="onSubmit">
    <!-- Header -->
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold tracking-tight"></h1>
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
          :class="badgeTone(form.status)"
        >
          <span class="size-2 rounded-full" :class="dotTone(form.status)" />
          {{ statusLabel(form.status) }}
        </span>
        <span
          v-if="!isCreate && form.orderCode"
          class="text-xs text-neutral-500"
        >
          کد سفارش: {{ form.orderCode }}
        </span>
        <span
          v-else-if="isCreate"
          class="text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full font-medium"
        >
          سفارش دستی جدید
        </span>
      </div>
    </div>

    <!-- Grid Layout -->
    <div class="grid relative grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left: Main columns -->
      <div class="lg:col-span-2 space-y-6">
        <!-- بخش انتخاب کاربر / مشتری (ویژه ایجاد سفارش دستی) -->
        <OrderCard v-if="isCreate" title="انتخاب مشتری (اختیاری)">
          <div class="space-y-4">
            <p class="text-xs text-neutral-500 leading-relaxed">
              می‌توانید یکی از مشتریان عضو سایت را جستجو و انتخاب کنید تا مشخصات و آدرس‌ها به صورت خودکار بارگذاری شوند، یا اطلاعات گیرنده را در بخش زیر مستقیماً وارد نمایید.
            </p>

            <!-- اگر کاربری انتخاب شده باشد -->
            <div
              v-if="selectedUser"
              class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-brand-50/70 border border-brand-200/80 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shadow-xs"
                >
                  {{ (selectedUser.first_name?.[0] || 'ک') }}
                </div>
                <div>
                  <div class="font-bold text-sm text-gray-900">
                    {{ `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'کاربر بدون نام' }}
                  </div>
                  <div class="text-xs text-gray-500 font-mono mt-0.5">
                    {{ selectedUser.phone || selectedUser.email || 'بدون شماره' }}
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="clearSelectedUser"
                class="text-xs text-rose-600 hover:text-rose-800 bg-white border border-rose-200 px-3 py-1.5 rounded-lg transition"
              >
                تغییر / حذف مشتری
              </button>
            </div>

            <!-- جعبه جستجوی مشتری -->
            <div v-else class="relative">
              <input
                v-model="userSearchQuery"
                type="text"
                placeholder="جستجوی مشتری بر اساس نام، نام خانوادگی یا شماره تماس..."
                class="input"
                @input="handleUserSearch"
              />
              <div v-if="isSearchingUser" class="absolute left-3 top-2.5">
                <i class="pi pi-spin pi-spinner text-brand-500 text-sm" />
              </div>

              <!-- نتایج جستجو -->
              <div
                v-if="userSearchResults.length > 0"
                class="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100"
              >
                <div
                  v-for="u in userSearchResults"
                  :key="u.id"
                  @click="selectUser(u)"
                  class="p-2.5 hover:bg-brand-50 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div class="font-medium text-gray-800">
                    {{ `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'بدون نام' }}
                  </div>
                  <div class="text-gray-500 font-mono">
                    {{ u.phone }}
                  </div>
                </div>
              </div>
              <div
                v-else-if="userSearchQuery && !isSearchingUser && userSearched"
                class="absolute z-20 left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 text-center shadow-lg"
              >
                کاربری با این مشخصات یافت نشد
              </div>
            </div>

            <!-- آدرس‌های ذخیره شده مشتری -->
            <div v-if="userAddresses.length > 0" class="pt-2">
              <label class="label">آدرس‌های ثبت‌شده مشتری (جهت تکمیل سریع کلیک کنید):</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <div
                  v-for="addr in userAddresses"
                  :key="addr.id"
                  @click="applyUserAddress(addr)"
                  class="cursor-pointer border border-gray-200 hover:border-brand-500 hover:bg-brand-50/40 p-2.5 rounded-xl transition text-xs"
                >
                  <div class="font-semibold text-gray-800 mb-1 flex items-center justify-between">
                    <span>{{ addr.title || 'آدرس' }}</span>
                    <span class="text-[10px] text-brand-600 font-medium">انتخاب ↵</span>
                  </div>
                  <div class="text-gray-600 line-clamp-2">
                    {{ [addr.state, addr.city, addr.address].filter(Boolean).join('، ') }}
                  </div>
                  <div v-if="addr.postal_code" class="text-gray-400 font-mono text-[11px] mt-1">
                    کد پستی: {{ addr.postal_code }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </OrderCard>

        <!-- بخش اطلاعات سفارش -->
        <OrderCard title="اطلاعات سفارش">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OrderInputField
              v-if="!isCreate"
              v-model.trim="form.orderCode"
              label="کد سفارش"
              placeholder="NIM-2508…"
              readonly
            />
            <OrderInputField
              v-else
              model-value="تولید خودکار پس از ثبت"
              label="کد سفارش"
              readonly
              disabled
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

            <CommonPersianDatePicker
              v-model="form.paymentInfo.paidAt"
              label="تاریخ پرداخت"
              :disabled="!form.paymentInfo.isPaid"
              :class="{ 'opacity-50': !form.paymentInfo.isPaid }"
              placeholder="YYYY/MM/DD"
              format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              display-format="jYYYY/jMM/jDD HH:mm"
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
              required
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.address.city"
              label="شهر"
              required
            />
            <OrderInputField
              v-model.trim="form.shippingInfo.address.postal_code"
              label="کدپستی"
              placeholder="10 رقم (اختیاری)"
            />
            <OrderTextareaField
              v-model.trim="form.shippingInfo.address.address"
              label="نشانی دقیق"
              rows="3"
              required
            />
          </div>
        </OrderCard>

        <!-- آیتم‌های سفارش -->
        <OrderCard title="آیتم‌های سفارش">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-neutral-500 border-b border-neutral-100">
                  <th class="p-2 text-right font-medium">محصول</th>
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
                        :src="it.product.thumbnail || '/placeholder.png'"
                        class="size-10 rounded-lg object-cover border border-neutral-200"
                        alt="thumb"
                      />
                      <div>
                        <p class="font-medium leading-none line-clamp-1">
                          {{ it.product.title }}
                        </p>
                        <div
                          v-if="it.variant"
                          class="flex items-center gap-2 mt-1 text-xs text-neutral-600"
                        >
                          <span
                            v-if="getVariantDisplay(it.variant).colorHex"
                            class="w-3.5 h-3.5 rounded-full border border-gray-300"
                            :style="{ backgroundColor: getVariantDisplay(it.variant).colorHex! }"
                          ></span>
                          {{ getVariantDisplay(it.variant).label }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="p-2">
                    <OrderInputField v-model.number="it.unitPrice" />
                  </td>
                  <td class="p-2">
                    <OrderNumberInput
                      v-model.number="it.quantity"
                      min="1"
                      class="w-24"
                    />
                  </td>
                  <td class="p-2 font-medium">
                    {{ formatCurrency(it.quantity * it.unitPrice) }}
                  </td>
                  <td class="p-2 text-left">
                    <button
                      type="button"
                      class="btn-ghost text-rose-600 hover:text-rose-700"
                      @click="removeItem(idx)"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
                <tr v-if="form.items.length === 0">
                  <td colspan="5" class="p-6 text-center text-neutral-400">
                    هنوز کالایی به سفارش اضافه نشده است. برای ثبت سفارش، حداقل یک کالا از دکمه «افزودن آیتم» اضافه کنید.
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
              <dt class="text-neutral-700 font-semibold">مبلغ نهایی</dt>
              <dd class="text-lg font-extrabold text-brand-600">
                {{ formatCurrency(finalTotal) }}
              </dd>
            </div>
          </dl>
          <p v-if="serverFinalMismatch && !isCreate" class="mt-3 text-xs text-amber-600">
            توجه: مبلغ نهایی محاسبه‌شده با مقدار سمت سرور متفاوت است. پس از
            ذخیره، مقدار نهایی از سرور نمایش داده می‌شود.
          </p>
        </OrderCard>

        <div class="sticky bottom-4 mt-6 space-y-3">
          <button type="submit" class="btn-primary w-full">
            {{ isCreate ? 'ثبت و ایجاد سفارش' : 'ذخیره تغییرات' }}
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
  id?: number;
  userId?: number;
  orderCode?: string;
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

const props = withDefaults(
  defineProps<{
    order?: Partial<Order>;
    isCreate?: boolean;
  }>(),
  {
    order: () => ({}),
    isCreate: false,
  }
);

const emit = defineEmits<{
  (e: 'submit', payload: any): void;
  (e: 'cancel'): void;
  (e: 'add-item'): void;
}>();

const toast = useAppToast();

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj || {}));
}

const rawInitial = deepClone(props.order || ({} as any));
if (!rawInitial.status) {
  rawInitial.status = OrderStatus.PENDING;
}
if (rawInitial.shippingCost === undefined) {
  rawInitial.shippingCost = 0;
}
if (rawInitial.discount === undefined) {
  rawInitial.discount = 0;
}
if (!rawInitial.shippingInfo) {
  rawInitial.shippingInfo = {
    first_name: '',
    last_name: '',
    phone: '',
    note: '',
    address: { state: '', city: '', postal_code: '', address: '' },
  };
}
if (
  !rawInitial.shippingInfo.address ||
  typeof rawInitial.shippingInfo.address !== 'object'
) {
  rawInitial.shippingInfo.address = {
    state: '',
    city: '',
    postal_code: '',
    address: '',
  };
}
if (!rawInitial.paymentInfo) {
  rawInitial.paymentInfo = {
    method: PaymentMethod.ZARINPAL,
    isPaid: false,
    trackingCode: '',
    paidAt: null,
  };
}
if (!Array.isArray(rawInitial.items)) {
  rawInitial.items = [];
}

const form = reactive<Order>(rawInitial);

// مدیریت جستجو و انتخاب کاربر (مشتری) در حالت ثبت دستی
const selectedUser = ref<any>(null);
const userSearchQuery = ref('');
const isSearchingUser = ref(false);
const userSearched = ref(false);
const userSearchResults = ref<any[]>([]);
const userAddresses = ref<any[]>([]);
let userSearchTimeout: any = null;

function handleUserSearch() {
  const q = userSearchQuery.value?.trim();
  if (!q || q.length < 2) {
    userSearchResults.value = [];
    userSearched.value = false;
    return;
  }
  clearTimeout(userSearchTimeout);
  isSearchingUser.value = true;
  userSearchTimeout = setTimeout(async () => {
    try {
      const res: any = await $fetch('/api/user', {
        query: { search: q, limit: 10 },
      });
      const d = res?.data ?? res;
      userSearchResults.value = d?.items ?? d?.users ?? [];
      userSearched.value = true;
    } catch {
      userSearchResults.value = [];
    } finally {
      isSearchingUser.value = false;
    }
  }, 400);
}

async function selectUser(u: any) {
  selectedUser.value = u;
  form.userId = u.id;
  userSearchResults.value = [];
  userSearchQuery.value = '';
  userSearched.value = false;

  if (u.first_name) form.shippingInfo.first_name = u.first_name;
  if (u.last_name) form.shippingInfo.last_name = u.last_name;
  if (u.phone) form.shippingInfo.phone = u.phone;

  try {
    const res: any = await $fetch(`/api/user/${u.id}/addresses`);
    const d = res?.data ?? res;
    userAddresses.value = d?.addresses ?? (Array.isArray(d) ? d : []);
  } catch {
    userAddresses.value = [];
  }
}

function clearSelectedUser() {
  selectedUser.value = null;
  form.userId = undefined;
  userAddresses.value = [];
}

function applyUserAddress(addr: any) {
  if (!addr) return;
  if (addr.state) form.shippingInfo.address.state = addr.state;
  if (addr.city) form.shippingInfo.address.city = addr.city;
  if (addr.postal_code) form.shippingInfo.address.postal_code = addr.postal_code;
  if (addr.address) form.shippingInfo.address.address = addr.address;
  if (addr.title) form.shippingInfo.address.title = addr.title;
}

const statusOptions = computed(() => {
  const all = [
    { value: OrderStatus.PENDING, label: 'در انتظار پرداخت' },
    { value: OrderStatus.PAID, label: 'پرداخت شده' },
    { value: OrderStatus.PROCESSING, label: 'در حال پردازش' },
    { value: OrderStatus.SHIPPED, label: 'ارسال شده' },
    { value: OrderStatus.DELIVERED, label: 'تحویل داده شده' },
  ];
  if (!props.isCreate) {
    all.push({ value: OrderStatus.CANCELLED, label: 'لغو شده' });
  }
  return all;
});

const paymentMethods = [
  { value: PaymentMethod.ZARINPAL, label: 'زرین‌پال' },
  { value: PaymentMethod.TOROB_PAY, label: 'ترب‌پی' },
  { value: PaymentMethod.SNAPP_PAY, label: 'اسنپ‌پی' },
];

const PAID_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

watch(
  () => form.paymentInfo.isPaid,
  (isPaid) => {
    if (isPaid && form.status === OrderStatus.PENDING) {
      form.status = OrderStatus.PAID;
      if (!form.paymentInfo.paidAt) {
        form.paymentInfo.paidAt = new Date().toISOString();
      }
    } else if (!isPaid && form.status !== OrderStatus.PENDING && props.isCreate) {
      form.status = OrderStatus.PENDING;
      form.paymentInfo.paidAt = null;
    }
  }
);

watch(
  () => form.status,
  (st) => {
    if (PAID_STATUSES.includes(st as any)) {
      form.paymentInfo.isPaid = true;
      if (!form.paymentInfo.paidAt) {
        form.paymentInfo.paidAt = new Date().toISOString();
      }
    } else if (st === OrderStatus.PENDING && props.isCreate) {
      form.paymentInfo.isPaid = false;
      form.paymentInfo.paidAt = null;
    }
  }
);

function statusLabel(st: OrderStatus) {
  return statusOptions.value.find((o) => o.value === st)?.label ?? st;
}

function badgeTone(st: OrderStatus) {
  switch (st) {
    case OrderStatus.PAID:
    case OrderStatus.DELIVERED:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case OrderStatus.CANCELLED:
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case OrderStatus.SHIPPED:
      return 'bg-nimoura-accent/40 text-nimoura-velvet border border-nimoura-accent';
    case OrderStatus.PENDING:
    case OrderStatus.PROCESSING:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
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
      return 'bg-nimoura-velvet';
    case OrderStatus.PENDING:
    case OrderStatus.PROCESSING:
      return 'bg-amber-500';
    default:
      return 'bg-gray-400';
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
    ...(o.userId ? { userId: Number(o.userId) } : {}),
    status: o.status,
    shippingCost: Number(o.shippingCost) || 0,
    discount: Number(o.discount) || 0,
    postalBarcode: o.postalBarcode?.trim() || undefined,
    paymentRefId: o.paymentRefId?.trim() || undefined,
    shippingInfo: o.shippingInfo
      ? {
          first_name: o.shippingInfo.first_name?.trim(),
          last_name: o.shippingInfo.last_name?.trim(),
          phone: o.shippingInfo.phone?.trim(),
          note: o.shippingInfo.note?.trim() || undefined,
          address:
            typeof o.shippingInfo.address === 'object' && o.shippingInfo.address !== null
              ? {
                  title: o.shippingInfo.address.title?.trim() || 'آدرس تحویل',
                  postal_code:
                    o.shippingInfo.address.postal_code?.trim() || '1111111111',
                  state: o.shippingInfo.address.state?.trim() || '',
                  city: o.shippingInfo.address.city?.trim() || '',
                  address: o.shippingInfo.address.address?.trim() || '',
                }
              : undefined,
        }
      : undefined,
    paymentInfo: o.paymentInfo
      ? {
          method: o.paymentInfo.method,
          isPaid: !!o.paymentInfo.isPaid,
          trackingCode: o.paymentInfo.trackingCode?.trim() || undefined,
          paidAt: o.paymentInfo.paidAt || undefined,
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
  if (!form.shippingInfo?.address?.state?.trim())
    errs.push('استان گیرنده را وارد کنید');
  if (!form.shippingInfo?.address?.city?.trim())
    errs.push('شهر گیرنده را وارد کنید');
  if (!form.shippingInfo?.address?.address?.trim())
    errs.push('نشانی دقیق گیرنده را وارد کنید');
  if (
    form.shippingInfo?.address?.postal_code &&
    !/^\d{10}$/.test(form.shippingInfo.address.postal_code.trim())
  ) {
    errs.push('کد پستی در صورت وارد شدن باید ۱۰ رقم باشد');
  }
  if (form.items.length === 0)
    errs.push('سفارش باید حداقل دارای یک قلم کالا باشد');

  if (errs.length) {
    toast.error(errs.join(' - '), 'خطای اعتبارسنجی فرم');
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--color-brand-500, #b76e79);
  color: #ffffff;
  box-shadow: var(--shadow-theme-xs);
  transition: background-color 0.15s ease;
}
.btn-primary:hover {
  background-color: var(--color-brand-600, #a15661);
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid var(--color-gray-200, #ebe0df);
  background-color: #ffffff;
  color: var(--color-gray-700, #4e4545);
  transition: background-color 0.15s ease;
}
.btn-secondary:hover {
  background-color: var(--color-brand-50, #fbf4f5);
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-600, #665d5d);
  transition: background-color 0.15s ease;
}
.btn-ghost:hover {
  background-color: var(--color-gray-100, #f7eeec);
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

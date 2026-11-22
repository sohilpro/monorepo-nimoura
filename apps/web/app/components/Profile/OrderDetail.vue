<template>
  <div class="min-h-screen bg-nimoura-base pb-20 font-vazir text-nimoura-text-700">

    <!-- ══ Hero header ══ -->
    <div class="relative overflow-hidden bg-gradient-to-br from-nimoura-950 via-nimoura-800 to-nimoura-500 px-4 pb-8 pt-10">
      <div class="pointer-events-none absolute -left-[60px] -top-[80px] h-[280px] w-[280px] rounded-full bg-white/5 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-[30px] right-[10%] h-[180px] w-[180px] rounded-full bg-white/[0.04] blur-3xl" />

      <div class="relative z-10 mx-auto max-w-3xl">
        <!-- Back -->
        <Button
          label="بازگشت به سفارشات"
          icon="pi pi-arrow-right"
          icon-pos="left"
          class="!mb-6 !inline-flex !gap-1.5 !rounded-xl !border-0 !bg-white/10 !px-3.5 !py-2 !text-xs !font-medium !text-white/85 !backdrop-blur-md transition-colors hover:!bg-white/20"
          @click="router.back()"
        />

        <div v-if="order" class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-1 text-xs text-white/50">کد سفارش</p>
            <h1 class="font-vazir text-2xl font-bold text-white">
              {{ order.orderCode ?? `#${order.id}` }}
            </h1>
            <p class="mt-1 text-sm text-white/60">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold font-vazir backdrop-blur-md"
            :class="[sm.badgeClass, sm.textClass, sm.borderClass]"
          >
            <i :class="['pi', sm.icon, 'text-sm!']" />
            {{ sm.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══ Body ══ -->
    <div class="mx-auto mt-4 max-w-3xl space-y-4 px-4">

      <!-- Skeleton -->
      <template v-if="loading">
        <div
          v-for="n in 4"
          :key="n"
          class="animate-pulse space-y-3 rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
        >
          <Skeleton width="8rem" height="1rem" border-radius="0.375rem" />
          <Skeleton width="100%" height="0.875rem" border-radius="0.375rem" />
          <Skeleton width="75%" height="0.875rem" border-radius="0.375rem" />
        </div>
      </template>

      <template v-else-if="order">

        <!-- ── Stepper ── -->
        <div class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]">
          <h3 class="relative mb-5 pr-3 text-[0.88rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-3.5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']">
            وضعیت سفارش
          </h3>
          <div class="flex items-start">
            <div
              v-for="(step, i) in steps"
              :key="step.key"
              class="relative flex flex-1 flex-col items-center text-center"
            >
              <div
                v-if="i > 0"
                class="absolute left-[62%] right-[-50%] top-[13px] z-0 h-0.5 transition-colors duration-300 min-[768px]:left-[56%]"
                :class="stepIndex >= i ? 'bg-nimoura-primary' : 'bg-nimoura-primary/15'"
              />
              <div
                class="relative z-10 flex size-7 items-center justify-center rounded-full border-2 transition-all duration-300"
                :class="[
                  order.status === 'cancelled' && step.key !== 'cancelled'
                    ? 'border-nimoura-error/20 bg-nimoura-error/10 text-nimoura-error/40'
                    : stepIndex >= i
                      ? 'border-nimoura-primary bg-nimoura-primary text-white'
                      : 'border-nimoura-primary/15 bg-nimoura-primary/10 text-nimoura-primary/40',
                  stepIndex === i ? 'ring-[5px] ring-nimoura-primary/15' : '',
                ]"
              >
                <i :class="['pi', step.icon, 'text-xs!']" />
              </div>
              <p
                class="mt-2 text-[11px] font-semibold font-vazir"
                :class="stepIndex >= i ? 'text-nimoura-text-700' : 'text-nimoura-text-500'"
              >
                {{ step.label }}
              </p>
              <p v-if="step.date" class="mt-0.5 text-[10px] font-vazir text-nimoura-text-400">
                {{ step.date }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Order items ── -->
        <div class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]">
          <h3 class="relative mb-4 pr-3 text-[0.88rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-3.5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']">
            کالاها
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center gap-3 rounded-2xl border border-nimoura-text-100 bg-nimoura-base/70 p-3"
            >
              <div class="flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-nimoura-text-100 bg-nimoura-base">
                <img
                  v-if="item.product?.thumbnail"
                  :src="formatImageUrl(item.product.thumbnail)"
                  :alt="item.product?.title"
                  class="h-full w-full object-cover"
                />
                <i v-else class="pi pi-image text-xl! text-nimoura-text-300" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 text-sm font-medium font-vazir text-nimoura-text-800">
                  {{ item.product?.title ?? 'محصول حذف شده' }}
                </p>
                <p v-if="item.variant" class="mt-1 text-xs font-vazir text-nimoura-text-400">
                  {{ item.variant.alt }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="inline-flex rounded-lg bg-nimoura-primary/10 px-2 py-0.5 text-[11px] font-bold font-vazir text-nimoura-primary">
                    × {{ item.quantity }}
                  </span>
                  <span class="text-xs font-vazir text-nimoura-text-500">
                    {{ formatPrice(item.unitPrice) }} تومان
                  </span>
                </div>
              </div>
              <span class="shrink-0 font-modam text-sm font-bold text-nimoura-primary">
                {{ formatPrice(item.quantity * item.unitPrice) }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── Price summary ── -->
        <div class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]">
          <h3 class="relative mb-4 pr-3 text-[0.88rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-3.5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']">
            خلاصه مالی
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2 py-1 text-[13px] font-vazir text-nimoura-text-600">
              <span>جمع کالاها</span>
              <span>{{ formatPrice(order.subtotal) }} تومان</span>
            </div>
            <div v-if="order.discount > 0" class="flex items-center justify-between gap-2 py-1 text-[13px] font-vazir text-nimoura-success">
              <span>تخفیف</span>
              <span>- {{ formatPrice(order.discount) }} تومان</span>
            </div>
            <div class="flex items-center justify-between gap-2 py-1 text-[13px] font-vazir text-nimoura-text-600">
              <span>هزینه ارسال</span>
              <span>
                {{ order.shippingCost > 0 ? formatPrice(order.shippingCost) + ' تومان' : 'رایگان' }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-2 border-t-[1.5px] border-dashed border-nimoura-primary/20 pt-3 text-[15px] font-extrabold font-vazir text-nimoura-text-800">
              <span>مبلغ نهایی</span>
              <span>{{ formatPrice(order.finalTotal) }} تومان</span>
            </div>
          </div>
          <div v-if="order.promotion" class="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-nimoura-success/10 px-3 py-1.5 text-xs font-vazir text-nimoura-success">
            <i class="pi pi-tag text-xs!" />
            کد تخفیف: <strong>{{ order.promotion.code }}</strong>
          </div>
        </div>

        <!-- ── Shipping info ── -->
        <div v-if="order.shippingInfo" class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]">
          <h3 class="relative mb-4 pr-3 text-[0.88rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-3.5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']">
            اطلاعات ارسال
          </h3>
          <div class="grid grid-cols-1 gap-3 min-[481px]:grid-cols-2">
            <div class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3">
              <i class="pi pi-user mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">گیرنده</p>
                <p class="text-[13px] font-semibold font-vazir text-nimoura-text-800">{{ order.shippingInfo.first_name }} {{ order.shippingInfo.last_name }}</p>
              </div>
            </div>
            <div class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3">
              <i class="pi pi-phone mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">شماره تماس</p>
                <p class="font-modam text-[13px] font-semibold text-nimoura-text-800">{{ order.shippingInfo.phone }}</p>
              </div>
            </div>
            <div class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3 min-[481px]:col-span-2">
              <i class="pi pi-map-marker mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">آدرس</p>
                <p class="text-[13px] font-semibold font-vazir text-nimoura-text-800">{{ shippingAddress }}</p>
              </div>
            </div>
            <div v-if="order.postalBarcode" class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3">
              <i class="pi pi-barcode mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">بارکد پستی</p>
                <p class="font-modam text-[13px] font-semibold text-nimoura-text-800">{{ order.postalBarcode }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Payment info ── -->
        <div v-if="order.paymentInfo" class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]">
          <h3 class="relative mb-4 pr-3 text-[0.88rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-3.5 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']">
            اطلاعات پرداخت
          </h3>
          <div class="grid grid-cols-1 gap-3 min-[481px]:grid-cols-2">
            <div class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3">
              <i class="pi pi-credit-card mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">روش پرداخت</p>
                <p class="text-[13px] font-semibold font-vazir text-nimoura-text-800">{{ order.paymentInfo.method ?? 'آنلاین' }}</p>
              </div>
            </div>
            <div v-if="order.paymentRefId" class="flex items-start gap-2.5 rounded-[14px] border border-nimoura-text-100 bg-nimoura-base/70 p-3">
              <i class="pi pi-hashtag mt-0.5 shrink-0 text-sm! text-nimoura-primary/60" />
              <div>
                <p class="mb-0.5 text-[10px] font-vazir text-nimoura-text-400">کد پیگیری</p>
                <p class="font-modam text-[13px] font-semibold text-nimoura-text-800">{{ order.paymentRefId }}</p>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/order'

const route  = useRoute()
const router = useRouter()
const toast  = useAppToast()

const loading = ref(true)
const order   = ref<Order | null>(null)

// ── API (plug in) ──────────────────────────────
async function fetchOrder(id: number): Promise<Order | any> {
  const res: any = await $fetch(`/api/orders/${id}`)
  
  return res.data
}

// ── Status ─────────────────────────────────────
const STATUS_META = {
  pending:   { label: 'در انتظار پرداخت', icon: 'pi-clock',        textClass: 'text-nimoura-warning', badgeClass: 'bg-nimoura-warning/15', borderClass: 'border-nimoura-warning/30' },
  paid:      { label: 'پرداخت شده',        icon: 'pi-check-circle', textClass: 'text-nimoura-success', badgeClass: 'bg-nimoura-success/15', borderClass: 'border-nimoura-success/30' },
  shipped:   { label: 'ارسال شده',          icon: 'pi-truck',        textClass: 'text-nimoura-primary', badgeClass: 'bg-nimoura-primary/15', borderClass: 'border-nimoura-primary/40' },
  cancelled: { label: 'لغو شده',            icon: 'pi-times-circle', textClass: 'text-nimoura-error',   badgeClass: 'bg-nimoura-error/15',   borderClass: 'border-nimoura-error/30' },
} as const

const sm = computed(() =>
  STATUS_META[(order.value?.status ?? 'pending') as keyof typeof STATUS_META] ?? STATUS_META.pending
)

// آدرس می‌تواند به صورت رشته یا شیء از بکاند بیاید
const shippingAddress = computed(() => {
  const address: any = (order.value as any)?.shippingInfo?.address
  if (!address) return ''
  if (typeof address === 'string') return address
  return [address.state, address.city, address.address].filter(Boolean).join('، ')
})

// ── Stepper ────────────────────────────────────
const STEP_ORDER = ['pending', 'paid', 'shipped']
const stepIndex = computed(() => {
  if (order.value?.status === 'cancelled') return -1
  return STEP_ORDER.indexOf(order.value?.status ?? 'pending')
})

const steps = computed(() => {
  if (order.value?.status === 'cancelled') {
    return [{ key: 'cancelled', label: 'لغو شده', icon: 'pi-times-circle', date: formatDate(order.value?.createdAt) }]
  }
  return [
    { key: 'pending',  label: 'ثبت سفارش',      icon: 'pi-shopping-cart', date: formatDate(order.value?.createdAt) },
    { key: 'paid',     label: 'پرداخت شده',      icon: 'pi-check-circle',  date: '' },
    { key: 'shipped',  label: 'ارسال شده',        icon: 'pi-truck',         date: order.value?.shippedAt ? formatDate(order.value.shippedAt) : '' },
  ]
})

// ── Helpers ────────────────────────────────────
function formatPrice(n: number) {
  return (n ?? 0).toLocaleString('fa-IR')
}
function formatDate(d?: string | Date) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Init ───────────────────────────────────────
onMounted(async () => {
  try {
    order.value = await fetchOrder(Number(route.params.id))
  } catch {
    toast.add({ severity: 'error', summary: 'خطا', detail: 'سفارش یافت نشد', life: 3000 })
  } finally {
    loading.value = false
  }
})
</script>

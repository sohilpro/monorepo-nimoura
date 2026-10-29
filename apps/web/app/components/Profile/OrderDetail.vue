<template>
  <div class="detail-root min-h-screen pb-20">

    <!-- ══ Hero header ══ -->
    <div class="detail-hero relative overflow-hidden px-4 pb-8 pt-10">
      <div class="blob b1" /><div class="blob b2" />

      <div class="relative z-10 mx-auto max-w-3xl">
        <!-- Back -->
        <button type="button" class="back-btn mb-6" @click="router.back()">
          <i class="pi pi-arrow-right text-sm" />
          <span>بازگشت به سفارشات</span>
        </button>

        <div v-if="order" class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-xs mb-1" style="color:rgba(255,255,255,0.5)">کد سفارش</p>
            <h1 class="text-2xl font-bold text-white font-vazir">
              {{ order.orderCode ?? `#${order.id}` }}
            </h1>
            <p class="mt-1 text-sm" style="color:rgba(255,255,255,0.6)">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <span class="status-hero-badge"
                :style="`background:${sm.bg};color:${sm.color};border:1px solid ${sm.color}30`">
            <i :class="`pi ${sm.icon} text-sm`" />
            {{ sm.label }}
          </span>
        </div>
      </div>
    </div>
    <!-- ══ Body ══ -->
    <div class="mx-auto max-w-3xl px-4 mt-4 space-y-4">

      <!-- Skeleton -->
      <template v-if="loading">
        <div v-for="n in 4" :key="n" class="card animate-pulse space-y-3">
          <div class="h-4 w-32 rounded-full bg-gray-100" />
          <div class="h-3 w-full rounded-full bg-gray-100" />
          <div class="h-3 w-3/4 rounded-full bg-gray-100" />
        </div>
      </template>

      <template v-else-if="order">

        <!-- ── Stepper ── -->
        <div class="card">
          <h3 class="card-title mb-5">وضعیت سفارش</h3>
          <div class="stepper">
            <div
              v-for="(step, i) in steps"
              :key="step.key"
              class="step"
              :class="{
                'step--done':   stepIndex >= i,
                'step--active': stepIndex === i,
                'step--skip':   order.status === 'cancelled' && step.key !== 'cancelled',
              }"
            >
              <div class="step-line-before" v-if="i > 0" />
              <div class="step-dot">
                <i :class="`pi ${step.icon} text-xs`" />
              </div>
              <p class="step-label">{{ step.label }}</p>
              <p v-if="step.date" class="step-date">{{ step.date }}</p>
            </div>
          </div>
        </div>

        <!-- ── Order items ── -->
        <div class="card">
          <h3 class="card-title mb-4">کالاها</h3>
          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="item-row"
            >
              <div class="item-img-wrap shrink-0">
                <img
                  v-if="item.product?.thumbnail"
                  :src="item.product.thumbnail"
                  :alt="item.product?.title"
                  class="h-full w-full object-cover"
                />
                <i v-else class="pi pi-image text-gray-300 text-xl" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium font-vazir line-clamp-2" style="color:var(--nt-800)">
                  {{ item.product?.title ?? 'محصول حذف شده' }}
                </p>
                <p v-if="item.variant" class="mt-1 text-xs font-vazir" style="color:var(--nt-400)">
                  {{ item.variant.alt }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <span class="qty-badge">× {{ item.quantity }}</span>
                  <span class="text-xs font-vazir" style="color:var(--nt-500)">
                    {{ formatPrice(item.unitPrice) }} تومان
                  </span>
                </div>
              </div>
              <span class="text-sm font-bold font-modam shrink-0" style="color:var(--primary)">
                {{ formatPrice(item.quantity * item.unitPrice) }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── Price summary ── -->
        <div class="card">
          <h3 class="card-title mb-4">خلاصه مالی</h3>
          <div class="space-y-3">
            <div class="price-row">
              <span>جمع کالاها</span>
              <span>{{ formatPrice(order.subtotal) }} تومان</span>
            </div>
            <div v-if="order.discount > 0" class="price-row text-green-600">
              <span>تخفیف</span>
              <span>- {{ formatPrice(order.discount) }} تومان</span>
            </div>
            <div class="price-row">
              <span>هزینه ارسال</span>
              <span>
                {{ order.shippingCost > 0 ? formatPrice(order.shippingCost) + ' تومان' : 'رایگان' }}
              </span>
            </div>
            <div class="price-row price-row--total">
              <span>مبلغ نهایی</span>
              <span>{{ formatPrice(order.finalTotal) }} تومان</span>
            </div>
          </div>
          <div v-if="order.promotion" class="mt-3 promo-badge">
            <i class="pi pi-tag text-xs" />
            کد تخفیف: <strong>{{ order.promotion.code }}</strong>
          </div>
        </div>

        <!-- ── Shipping info ── -->
        <div v-if="order.shippingInfo" class="card">
          <h3 class="card-title mb-4">اطلاعات ارسال</h3>
          <div class="info-grid">
            <div class="info-row">
              <i class="pi pi-user info-icon" />
              <div>
                <p class="info-label">گیرنده</p>
                <p class="info-val">{{ order.shippingInfo.first_name }} {{ order.shippingInfo.last_name }}</p>
              </div>
            </div>
            <div class="info-row">
              <i class="pi pi-phone info-icon" />
              <div>
                <p class="info-label">شماره تماس</p>
                <p class="info-val font-modam">{{ order.shippingInfo.phone }}</p>
              </div>
            </div>
            <div class="info-row col-span-2">
              <i class="pi pi-map-marker info-icon" />
              <div>
                <p class="info-label">آدرس</p>
                <p class="info-val">{{ order.shippingInfo.address.state }}، {{ order.shippingInfo.address.city }}، {{ order.shippingInfo.address.address }}</p>
              </div>
            </div>
            <div class="info-row" v-if="order.postalBarcode">
              <i class="pi pi-barcode info-icon" />
              <div>
                <p class="info-label">بارکد پستی</p>
                <p class="info-val font-modam">{{ order.postalBarcode }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Payment info ── -->
        <div v-if="order.paymentInfo" class="card">
          <h3 class="card-title mb-4">اطلاعات پرداخت</h3>
          <div class="info-grid">
            <div class="info-row">
              <i class="pi pi-credit-card info-icon" />
              <div>
                <p class="info-label">روش پرداخت</p>
                <p class="info-val">{{ order.paymentInfo.method ?? 'آنلاین' }}</p>
              </div>
            </div>
            <div class="info-row" v-if="order.paymentRefId">
              <i class="pi pi-hashtag info-icon" />
              <div>
                <p class="info-label">کد پیگیری</p>
                <p class="info-val font-modam">{{ order.paymentRefId }}</p>
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
const toast  = useToast()

const loading = ref(true)
const order   = ref<Order | null>(null)

// ── API (plug in) ──────────────────────────────
async function fetchOrder(id: number): Promise<Order | any> {
  const res: any = await $fetch(`/api/orders/${id}`)
  
  return res.data
}

// ── Status ─────────────────────────────────────
const STATUS_META = {
  pending:   { label: 'در انتظار پرداخت', icon: 'pi-clock',       color: '#d97706', bg: 'rgba(245,158,11,.12)'  },
  paid:      { label: 'پرداخت شده',        icon: 'pi-check-circle', color: '#059669', bg: 'rgba(16,185,129,.12)'  },
  shipped:   { label: 'ارسال شده',          icon: 'pi-truck',        color: '#2563eb', bg: 'rgba(37,99,235,.1)'   },
  cancelled: { label: 'لغو شده',            icon: 'pi-times-circle', color: '#dc2626', bg: 'rgba(220,38,38,.1)'   },
} as const

const sm = computed(() =>
  STATUS_META[order.value?.status ?? 'pending'] ?? STATUS_META.pending
)

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

<style scoped>
.detail-root {
  --primary: #b76e79;
  --base:    #fff8f4;
  --nt-400: #9b9191; --nt-500: #807676;
  --nt-600: #665d5d; --nt-800: #3a3131;
  background: var(--base);
  font-family: 'Vazirmatn', sans-serif;
}

/* Hero */
.detail-hero {
  background: linear-gradient(135deg, #3d1f25 0%, #6b2d38 50%, #b76e79 100%);
}
.blob { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
.b1 { width:280px;height:280px;background:rgba(255,255,255,0.05);top:-80px;left:-60px; }
.b2 { width:180px;height:180px;background:rgba(255,255,255,0.04);bottom:-30px;right:10%; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 12px; border: none;
  background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85);
  font-size: 12px; font-family: 'Vazirmatn',sans-serif;
  cursor: pointer; transition: background .15s; backdrop-filter: blur(8px);
}
.back-btn:hover { background: rgba(255,255,255,0.2); }

.status-hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px;
  font-size: 12px; font-family: 'Vazirmatn',sans-serif; font-weight: 700;
  backdrop-filter: blur(8px);
}

/* Card */
.card {
  background: #fff; border-radius: 20px; padding: 20px;
  border: 1px solid rgba(183,110,121,0.08);
  box-shadow: 0 2px 16px rgba(183,110,121,0.05);
}
.card-title {
  font-size: .88rem; font-weight: 700; color: var(--nt-800);
  position: relative; padding-right: 12px;
}
.card-title::before {
  content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 14px; background: var(--primary); border-radius: 2px;
}

/* Stepper */
.stepper {
  display: flex; align-items: flex-start; gap: 0;
  position: relative;
}
.step {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  position: relative; text-align: center;
}
.step-line-before {
  position: absolute;
  top: 13px;
  right: -50%;
  left: 62%;
  height: 2px;
  z-index: 0;
  transition: all .3s;
  background: rgba(183,110,121,0.15);
}

@media (min-width: 768px) {
  .step-line-before {
    left: 56%;
  }
}
.step--done .step-line-before { background: var(--primary); }

.step-dot {
  width: 28px; height: 28px; border-radius: 50%; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  background: rgba(183,110,121,0.1); color: rgba(183,110,121,0.4);
  border: 2px solid rgba(183,110,121,0.15);
  transition: all .3s;
  z-index: 1 ;
}
.step--done .step-dot  { background: var(--primary); color: #fff; border-color: var(--primary); }
.step--active .step-dot{ box-shadow: 0 0 0 5px rgba(183,110,121,0.15); }
.step--skip .step-dot  { background: rgba(220,38,38,0.08); color: rgba(220,38,38,0.4); border-color: rgba(220,38,38,0.15); }

.step-label { margin-top: 8px; font-size: 11px; font-family:'Vazirmatn',sans-serif; color:var(--nt-500); font-weight:600; }
.step--done .step-label { color: var(--nt-700); }
.step-date  { font-size: 10px; font-family:'Vazirmatn',sans-serif; color:var(--nt-400); margin-top:2px; }

/* Item row */
.item-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 16px;
  border: 1px solid rgba(183,110,121,0.08);
  background: var(--base);
}
.item-img-wrap {
  width: 62px; height: 62px; border-radius: 14px; overflow: hidden; flex-shrink: 0;
  background: rgba(183,110,121,0.06);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(183,110,121,0.1);
}
.qty-badge {
  display: inline-flex; padding: 2px 8px; border-radius: 8px;
  font-size: 11px; font-family:'Vazirmatn',sans-serif; font-weight:700;
  background: rgba(183,110,121,0.1); color: var(--primary);
}

/* Price rows */
.price-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-family:'Vazirmatn',sans-serif; color: var(--nt-600);
  padding: 4px 0;
}
.price-row--total {
  padding-top: 12px; margin-top: 8px;
  border-top: 1.5px dashed rgba(183,110,121,0.2);
  font-size: 15px; font-weight: 800; color: var(--nt-800);
}
.promo-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 10px;
  font-size: 12px; font-family:'Vazirmatn',sans-serif;
  background: rgba(5,150,105,.08); color: #059669;
}

/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
.col-span-2 { grid-column: span 2; }
@media (max-width: 480px) { .col-span-2 { grid-column: span 1; } }

.info-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px; border-radius: 14px;
  background: var(--base); border: 1px solid rgba(183,110,121,0.08);
}
.info-icon { color: var(--primary); opacity:.6; font-size:14px; margin-top:2px; flex-shrink:0; }
.info-label { font-size: 10px; color: var(--nt-400); font-family:'Vazirmatn',sans-serif; margin-bottom:3px; }
.info-val   { font-size: 13px; color: var(--nt-800),sans-serif; font-weight:600; }
</style>
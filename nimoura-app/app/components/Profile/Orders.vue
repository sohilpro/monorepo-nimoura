<template>
  <div class="orders-root">

    <!-- Header -->
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="panel-title">سفارشات من</h2>
        <p class="mt-1 text-xs font-vazir" style="color:var(--nt-400)">
          <span class="font-modam">{{ orders.length }}</span> سفارش ثبت شده
        </p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="order-card animate-pulse">
        <div class="flex gap-3">
          <div class="h-12 w-12 rounded-2xl bg-gray-100 shrink-0" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-3.5 w-28 rounded-full bg-gray-100" />
            <div class="h-3 w-44 rounded-full bg-gray-100" />
          </div>
          <div class="h-6 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!orders.length" class="empty-state">
      <div class="empty-icon-wrap">
        <i class="pi pi-shopping-bag text-3xl" style="color:var(--primary);opacity:.4" />
      </div>
      <p class="mt-4 text-sm font-medium font-vazir" style="color:var(--nt-500)">هنوز سفارشی ثبت نکردی</p>
      <NuxtLink to="/" class="empty-cta mt-4">رفتن به فروشگاه</NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card cursor-pointer"
        @click="goToDetail(order.id)"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="order-icon-wrap">
              <i :class="`pi ${statusMeta(order.status).icon} text-base`"
                 :style="`color:${statusMeta(order.status).color}`" />
            </div>
            <div>
              <p class="text-sm font-bold font-vazir" style="color:var(--nt-800)">
                سفارش {{ order.orderCode ?? `#${order.id}` }}
              </p>
              <p class="mt-0.5 text-xs font-vazir" style="color:var(--nt-400)">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
          </div>
          <span class="order-badge shrink-0"
                :style="`background:${statusMeta(order.status).bg};color:${statusMeta(order.status).color}`">
            {{ statusMeta(order.status).label }}
          </span>
        </div>

        <!-- Product thumbnails -->
        <div v-if="order.items?.length" class="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          <div
            v-for="item in order.items.slice(0, 4)"
            :key="item.id"
            class="product-thumb shrink-0"
          >
            <img
              v-if="item.product?.thumbnail"
              :src="item.product.thumbnail"
              :alt="item.product?.title"
              class="h-full w-full object-cover"
            />
            <i v-else class="pi pi-image text-gray-300 text-lg" />
          </div>
          <div
            v-if="order.items.length > 4"
            class="product-thumb shrink-0 flex items-center justify-center"
            style="background:rgba(183,110,121,0.08)"
          >
            <span class="text-xs font-bold font-vazir" style="color:var(--primary)">
              +{{ order.items.length - 4 }}
            </span>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="mt-3 flex items-center justify-between border-t pt-3"
             style="border-color:rgba(183,110,121,0.08)">
          <span class="text-xs" style="color:var(--nt-400)">
            <span class="font-modam">{{ order.items?.length ?? 0 }}</span> کالا
          </span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold font-modam" style="color:var(--primary)">
              {{ formatPrice(order.finalTotal) }} تومان
            </span>
            <i class="pi pi-angle-left text-sm" style="color:var(--nt-300)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types/order'

const router  = useRouter()
const loading = ref(false)
const orders  = ref<Order[]>([])

// ── API (plug in) ──────────────────────────────
async function fetchOrders(): Promise<Order[] | any> {
   const res: any = await $fetch('/api/orders/my')
   return res.data.orders
}

// ── Status meta ────────────────────────────────
function statusMeta(status: Order['status']) {
  const map = {
    pending:   { label: 'در انتظار پرداخت', icon: 'pi-clock',       color: '#d97706', bg: 'rgba(245,158,11,.1)'   },
    paid:      { label: 'پرداخت شده',        icon: 'pi-check-circle', color: '#059669', bg: 'rgba(16,185,129,.1)'   },
    shipped:   { label: 'ارسال شده',          icon: 'pi-truck',        color: '#2563eb', bg: 'rgba(37,99,235,.08)'   },
    cancelled: { label: 'لغو شده',            icon: 'pi-times-circle', color: '#dc2626', bg: 'rgba(220,38,38,.08)'   },
  }
  return map[status] ?? map.pending
}

// ── Helpers ────────────────────────────────────
function formatPrice(n: number) {
  return n?.toLocaleString('fa-IR') ?? '۰'
}
function formatDate(d: string | Date) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}
function goToDetail(id: number) {
  router.push(`/profile/orders/${id}`)
}

// ── Init ───────────────────────────────────────
onMounted(async () => {
  loading.value = true
  try { orders.value = await fetchOrders() }
  finally { loading.value = false }
})
</script>

<style scoped>
.orders-root {
  --primary: #b76e79;
  --base:    #fff8f4;
  --nt-400: #9b9191; --nt-500: #807676;
  --nt-800: #3a3131;
  font-family: 'Vazirmatn', sans-serif;
}

.panel-title {
  font-size: .95rem; font-weight: 700; color: var(--nt-800);
  position: relative; padding-right: 12px;
}
.panel-title::before {
  content: ''; position: absolute; right: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 16px;
  background: var(--primary); border-radius: 2px;
}

.order-card {
  background: #fff; border-radius: 20px; padding: 16px;
  border: 1px solid rgba(183,110,121,0.09);
  box-shadow: 0 2px 16px rgba(183,110,121,0.05);
  transition: box-shadow .2s, transform .2s;
}
.order-card:hover {
  box-shadow: 0 6px 24px rgba(183,110,121,0.12);
  transform: translateY(-2px);
}

.order-icon-wrap {
  width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
  background: rgba(183,110,121,0.07);
  display: flex; align-items: center; justify-content: center;
}

.order-badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-family: 'Vazirmatn', sans-serif; font-weight: 600;
}

.product-thumb {
  width: 52px; height: 52px; border-radius: 12px; overflow: hidden;
  background: rgba(183,110,121,0.05);
  border: 1px solid rgba(183,110,121,0.1);
  display: flex; align-items: center; justify-content: center;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; text-align: center;
}
.empty-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(183,110,121,0.07);
  display: flex; align-items: center; justify-content: center;
}
.empty-cta {
  padding: 10px 24px; border-radius: 14px;
  background: linear-gradient(135deg, #b76e79, #9a5a64);
  color: #fff; text-decoration: none;
  font-size: .875rem; font-family: 'Vazirmatn', sans-serif; font-weight: 600;
  box-shadow: 0 4px 14px rgba(183,110,121,0.3);
}
</style>
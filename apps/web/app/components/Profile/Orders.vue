<template>
  <div class="font-vazir text-nimoura-text-700">

    <!-- Header -->
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2
          class="relative pr-3 text-[0.95rem] font-bold font-vazir text-nimoura-text-800 before:absolute before:right-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-sm before:bg-nimoura-primary before:content-['']"
        >
          سفارشات من
        </h2>
        <p class="mt-1 text-xs font-vazir text-nimoura-text-400">
          <span class="font-modam">{{ orders.length }}</span> سفارش ثبت شده
        </p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="animate-pulse rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
      >
        <div class="flex items-center gap-3">
          <Skeleton width="2.625rem" height="2.625rem" border-radius="0.875rem" />
          <div class="flex-1 space-y-2 py-1">
            <Skeleton width="7rem" height="0.875rem" border-radius="0.375rem" />
            <Skeleton width="11rem" height="0.75rem" border-radius="0.375rem" />
          </div>
          <Skeleton width="5rem" height="1.5rem" border-radius="1rem" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!orders.length" class="flex flex-col items-center px-5 py-12 text-center">
      <div class="flex size-18 items-center justify-center rounded-full bg-nimoura-primary/10">
        <i class="pi pi-shopping-bag text-3xl! text-nimoura-primary/40" />
      </div>
      <p class="mt-4 text-sm font-medium font-vazir text-nimoura-text-500">
        هنوز سفارشی ثبت نکردی
      </p>
      <NuxtLink
        to="/"
        class="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-nimoura-primary to-nimoura-700 px-6 py-2.5 text-sm font-semibold font-vazir text-white no-underline shadow-[0_6px_18px_rgba(183,110,121,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(183,110,121,0.35)]"
      >
        رفتن به فروشگاه
      </NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        class="group cursor-pointer rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_8px_30px_rgba(39,33,33,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-nimoura-primary/30 hover:shadow-[0_14px_34px_rgba(39,33,33,0.09)]"
        @click="goToDetail(order.id)"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-nimoura-primary/10">
              <i :class="['pi', statusMeta(order.status).icon, 'text-base!', statusMeta(order.status).iconClass]" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold font-vazir text-nimoura-text-800">
                سفارش {{ order.orderCode ?? `#${order.id}` }}
              </p>
              <p class="mt-0.5 text-xs font-vazir text-nimoura-text-400">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
          </div>
          <span
            class="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold font-vazir"
            :class="[statusMeta(order.status).badgeClass, statusMeta(order.status).textClass]"
          >
            {{ statusMeta(order.status).label }}
          </span>
        </div>

        <!-- Product thumbnails -->
        <div v-if="order.items?.length" class="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          <div
            v-for="item in order.items.slice(0, 4)"
            :key="item.id"
            class="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-nimoura-text-100 bg-nimoura-base/60"
          >
            <img
              v-if="item.product?.thumbnail"
              :src="formatImageUrl(item.product.thumbnail)"
              :alt="item.product?.title"
              class="h-full w-full object-cover"
            />
            <i v-else class="pi pi-image text-lg! text-nimoura-text-300" />
          </div>
          <div
            v-if="order.items.length > 4"
            class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-nimoura-text-100 bg-nimoura-primary/10"
          >
            <span class="text-xs font-bold font-vazir text-nimoura-primary">
              +{{ order.items.length - 4 }}
            </span>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="mt-3 flex items-center justify-between gap-2 border-t border-nimoura-text-100 pt-3">
          <span class="text-xs font-vazir text-nimoura-text-400">
            <span class="font-modam">{{ order.items?.length ?? 0 }}</span> کالا
          </span>
          <div class="flex items-center gap-3">
            <span class="font-modam text-sm font-bold text-nimoura-primary">
              {{ formatPrice(order.finalTotal) }} تومان
            </span>
            <i class="pi pi-angle-left text-sm! text-nimoura-text-300 transition-transform duration-300 group-hover:-translate-x-1" />
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
    pending:   { label: 'در انتظار پرداخت', icon: 'pi-clock',        textClass: 'text-nimoura-warning', badgeClass: 'bg-nimoura-warning/10', iconClass: 'text-nimoura-warning' },
    paid:      { label: 'پرداخت شده',        icon: 'pi-check-circle', textClass: 'text-nimoura-success', badgeClass: 'bg-nimoura-success/10', iconClass: 'text-nimoura-success' },
    shipped:   { label: 'ارسال شده',          icon: 'pi-truck',        textClass: 'text-nimoura-primary', badgeClass: 'bg-nimoura-primary/10', iconClass: 'text-nimoura-primary' },
    cancelled: { label: 'لغو شده',            icon: 'pi-times-circle', textClass: 'text-nimoura-error',   badgeClass: 'bg-nimoura-error/10',   iconClass: 'text-nimoura-error' },
  }
  return map[status as keyof typeof map] ?? map.pending
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

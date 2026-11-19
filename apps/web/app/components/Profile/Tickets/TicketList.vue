<template>
  <div class="space-y-4" dir="rtl">
    <!-- Active Chat View (When a ticket is open) -->
    <div v-if="selectedTicket">
      <ProfileTicketsTicketChat
        :ticket="selectedTicket"
        @back="selectedTicket = null"
      />
    </div>

    <!-- Ticket List View (When no ticket is open) -->
    <div v-else class="space-y-4">
      <!-- ══ TOP BAR ══ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border border-gray-100">
        <div>
          <h2 class="font-vazir text-base font-bold text-gray-900 flex items-center gap-2">
            <i class="pi pi-comments text-nimoura-primary" />
            <span>پشتیبانی و تیکت‌های من</span>
          </h2>
          <p class="mt-0.5 text-xs text-gray-500 font-vazir">
            پرسش‌ها، پیگیری سفارشات یا درخواست‌های خود را در این بخش پیگیری کنید.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-nimoura-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-nimoura-primary/20 hover:bg-nimoura-primary-dark transition cursor-pointer shrink-0"
          @click="showNewTicketModal = true"
        >
          <i class="pi pi-plus text-xs" />
          <span>ثبت تیکت جدید</span>
        </button>
      </div>

      <!-- ══ FILTERS & SEARCH ══ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Status Tabs -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="st in statusFilters"
            :key="st.key"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
            :class="
              activeStatusFilter === st.key
                ? 'bg-nimoura-primary text-white font-semibold shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
            "
            @click="activeStatusFilter = st.key"
          >
            {{ st.label }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="جستجو بر اساس موضوع یا کد..."
            class="w-full rounded-xl border border-gray-200 bg-white py-2 pr-9 pl-3 text-xs focus:border-nimoura-primary focus:outline-none focus:ring-1 focus:ring-nimoura-primary/20"
          />
        </div>
      </div>

      <!-- ══ LOADING STATE ══ -->
      <div v-if="pending" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-24 rounded-2xl bg-white border border-gray-100 p-4 animate-pulse flex flex-col justify-between"
        >
          <div class="h-4 w-1/3 rounded bg-gray-200" />
          <div class="h-3 w-2/3 rounded bg-gray-100" />
        </div>
      </div>

      <!-- ══ EMPTY STATE ══ -->
      <div
        v-else-if="filteredTickets.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary mb-3">
          <i class="pi pi-inbox text-2xl" />
        </div>
        <h3 class="font-vazir text-sm font-bold text-gray-800">
          تیکتی یافت نشد
        </h3>
        <p class="mt-1 text-xs text-gray-500 max-w-sm font-vazir">
          {{
            searchQuery || activeStatusFilter !== 'all'
              ? 'با فیلترهای انتخابی تیکتی وجود ندارد.'
              : 'شما در حال حاضر تیکت بازی ندارید. در صورت وجود هرگونه سؤال، تیکت جدید ثبت کنید.'
          }}
        </p>
        <button
          v-if="!searchQuery && activeStatusFilter === 'all'"
          type="button"
          class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-nimoura-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-nimoura-primary-dark transition cursor-pointer"
          @click="showNewTicketModal = true"
        >
          <i class="pi pi-plus text-xs" />
          <span>ثبت اولین تیکت</span>
        </button>
      </div>

      <!-- ══ TICKET CARDS ══ -->
      <div v-else class="space-y-2.5">
        <div
          v-for="t in filteredTickets"
          :key="t.id"
          class="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs transition hover:border-nimoura-primary/40 hover:shadow-sm cursor-pointer"
          @click="openTicket(t)"
        >
          <div class="space-y-1.5 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs font-bold text-nimoura-primary bg-nimoura-primary/5 px-2 py-0.5 rounded-md">
                {{ t.trackingCode }}
              </span>
              <h3 class="font-vazir text-sm font-bold text-gray-900 group-hover:text-nimoura-primary transition-colors">
                {{ t.title }}
              </h3>
              <!-- Unread badge -->
              <span
                v-if="t.unreadUserCount > 0"
                class="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                title="پیام جدید پشتیبانی"
              />
            </div>

            <!-- Preview of latest message -->
            <p v-if="t.latestMessage" class="text-xs text-gray-500 line-clamp-1 font-vazir">
              {{ t.latestMessage }}
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
              <span class="flex items-center gap-1">
                <i class="pi pi-tag text-[10px]" />
                <span>{{ getDepartmentLabel(t.department) }}</span>
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <i class="pi pi-clock text-[10px]" />
                <span>{{ formatRelativeTime(t.lastReplyAt) }}</span>
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <!-- Status Pill -->
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border"
              :class="getStatusBadge(t.status).color"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="getStatusBadge(t.status).dot" />
              <span>{{ getStatusBadge(t.status).label }}</span>
            </span>

            <i class="pi pi-angle-left text-gray-400 group-hover:text-nimoura-primary transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- ══ NEW TICKET MODAL ══ -->
    <ProfileTicketsNewTicketModal
      v-model:visible="showNewTicketModal"
      @created="onTicketCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from '@nimoura/shared-types';

const { tickets, pending, fetchTickets, fetchTicketById, getStatusBadge, getDepartmentLabel } = useTickets();

const showNewTicketModal = ref(false);
const selectedTicket = ref<Ticket | null>(null);
const searchQuery = ref('');
const activeStatusFilter = ref('all');

const statusFilters = [
  { key: 'all', label: 'همه تیکت‌ها' },
  { key: 'open', label: 'در انتظار پاسخ' },
  { key: 'in_progress', label: 'در حال بررسی' },
  { key: 'waiting_user', label: 'پاسخ داده شده' },
  { key: 'closed', label: 'بسته شده' },
];

onMounted(async () => {
  await fetchTickets();
});

const filteredTickets = computed(() => {
  return tickets.value.filter((t) => {
    // Filter by status
    if (activeStatusFilter.value !== 'all' && t.status !== activeStatusFilter.value) {
      return false;
    }
    // Filter by search
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCode = t.trackingCode.toLowerCase().includes(q);
      const matchMsg = t.latestMessage?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchMsg) return false;
    }
    return true;
  });
});

const openTicket = async (ticket: Ticket) => {
  try {
    const detailed = await fetchTicketById(ticket.id);
    selectedTicket.value = detailed;
  } catch (err) {
    console.error('Failed to open ticket:', err);
  }
};

const onTicketCreated = (newTicket: Ticket) => {
  selectedTicket.value = newTicket;
};

const formatRelativeTime = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'لحظاتی پیش';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} دقیقه پیش`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ساعت پیش`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} روز پیش`;
  return date.toLocaleDateString('fa-IR');
};
</script>

<template>
  <div class="space-y-5 font-vazir" dir="rtl">
    <!-- Active Chat View (When a ticket is open) -->
    <div v-if="selectedTicket">
      <ProfileTicketsTicketChat
        :ticket="selectedTicket"
        @back="selectedTicket = null"
      />
    </div>

    <!-- Ticket List View (When no ticket is open) -->
    <div v-else class="space-y-5">
      <!-- ══ TOP BAR ══ -->
      <div
        class="flex flex-col gap-4 rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <h2 class="flex items-center gap-2 font-vazir text-base font-bold text-nimoura-text-900">
            <i class="pi pi-comments text-sm! text-nimoura-primary" />
            <span>پشتیبانی و تیکت‌های من</span>
          </h2>
          <p class="mt-1 font-vazir text-xs text-nimoura-text-500">
            پرسش‌ها، پیگیری سفارشات یا درخواست‌های خود را در این بخش پیگیری کنید.
          </p>
        </div>

        <Button
          label="ثبت تیکت جدید"
          icon="pi pi-plus"
          icon-pos="left"
          class="!inline-flex !shrink-0 !items-center !justify-center !gap-2 !rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !py-2.5 !font-vazir !text-xs !font-semibold !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.24)] transition-all hover:!bg-nimoura-primary/90 hover:!shadow-[0_8px_22px_rgba(183,110,121,0.3)]"
          @click="showNewTicketModal = true"
        />
      </div>

      <!-- ══ FILTERS & SEARCH ══ -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <!-- Status Tabs -->
        <div class="flex flex-wrap gap-2" role="group" aria-label="فیلتر وضعیت تیکت">
          <Button
            v-for="st in statusFilters"
            :key="st.key"
            :label="st.label"
            :class="
              activeStatusFilter === st.key
                ? '!rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-3.5 !py-2 !font-vazir !text-[11px] !font-semibold !text-white !shadow-[0_4px_12px_rgba(183,110,121,0.22)]'
                : '!rounded-xl !border-nimoura-text-100 !bg-white !px-3.5 !py-2 !font-vazir !text-[11px] !font-medium !text-nimoura-text-600 transition-colors hover:!border-nimoura-primary/40 hover:!bg-nimoura-50 hover:!text-nimoura-primary'
            "
            @click="activeStatusFilter = st.key"
          />
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <i
            class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-xs! text-nimoura-text-400"
          />
          <InputText
            v-model="searchQuery"
            type="text"
            placeholder="جستجو بر اساس موضوع یا کد..."
            class="!w-full !rounded-xl !border-nimoura-text-100 !bg-white !py-2.5 !pr-9 !pl-3 !font-vazir !text-xs !text-nimoura-text-800 placeholder:!text-nimoura-text-400 focus:!border-nimoura-primary focus:!ring-2 focus:!ring-nimoura-primary/10"
          />
        </div>
      </div>

      <!-- ══ LOADING STATE ══ -->
      <div v-if="pending" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="flex h-24 animate-pulse flex-col justify-between rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
        >
          <div class="h-4 w-1/3 rounded-md bg-nimoura-text-100" />
          <div class="h-3 w-2/3 rounded-md bg-nimoura-50" />
        </div>
      </div>

      <!-- ══ EMPTY STATE ══ -->
      <div
        v-else-if="filteredTickets.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-nimoura-text-200 bg-white p-10 text-center shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
      >
        <div
          class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary"
        >
          <i class="pi pi-inbox text-2xl!" />
        </div>
        <h3 class="font-vazir text-sm font-bold text-nimoura-text-900">
          تیکتی یافت نشد
        </h3>
        <p class="mt-1 max-w-sm font-vazir text-xs text-nimoura-text-500">
          {{
            searchQuery || activeStatusFilter !== 'all'
              ? 'با فیلترهای انتخابی تیکتی وجود ندارد.'
              : 'شما در حال حاضر تیکت بازی ندارید. در صورت وجود هرگونه سؤال، تیکت جدید ثبت کنید.'
          }}
        </p>
        <Button
          v-if="!searchQuery && activeStatusFilter === 'all'"
          label="ثبت اولین تیکت"
          icon="pi pi-plus"
          icon-pos="left"
          class="!mt-4 !inline-flex !items-center !gap-1.5 !rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !py-2 !font-vazir !text-xs !font-semibold !text-white !shadow-[0_4px_12px_rgba(183,110,121,0.22)] transition-colors hover:!bg-nimoura-primary/90"
          @click="showNewTicketModal = true"
        />
      </div>

      <!-- ══ TICKET CARDS ══ -->
      <div v-else class="space-y-3">
        <div
          v-for="t in filteredTickets"
          :key="t.id"
          class="group flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_8px_30px_rgba(39,33,33,0.05)] transition-all hover:border-nimoura-primary/40 hover:shadow-[0_12px_32px_rgba(39,33,33,0.09)] sm:flex-row sm:items-center"
          @click="openTicket(t)"
        >
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-md bg-nimoura-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-nimoura-primary"
              >
                {{ t.trackingCode }}
              </span>
              <h3
                class="font-vazir text-sm font-bold text-nimoura-text-900 transition-colors group-hover:text-nimoura-primary"
              >
                {{ t.title }}
              </h3>
              <!-- Unread badge -->
              <span
                v-if="t.unreadUserCount > 0"
                class="size-2 animate-pulse rounded-full bg-nimoura-error"
                title="پیام جدید پشتیبانی"
              />
            </div>

            <!-- Preview of latest message -->
            <p
              v-if="t.latestMessage"
              class="line-clamp-1 font-vazir text-xs text-nimoura-text-500"
            >
              {{ t.latestMessage }}
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-nimoura-text-400">
              <span class="flex items-center gap-1">
                <i class="pi pi-tag text-[10px]!" />
                <span>{{ getDepartmentLabel(t.department) }}</span>
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <i class="pi pi-clock text-[10px]!" />
                <span>{{ formatRelativeTime(t.lastReplyAt) }}</span>
              </span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <!-- Status Pill -->
            <span
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
              :class="getStatusBadge(t.status).color"
            >
              <span class="size-1.5 rounded-full" :class="getStatusBadge(t.status).dot" />
              <span>{{ getStatusBadge(t.status).label }}</span>
            </span>

            <i
              class="pi pi-angle-left text-nimoura-text-400 transition-transform group-hover:-translate-x-1 group-hover:text-nimoura-primary"
            />
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

<template>
  <div class="space-y-6 pb-12" dir="rtl">
    <!-- ══ STATS OVERVIEW CARDS ══ -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <!-- Total -->
      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">کل تیکت‌ها</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <i class="pi pi-inbox text-xs" />
          </div>
        </div>
        <div class="mt-2 text-xl font-extrabold text-gray-900 font-modam">
          {{ stats.total }}
        </div>
      </div>

      <!-- Open / Unanswered -->
      <div class="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-amber-700">در انتظار پاسخ</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <i class="pi pi-clock text-xs" />
          </div>
        </div>
        <div class="mt-2 text-xl font-extrabold text-amber-900 font-modam">
          {{ stats.open }}
        </div>
      </div>

      <!-- In Progress -->
      <div class="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-sky-700">در حال بررسی</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <i class="pi pi-spin pi-spinner text-xs" />
          </div>
        </div>
        <div class="mt-2 text-xl font-extrabold text-sky-900 font-modam">
          {{ stats.inProgress }}
        </div>
      </div>

      <!-- Waiting Customer -->
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-emerald-700">در انتظار مشتری</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <i class="pi pi-user-edit text-xs" />
          </div>
        </div>
        <div class="mt-2 text-xl font-extrabold text-emerald-900 font-modam">
          {{ stats.waitingUser }}
        </div>
      </div>

      <!-- Closed -->
      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-2xs col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">بسته شده</span>
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 text-gray-600">
            <i class="pi pi-check text-xs" />
          </div>
        </div>
        <div class="mt-2 text-xl font-extrabold text-gray-700 font-modam">
          {{ stats.closed }}
        </div>
      </div>
    </div>

    <!-- ══ MAIN HELPDESK WORKSPACE (MASTER-DETAIL) ══ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- ── RIGHT COLUMN: TICKETS LIST (4 cols) ── -->
      <div class="lg:col-span-5 xl:col-span-4 rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden flex flex-col h-[750px]">
        <!-- Search & Filter Header -->
        <div class="p-3.5 border-b border-gray-100 space-y-2.5 bg-gray-50/50">
          <div class="relative">
            <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="جستجو (نام، موبایل، کد یا عنوان)..."
              class="w-full rounded-xl border border-gray-200 bg-white py-2 pr-9 pl-3 text-xs focus:border-brand-500 focus:outline-none"
              @input="onSearchInput"
            />
          </div>

          <!-- Status Filters -->
          <div class="flex flex-wrap gap-1">
            <button
              v-for="st in statusFilters"
              :key="st.key"
              type="button"
              class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer"
              :class="
                activeStatusFilter === st.key
                  ? 'bg-brand-500 text-white font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              "
              @click="setStatusFilter(st.key)"
            >
              {{ st.label }}
            </button>
          </div>
        </div>

        <!-- Ticket Cards List -->
        <div class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <div v-if="pending" class="p-4 space-y-3">
            <div v-for="i in 5" :key="i" class="h-16 rounded-xl bg-gray-100 animate-pulse" />
          </div>

          <div
            v-else-if="tickets.length === 0"
            class="flex flex-col items-center justify-center p-10 text-center text-gray-400"
          >
            <i class="pi pi-inbox text-3xl mb-2" />
            <p class="text-xs">تیکتی با این مشخصات یافت نشد</p>
          </div>

          <div
            v-else
            v-for="t in tickets"
            :key="t.id"
            class="p-3.5 transition-colors cursor-pointer relative"
            :class="
              activeTicket?.id === t.id
                ? 'bg-brand-50/70 border-r-4 border-r-brand-500'
                : 'hover:bg-gray-50'
            "
            @click="selectTicket(t)"
          >
            <!-- Card Content -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <!-- User Avatar Initials -->
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-bold text-gray-700">
                  {{ getUserInitials(t.user) }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-900 truncate max-w-[160px]">
                    {{ t.user?.first_name ? `${t.user.first_name} ${t.user.last_name || ''}` : 'کاربر نیمورا' }}
                  </h4>
                  <span class="text-[10px] text-gray-400 font-mono">{{ t.user?.mobile }}</span>
                </div>
              </div>

              <!-- Last Reply Time -->
              <span class="text-[10px] text-gray-400 shrink-0">
                {{ formatRelativeTime(t.lastReplyAt) }}
              </span>
            </div>

            <!-- Title & Code -->
            <div class="mt-2">
              <p class="text-xs font-medium text-gray-800 line-clamp-1">
                <span class="font-mono text-[10px] text-brand-600 bg-brand-50 px-1 py-0.5 rounded font-semibold ml-1">
                  {{ t.trackingCode }}
                </span>
                {{ t.title }}
              </p>
              <p v-if="t.latestMessage" class="mt-0.5 text-[11px] text-gray-500 line-clamp-1">
                {{ t.latestMessage }}
              </p>
            </div>

            <!-- Badges Footer -->
            <div class="mt-2.5 flex items-center justify-between text-[10px]">
              <div class="flex items-center gap-1.5">
                <span class="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {{ getDepartmentLabel(t.department) }}
                </span>
                <span class="px-1.5 py-0.5 rounded border" :class="getPriorityBadge(t.priority).color">
                  {{ getPriorityBadge(t.priority).label }}
                </span>
              </div>

              <!-- Unread Badge or Status -->
              <div class="flex items-center gap-1.5">
                <span
                  v-if="t.unreadAdminCount > 0"
                  class="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                  title="پیام جدید کاربر"
                />
                <span
                  class="rounded-full px-2 py-0.5 font-medium border"
                  :class="getStatusBadge(t.status).color"
                >
                  {{ getStatusBadge(t.status).label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── LEFT COLUMN: ACTIVE CHAT & CUSTOMER CRM (7-8 cols) ── -->
      <div class="lg:col-span-7 xl:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden flex flex-col h-[750px]">
        <!-- No active ticket selected -->
        <div
          v-if="!activeTicket"
          class="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 mb-3">
            <i class="pi pi-comments text-2xl" />
          </div>
          <h3 class="text-sm font-bold text-gray-700">یک تیکت را برای گفت‌وگو انتخاب کنید</h3>
          <p class="mt-1 text-xs text-gray-400 max-w-xs">
            از ستون سمت راست روی هر تیکت کلیک کنید تا تاریخچه پیام‌ها، وضعیت و مشخصات مشتری نمایش داده شود.
          </p>
        </div>

        <!-- Active Ticket Workspace -->
        <template v-else>
          <!-- ══ TOP CRM HEADER ══ -->
          <div class="p-3.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-3">
            <!-- Customer info -->
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-sm shadow-xs">
                {{ getUserInitials(activeTicket.user) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-gray-900">
                    {{ activeTicket.user?.first_name ? `${activeTicket.user.first_name} ${activeTicket.user.last_name || ''}` : 'کاربر نیمورا' }}
                  </h3>
                  <span class="text-xs font-mono text-gray-500">{{ activeTicket.user?.mobile }}</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span class="font-mono text-brand-600 font-semibold">{{ activeTicket.trackingCode }}</span>
                  <span>•</span>
                  <span class="text-gray-700 font-medium">{{ activeTicket.title }}</span>
                </div>
              </div>
            </div>

            <!-- Controls: Status & Priority Dropdowns -->
            <div class="flex items-center gap-2">
              <!-- Status Select -->
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-gray-400">وضعیت:</span>
                <select
                  :value="activeTicket.status"
                  class="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-brand-500 focus:outline-none cursor-pointer"
                  @change="handleStatusChange($event)"
                >
                  <option value="open">در انتظار پاسخ</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="waiting_user">در انتظار پاسخ کاربر</option>
                  <option value="resolved">حل شده</option>
                  <option value="closed">بسته شده</option>
                </select>
              </div>

              <!-- Priority Select -->
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-gray-400">اولویت:</span>
                <select
                  :value="activeTicket.priority"
                  class="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium focus:border-brand-500 focus:outline-none cursor-pointer"
                  @change="handlePriorityChange($event)"
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">زیاد</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>

              <!-- دکمه حذف تیکت فقط برای مالک فروشگاه -->
              <button
                v-if="isOwner"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 hover:border-rose-300"
                title="حذف تیکت (ویژه مالک فروشگاه)"
                @click="confirmDeleteTicket(activeTicket)"
              >
                <i class="pi pi-trash text-xs" />
                <span class="hidden sm:inline">حذف تیکت</span>
              </button>
            </div>
          </div>

          <!-- ══ CHAT STREAM ══ -->
          <div
            ref="chatScrollContainer"
            class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]"
          >
            <!-- Order Reference Card (if linked) -->
            <div
              v-if="activeTicket.order"
              class="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <i class="pi pi-shopping-bag text-amber-600" />
                <span>این تیکت مربوط به سفارش شماره</span>
                <span class="font-mono font-bold">{{ activeTicket.order.order_number }}</span>
                <span>است.</span>
              </div>
              <NuxtLink
                :to="`/order/${activeTicket.order.id}`"
                target="_blank"
                class="text-xs font-semibold text-brand-600 hover:underline"
              >
                مشاهده سفارش
              </NuxtLink>
            </div>

            <!-- Messages Stream -->
            <div
              v-for="msg in activeTicket.messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.senderRole === 'admin' ? 'items-end' : 'items-start'"
            >
              <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                <!-- User Avatar (Left) -->
                <div
                  v-if="msg.senderRole !== 'admin'"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 text-[10px] font-bold mb-1"
                >
                  {{ getUserInitials(activeTicket.user) }}
                </div>

                <!-- Bubble -->
                <div
                  class="rounded-2xl p-3.5 shadow-2xs text-xs sm:text-sm"
                  :class="
                    msg.senderRole === 'admin'
                      ? 'bg-brand-500 text-white rounded-bl-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-br-sm'
                  "
                >
                  <!-- Header -->
                  <div
                    class="flex items-center justify-between gap-4 mb-1 text-[10px]"
                    :class="msg.senderRole === 'admin' ? 'text-white/80' : 'text-gray-400'"
                  >
                    <span class="font-semibold">
                      {{ msg.senderRole === 'admin' ? 'تیم پشتیبانی' : (activeTicket.user?.first_name || 'کاربر') }}
                    </span>
                    <span>{{ formatTime(msg.createdAt) }}</span>
                  </div>

                  <!-- Text -->
                  <p class="whitespace-pre-line leading-relaxed">
                    {{ msg.message }}
                  </p>

                  <!-- Attachments -->
                  <div
                    v-if="msg.attachments && msg.attachments.length > 0"
                    class="mt-2 pt-2 border-t space-y-1"
                    :class="msg.senderRole === 'admin' ? 'border-white/20' : 'border-gray-100'"
                  >
                    <div
                      v-for="(file, fIdx) in msg.attachments"
                      :key="fIdx"
                      class="flex items-center gap-2"
                    >
                      <a
                        :href="file.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] transition"
                        :class="
                          msg.senderRole === 'admin'
                            ? 'bg-white/15 text-white hover:bg-white/25'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        "
                      >
                        <i class="pi pi-paperclip text-xs" />
                        <span class="max-w-[150px] truncate">{{ file.name }}</span>
                        <i class="pi pi-external-link text-[10px]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ QUICK REPLIES BAR (CANNED RESPONSES) ══ -->
          <div class="px-3 pt-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <span class="text-[10px] text-gray-400 shrink-0">پاسخ‌های آماده:</span>
            <button
              v-for="(canned, cIdx) in quickReplies"
              :key="cIdx"
              type="button"
              class="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-[11px] text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition cursor-pointer"
              @click="insertQuickReply(canned)"
            >
              {{ canned.title }}
            </button>
          </div>

          <!-- ══ COMPOSER ══ -->
          <div class="p-3 bg-white">
            <!-- Pending Attachments -->
            <div v-if="pendingAttachments.length > 0" class="mb-2 flex flex-wrap gap-2">
              <div
                v-for="(att, aIdx) in pendingAttachments"
                :key="aIdx"
                class="flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] text-brand-700"
              >
                <i class="pi pi-file text-xs" />
                <span class="max-w-[130px] truncate">{{ att.name }}</span>
                <button
                  type="button"
                  class="text-brand-500 hover:text-rose-500"
                  @click="pendingAttachments.splice(aIdx, 1)"
                >
                  <i class="pi pi-times text-[10px]" />
                </button>
              </div>
            </div>

            <div class="flex items-end gap-2">
              <!-- Upload Button -->
              <label
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500 transition cursor-pointer"
                title="پیوست تصویر یا فایل"
              >
                <i v-if="uploading" class="pi pi-spin pi-spinner text-sm" />
                <i v-else class="pi pi-paperclip text-sm" />
                <input
                  type="file"
                  class="hidden"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  :disabled="uploading || sending"
                  @change="handleFileUpload"
                />
              </label>

              <!-- Textarea -->
              <div class="flex-1">
                <textarea
                  v-model="replyText"
                  rows="1"
                  placeholder="پاسخ ادمین به تیکت... (Enter برای ارسال، Shift+Enter خط جدید)"
                  class="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none min-h-[42px] max-h-32"
                  :disabled="sending"
                  @keydown.enter.exact.prevent="handleSend"
                />
              </div>

              <!-- Send Button -->
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 transition cursor-pointer"
                :disabled="(!replyText.trim() && pendingAttachments.length === 0) || sending || uploading"
                @click="handleSend"
              >
                <i v-if="sending" class="pi pi-spin pi-spinner text-sm" />
                <i v-else class="pi pi-send text-sm" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ══ DIALOGUE CONFIRM DELETE TICKET (EXCLUSIVE FOR OWNER) ══ -->
    <Dialog
      v-model:visible="showDeleteDialog"
      modal
      header="تایید حذف تیکت پشتیبانی"
      :style="{ width: '90vw', maxWidth: '440px' }"
      dir="rtl"
    >
      <div class="space-y-3 pt-2 text-xs text-gray-600">
        <div class="flex items-center gap-2 text-rose-600 font-bold text-sm">
          <i class="pi pi-exclamation-triangle text-lg" />
          <span>هشدار حذف دائمی تیکت</span>
        </div>
        <p class="leading-relaxed">
          آیا از حذف تیکت با کد رهگیری
          <strong class="font-mono text-gray-900">{{ ticketToDelete?.trackingCode }}</strong>
          (مربوط به {{ ticketToDelete?.user?.first_name ? `${ticketToDelete.user.first_name} ${ticketToDelete.user.last_name || ''}` : 'کاربر' }}) اطمینان دارید؟
        </p>
        <p class="text-[11px] text-gray-400">
          این عملیات تنها توسط مالک فروشگاه قابل انجام است و تمام تاریخچه پیام‌ها و پیوست‌های این تیکت حذف خواهند شد.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            label="انصراف"
            class="p-button-text p-button-sm text-gray-500"
            @click="showDeleteDialog = false"
          />
          <Button
            type="button"
            label="بله، تیکت حذف شود"
            icon="pi pi-trash"
            class="!bg-rose-600 !border-rose-600 text-white p-button-sm px-3"
            :loading="isDeleting"
            @click="handleDeleteTicket"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Ticket, TicketAttachment } from '@nimoura/shared-types';

const toast = useAppToast();
const { isOwner } = usePermissions();

const {
  tickets,
  stats,
  activeTicket,
  pending,
  sending,
  uploading,
  fetchStats,
  fetchTickets,
  fetchTicketById,
  replyAdmin,
  updateTicketStatus,
  uploadAttachment,
  deleteTicket,
  getStatusBadge,
  getPriorityBadge,
  getDepartmentLabel,
} = useAdminTickets();

const chatScrollContainer = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const activeStatusFilter = ref('all');
const replyText = ref('');
const pendingAttachments = ref<TicketAttachment[]>([]);

const showDeleteDialog = ref(false);
const ticketToDelete = ref<Ticket | null>(null);
const isDeleting = ref(false);

const confirmDeleteTicket = (ticket: Ticket) => {
  ticketToDelete.value = ticket;
  showDeleteDialog.value = true;
};

const handleDeleteTicket = async () => {
  if (!ticketToDelete.value) return;
  isDeleting.value = true;
  try {
    await deleteTicket(ticketToDelete.value.id);
    toast.success('تیکت پشتیبانی با موفقیت حذف گردید.');
    showDeleteDialog.value = false;
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.data?.message || 'خطا در حذف تیکت. فقط مالک اجازه حذف دارد.');
  } finally {
    isDeleting.value = false;
    ticketToDelete.value = null;
  }
};

const statusFilters = [
  { key: 'all', label: 'همه' },
  { key: 'open', label: 'در انتظار پاسخ' },
  { key: 'in_progress', label: 'در حال بررسی' },
  { key: 'waiting_user', label: 'در انتظار مشتری' },
  { key: 'closed', label: 'بسته شده' },
];

const quickReplies = [
  {
    title: 'ارسال شد',
    text: 'سلام و احترام، سفارش شما با موفقیت بسته‌بندی شده و جهت ارسال به اداره پست تحویل داده شد.',
  },
  {
    title: 'درخواست فیش',
    text: 'سلام و وقت بخیر، لطفاً تصویر فیش واریزی یا شماره پیگیری تراکنش بانکی را ارسال فرمایید تا بررسی شود.',
  },
  {
    title: 'ارجاع به انبار',
    text: 'درود، درخواست شما به واحد انبار و لجستیک ارجاع داده شد و نتیجه ظرف چند ساعت آینده اعلام می‌گردد.',
  },
  {
    title: 'رفع مشکل',
    text: 'سلام و وقت بخیر، مورد اعلام‌شده توسط شما با موفقیت بررسی و رفع گردید. در صورت وجود سؤال دیگر، با کمال میل در خدمتیم.',
  },
];

onMounted(async () => {
  await Promise.all([fetchStats(), fetchTickets()]);
});

const setStatusFilter = async (key: string) => {
  activeStatusFilter.value = key;
  await fetchTickets({
    status: key === 'all' ? undefined : key,
    search: searchQuery.value.trim() || undefined,
  });
};

let searchTimer: any = null;
const onSearchInput = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchTickets({
      status: activeStatusFilter.value === 'all' ? undefined : activeStatusFilter.value,
      search: searchQuery.value.trim() || undefined,
    });
  }, 350);
};

const selectTicket = async (ticket: Ticket) => {
  try {
    await fetchTicketById(ticket.id);
    scrollToBottom();
  } catch (err) {
    console.error('Failed to select ticket', err);
  }
};

const insertQuickReply = (canned: { title: string; text: string }) => {
  if (replyText.value) {
    replyText.value += '\n' + canned.text;
  } else {
    replyText.value = canned.text;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const uploaded = await uploadAttachment(file);
    pendingAttachments.value.push(uploaded);
  } catch (err) {
    console.error('Upload failed', err);
  } finally {
    target.value = '';
  }
};

const handleSend = async () => {
  if (!activeTicket.value) return;
  const text = replyText.value.trim();
  if (!text && pendingAttachments.value.length === 0) return;

  try {
    await replyAdmin(activeTicket.value.id, {
      message: text || 'پیوست ارسال شد',
      attachments: [...pendingAttachments.value],
    });
    replyText.value = '';
    pendingAttachments.value = [];
    scrollToBottom();
  } catch (err) {
    console.error('Failed to send admin reply', err);
  }
};

const handleStatusChange = async (event: Event) => {
  if (!activeTicket.value) return;
  const target = event.target as HTMLSelectElement;
  try {
    await updateTicketStatus(activeTicket.value.id, {
      status: target.value as any,
    });
  } catch (err) {
    console.error('Failed to update status', err);
  }
};

const handlePriorityChange = async (event: Event) => {
  if (!activeTicket.value) return;
  const target = event.target as HTMLSelectElement;
  try {
    await updateTicketStatus(activeTicket.value.id, {
      status: activeTicket.value.status,
      priority: target.value as any,
    });
  } catch (err) {
    console.error('Failed to update priority', err);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const getUserInitials = (user?: any) => {
  if (!user) return 'ن';
  const first = user.first_name || '';
  const last = user.last_name || '';
  const full = `${first} ${last}`.trim();
  return full ? full.slice(0, 1) : 'ن';
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'لحظاتی پیش';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}د پیش`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}س پیش`;
  return date.toLocaleDateString('fa-IR');
};

// ── Polling برای دریافت بی‌درنگ پیام‌های جدید ──
let pollTimer: any = null;
onMounted(() => {
  pollTimer = setInterval(async () => {
    if (activeTicket.value && activeTicket.value.id) {
      await fetchTicketById(activeTicket.value.id, true);
    }
    await fetchStats();
  }, 10000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

watch(
  () => activeTicket.value?.messages?.length,
  () => {
    scrollToBottom();
  },
);
</script>


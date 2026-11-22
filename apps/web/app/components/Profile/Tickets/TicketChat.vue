<template>
  <div class="flex flex-col h-[650px] max-h-[85vh] rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden" dir="rtl">
    <!-- ══ HEADER ══ -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/70">
      <div class="flex items-center gap-3">
        <!-- Back Button -->
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          title="بازگشت به لیست"
          @click="$emit('back')"
        >
          <i class="pi pi-arrow-right text-xs" />
        </button>

        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-vazir text-sm font-bold text-gray-900">
              {{ ticket.title }}
            </h3>
            <!-- Tracking Code -->
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md bg-gray-200/60 px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              title="کپی کد پیگیری"
              @click="copyCode"
            >
              <span>{{ ticket.trackingCode }}</span>
              <i :class="copied ? 'pi pi-check text-emerald-600' : 'pi pi-copy text-gray-400'" class="text-[10px]" />
            </button>
          </div>

          <div class="flex items-center gap-2 mt-1 text-[11px]">
            <span class="text-gray-500 font-medium">
              {{ getDepartmentLabel(ticket.department) }}
            </span>
            <span class="text-gray-300">•</span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
              :class="getStatusBadge(ticket.status).color"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="getStatusBadge(ticket.status).dot" />
              <span>{{ getStatusBadge(ticket.status).label }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          v-if="ticket.status !== 'closed'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-rose-600 transition-colors cursor-pointer"
          :disabled="closing"
          @click="handleCloseTicket"
        >
          <i v-if="closing" class="pi pi-spin pi-spinner text-xs" />
          <i v-else class="pi pi-lock text-xs" />
          <span>بستن تیکت</span>
        </button>
      </div>
    </div>

    <!-- ══ CHAT STREAM ══ -->
    <div
      ref="chatScrollContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcf9f9]"
    >
      <!-- Initial Ticket Info Banner -->
      <div class="mx-auto max-w-md rounded-xl bg-white/80 p-3 text-center border border-gray-200/60 shadow-2xs">
        <p class="text-xs text-gray-600">
          تیکت با کد <span class="font-mono font-semibold text-nimoura-primary">{{ ticket.trackingCode }}</span> ایجاد شد.
        </p>
        <p class="mt-1 text-[11px] text-gray-400">
          پشتیبان‌های نیمورا در اسرع وقت پاسخگوی شما خواهند بود.
        </p>
      </div>

      <!-- Messages Loop -->
      <div
        v-for="msg in ticket.messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.senderRole === 'user' ? 'items-end' : 'items-start'"
      >
        <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <!-- Support Avatar (Left) -->
          <div
            v-if="msg.senderRole !== 'user'"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary text-white shadow-xs mb-1"
          >
            <i class="pi pi-headphones text-xs" />
          </div>

          <!-- Bubble -->
          <div
            class="rounded-2xl p-3.5 shadow-2xs text-sm"
            :class="
              msg.senderRole === 'user'
                ? 'bg-nimoura-primary text-white rounded-bl-sm'
                : 'bg-white text-gray-800 border border-gray-200/80 rounded-br-sm'
            "
          >
            <!-- Sender Header -->
            <div
              class="flex items-center justify-between gap-4 mb-1.5 text-[11px]"
              :class="msg.senderRole === 'user' ? 'text-white/80' : 'text-gray-400'"
            >
              <span class="font-semibold">
                {{ msg.senderRole === 'user' ? 'شما' : 'پشتیبان رسمی نیمورا' }}
              </span>
              <span class="text-[10px]">{{ formatTime(msg.createdAt) }}</span>
            </div>

            <!-- Message Text -->
            <p class="whitespace-pre-line leading-relaxed text-[13px] font-vazir">
              {{ msg.message }}
            </p>

            <!-- Attachments -->
            <div
              v-if="msg.attachments && msg.attachments.length > 0"
              class="mt-2.5 pt-2 border-t space-y-1.5"
              :class="msg.senderRole === 'user' ? 'border-white/20' : 'border-gray-100'"
            >
              <div
                v-for="(file, fIdx) in msg.attachments"
                :key="fIdx"
                class="flex items-center gap-2"
              >
                <!-- Image Attachment -->
                <a
                  v-if="isImage(file.url)"
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group relative block overflow-hidden rounded-xl border max-w-[200px]"
                  :class="msg.senderRole === 'user' ? 'border-white/30' : 'border-gray-200'"
                >
                  <img
                    :src="formatImageUrl(file.url)"
                    :alt="file.name"
                    class="h-28 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                    <i class="pi pi-search-plus" />
                  </div>
                </a>

                <!-- Document Attachment -->
                <a
                  v-else
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition"
                  :class="
                    msg.senderRole === 'user'
                      ? 'bg-white/15 text-white hover:bg-white/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  "
                >
                  <i class="pi pi-file text-sm" />
                  <span class="max-w-[140px] truncate">{{ file.name }}</span>
                  <i class="pi pi-download text-[10px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Notice Banner -->
      <div
        v-if="ticket.status === 'closed'"
        class="rounded-xl border border-gray-200 bg-gray-100 p-3 text-center text-xs text-gray-600"
      >
        <i class="pi pi-lock ms-1 text-gray-400" />
        <span>این گفتگو بسته شده است. با ارسال پیام جدید، تیکت به‌صورت خودکار مجدداً بازگشایی خواهد شد.</span>
      </div>
    </div>

    <!-- ══ COMPOSER / INPUT ══ -->
    <div class="border-t border-gray-200 bg-white p-3">
      <!-- Attached files preview pills before sending -->
      <div v-if="pendingAttachments.length > 0" class="mb-2 flex flex-wrap gap-2">
        <div
          v-for="(att, aIdx) in pendingAttachments"
          :key="aIdx"
          class="flex items-center gap-1.5 rounded-lg border border-nimoura-primary/20 bg-nimoura-primary/5 px-2.5 py-1 text-xs text-nimoura-primary"
        >
          <i class="pi pi-file text-xs" />
          <span class="max-w-[150px] truncate">{{ att.name }}</span>
          <button
            type="button"
            class="text-nimoura-primary/60 hover:text-rose-500 cursor-pointer"
            @click="pendingAttachments.splice(aIdx, 1)"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </div>
      </div>

      <div class="flex items-end gap-2">
        <!-- Attachment Button -->
        <label
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-nimoura-primary hover:text-nimoura-primary hover:bg-nimoura-primary/5 transition-colors cursor-pointer"
          title="پیوست فایل یا تصویر"
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

        <!-- Message Textarea -->
        <div class="flex-1">
          <textarea
            v-model="replyText"
            rows="1"
            placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter خط جدید)"
            class="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 transition focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/10 max-h-32 min-h-[42px]"
            :disabled="sending"
            @keydown.enter.exact.prevent="handleSend"
          />
        </div>

        <!-- Send Button -->
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary text-white shadow-md shadow-nimoura-primary/20 hover:bg-nimoura-primary-dark disabled:opacity-50 transition cursor-pointer"
          :disabled="(!replyText.trim() && pendingAttachments.length === 0) || sending || uploading"
          @click="handleSend"
        >
          <i v-if="sending" class="pi pi-spin pi-spinner text-sm" />
          <i v-else class="pi pi-send text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket, TicketAttachment } from '@nimoura/shared-types';

const props = defineProps<{
  ticket: Ticket;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const { currentTicket, replyTicket, closeTicket, fetchTicketById, uploadAttachment, uploading, sending, getStatusBadge, getDepartmentLabel } = useTickets();

const ticket = computed(() => {
  if (currentTicket.value && currentTicket.value.id === props.ticket.id) {
    return currentTicket.value;
  }
  return props.ticket;
});

const chatScrollContainer = ref<HTMLElement | null>(null);
const replyText = ref('');
const pendingAttachments = ref<TicketAttachment[]>([]);
const closing = ref(false);
const copied = ref(false);

const isImage = (url: string) => {
  return /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(url);
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const copyCode = async () => {
  if (props.ticket.trackingCode) {
    await navigator.clipboard.writeText(props.ticket.trackingCode);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
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
  const text = replyText.value.trim();
  if (!text && pendingAttachments.value.length === 0) return;

  try {
    await replyTicket(props.ticket.id, {
      message: text || 'فایل ضمیمه ارسال شد',
      attachments: [...pendingAttachments.value],
    });
    replyText.value = '';
    pendingAttachments.value = [];
    scrollToBottom();
  } catch (err) {
    console.error('Failed to send reply', err);
  }
};

const handleCloseTicket = async () => {
  if (!confirm('آیا از بستن این تیکت اطمینان دارید؟')) return;
  closing.value = true;
  try {
    await closeTicket(props.ticket.id);
  } finally {
    closing.value = false;
  }
};

// ── Polling برای دریافت بی‌درنگ پیام‌های جدید پشتیبانی ──
let pollTimer: any = null;
onMounted(() => {
  scrollToBottom();
  pollTimer = setInterval(async () => {
    if (props.ticket && props.ticket.id) {
      await fetchTicketById(props.ticket.id, true);
    }
  }, 12000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

watch(
  () => props.ticket.messages?.length,
  () => {
    scrollToBottom();
  },
);
</script>

<template>
  <div
    class="flex h-[650px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-nimoura-text-100 bg-white font-vazir shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
    dir="rtl"
  >
    <!-- ══ HEADER ══ -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-nimoura-text-100 bg-nimoura-50/70 px-4 py-3.5"
    >
      <div class="flex min-w-0 items-center gap-3">
        <!-- Back Button -->
        <Button
          icon="pi pi-arrow-right"
          title="بازگشت به لیست"
          aria-label="بازگشت به لیست"
          class="!flex !size-9 !shrink-0 !items-center !justify-center !rounded-xl !border !border-nimoura-text-100 !bg-white !text-sm !text-nimoura-text-600 transition-colors hover:!border-nimoura-primary/40 hover:!bg-nimoura-50 hover:!text-nimoura-primary"
          @click="$emit('back')"
        />

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="min-w-0 truncate font-vazir text-sm font-bold text-nimoura-text-900">
              {{ ticket.title }}
            </h3>
            <!-- Tracking Code -->
            <Button
              :label="ticket.trackingCode"
              icon="pi pi-copy"
              icon-pos="right"
              title="کپی کد پیگیری"
              :pt="{
                icon: {
                  class: copied ? '!text-nimoura-success' : '!text-nimoura-text-400',
                },
              }"
              class="!rounded-lg !border-0 !bg-nimoura-100/70 !px-2 !py-1 !font-mono !text-[11px] !font-medium !text-nimoura-text-700 transition-colors hover:!bg-nimoura-200/70"
              @click="copyCode"
            />
          </div>

          <div class="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
            <span class="font-medium text-nimoura-text-500">
              {{ getDepartmentLabel(ticket.department) }}
            </span>
            <span class="text-nimoura-text-300">•</span>
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
              :class="getStatusBadge(ticket.status).color"
            >
              <span class="size-1.5 rounded-full" :class="getStatusBadge(ticket.status).dot" />
              <span>{{ getStatusBadge(ticket.status).label }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <Button
          v-if="ticket.status !== 'closed'"
          label="بستن تیکت"
          :icon="closing ? 'pi pi-spin pi-spinner' : 'pi pi-lock'"
          icon-pos="left"
          :disabled="closing"
          class="!inline-flex !items-center !gap-1.5 !rounded-xl !border-nimoura-text-100 !bg-white !px-3 !py-2 !font-vazir !text-xs !font-medium !text-nimoura-text-600 transition-colors hover:!border-nimoura-error/40 hover:!bg-nimoura-error/5 hover:!text-nimoura-error disabled:!opacity-60"
          @click="handleCloseTicket"
        />
      </div>
    </div>

    <!-- ══ CHAT STREAM ══ -->
    <div
      ref="chatScrollContainer"
      class="flex-1 space-y-4 overflow-y-auto bg-nimoura-base/70 p-4"
    >
      <!-- Initial Ticket Info Banner -->
      <div
        class="mx-auto max-w-md rounded-2xl border border-nimoura-text-100 bg-white/90 p-3 text-center shadow-[0_4px_16px_rgba(39,33,33,0.04)]"
      >
        <p class="font-vazir text-xs text-nimoura-text-600">
          تیکت با کد
          <span class="font-mono font-semibold text-nimoura-primary">{{ ticket.trackingCode }}</span>
          ایجاد شد.
        </p>
        <p class="mt-1 text-[11px] text-nimoura-text-400">
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
        <div class="flex max-w-[85%] items-end gap-2 sm:max-w-[75%]">
          <!-- Support Avatar (Left) -->
          <div
            v-if="msg.senderRole !== 'user'"
            class="mb-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary text-white shadow-[0_4px_10px_rgba(183,110,121,0.25)]"
          >
            <i class="pi pi-headphones text-xs!" />
          </div>

          <!-- Bubble -->
          <div
            class="rounded-2xl p-3.5 text-sm shadow-[0_4px_14px_rgba(39,33,33,0.05)]"
            :class="
              msg.senderRole === 'user'
                ? 'rounded-bl-sm bg-nimoura-primary text-white'
                : 'rounded-br-sm border border-nimoura-text-100 bg-white text-nimoura-text-900'
            "
          >
            <!-- Sender Header -->
            <div
              class="mb-1.5 flex items-center justify-between gap-4 text-[11px]"
              :class="msg.senderRole === 'user' ? 'text-white/80' : 'text-nimoura-text-400'"
            >
              <span class="font-semibold">
                {{ msg.senderRole === 'user' ? 'شما' : 'پشتیبان رسمی نیمورا' }}
              </span>
              <span class="text-[10px]">{{ formatTime(msg.createdAt) }}</span>
            </div>

            <!-- Message Text -->
            <p class="whitespace-pre-line font-vazir text-[13px] leading-relaxed">
              {{ msg.message }}
            </p>

            <!-- Attachments -->
            <div
              v-if="msg.attachments && msg.attachments.length > 0"
              class="mt-2.5 space-y-1.5 border-t pt-2"
              :class="msg.senderRole === 'user' ? 'border-white/25' : 'border-nimoura-text-100'"
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
                  class="group relative block max-w-[200px] overflow-hidden rounded-xl border"
                  :class="msg.senderRole === 'user' ? 'border-white/30' : 'border-nimoura-text-100'"
                >
                  <img
                    :src="formatImageUrl(file.url)"
                    :alt="file.name"
                    class="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-nimoura-950/30 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
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
                      : 'bg-nimoura-50 text-nimoura-text-700 hover:bg-nimoura-100'
                  "
                >
                  <i class="pi pi-file text-sm!" />
                  <span class="max-w-[140px] truncate">{{ file.name }}</span>
                  <i class="pi pi-download text-[10px]!" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Notice Banner -->
      <div
        v-if="ticket.status === 'closed'"
        class="rounded-xl border border-nimoura-text-100 bg-nimoura-50 p-3 text-center font-vazir text-xs text-nimoura-text-600"
      >
        <i class="pi pi-lock ms-1 text-nimoura-text-400" />
        <span>این گفتگو بسته شده است. با ارسال پیام جدید، تیکت به‌صورت خودکار مجدداً بازگشایی خواهد شد.</span>
      </div>
    </div>

    <!-- ══ COMPOSER / INPUT ══ -->
    <div class="border-t border-nimoura-text-100 bg-white p-3">
      <!-- Attached files preview pills before sending -->
      <div v-if="pendingAttachments.length > 0" class="mb-2 flex flex-wrap gap-2">
        <div
          v-for="(att, aIdx) in pendingAttachments"
          :key="aIdx"
          class="flex items-center gap-1.5 rounded-lg border border-nimoura-primary/25 bg-nimoura-primary/5 px-2.5 py-1 text-xs text-nimoura-primary"
        >
          <i class="pi pi-file text-xs!" />
          <span class="max-w-[150px] truncate">{{ att.name }}</span>
          <Button
            icon="pi pi-times"
            title="حذف پیوست"
            class="!flex !size-5 !items-center !justify-center !border-0 !bg-transparent !p-0 !text-[10px] !text-nimoura-primary/70 transition-colors hover:!bg-transparent hover:!text-nimoura-error"
            @click="pendingAttachments.splice(aIdx, 1)"
          />
        </div>
      </div>

      <div class="flex items-end gap-2">
        <!-- Attachment Button -->
        <Button
          as="label"
          :loading="uploading"
          :disabled="uploading || sending"
          title="پیوست فایل یا تصویر"
          class="!flex !size-10 !shrink-0 !cursor-pointer !items-center !justify-center !rounded-xl !border !border-nimoura-text-100 !bg-white !text-sm !text-nimoura-text-500 transition-colors hover:!border-nimoura-primary hover:!bg-nimoura-primary/5 hover:!text-nimoura-primary"
        >
          <i v-if="uploading" class="pi pi-spin pi-spinner text-sm!" />
          <i v-else class="pi pi-paperclip text-sm!" />
          <input
            type="file"
            class="hidden"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            :disabled="uploading || sending"
            @change="handleFileUpload"
          />
        </Button>

        <!-- Message Textarea -->
        <div class="min-w-0 flex-1">
          <Textarea
            v-model="replyText"
            rows="1"
            placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter خط جدید)"
            class="!max-h-32 !min-h-[42px] !w-full !resize-none !rounded-xl !border-nimoura-text-100 !bg-white !px-3.5 !py-2.5 !font-vazir !text-[13px] !text-nimoura-text-800 placeholder:!text-nimoura-text-400 focus:!border-nimoura-primary focus:!ring-2 focus:!ring-nimoura-primary/10"
            :disabled="sending"
            @keydown.enter.exact.prevent="handleSend"
          />
        </div>

        <!-- Send Button -->
        <Button
          icon="pi pi-send"
          :loading="sending"
          :disabled="(!replyText.trim() && pendingAttachments.length === 0) || sending || uploading"
          title="ارسال پیام"
          class="!flex !size-10 !shrink-0 !items-center !justify-center !rounded-xl !border-nimoura-primary !bg-nimoura-primary !text-sm !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.24)] transition-colors hover:!bg-nimoura-primary/90 disabled:!opacity-50"
          @click="handleSend"
        />
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

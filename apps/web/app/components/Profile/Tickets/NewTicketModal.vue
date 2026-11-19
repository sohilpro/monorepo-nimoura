<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="ثبت تیکت پشتیبانی جدید"
    :style="{ width: '92vw', maxWidth: '580px' }"
    :closable="!submitting"
    dir="rtl"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2 text-sm text-gray-700">
      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">
          موضوع تیکت <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/10"
          placeholder="مثلاً: مشکل در ثبت سفارش یا مغایرت کالای ارسالی"
          required
        />
      </div>

      <!-- Department -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">
          بخش مربوطه (دپارتمان) <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="dept in departments"
            :key="dept.value"
            type="button"
            class="flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-right cursor-pointer"
            :class="
              form.department === dept.value
                ? 'border-nimoura-primary bg-nimoura-primary/5 text-nimoura-primary shadow-xs font-semibold'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            "
            @click="form.department = dept.value"
          >
            <i :class="`pi ${dept.icon} text-sm`" />
            <span class="truncate">{{ dept.label }}</span>
          </button>
        </div>
      </div>

      <!-- Priority -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">
          اولویت پاسخ‌دهی
        </label>
        <div class="flex gap-2">
          <button
            v-for="p in priorities"
            :key="p.value"
            type="button"
            class="flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition cursor-pointer text-center"
            :class="
              form.priority === p.value
                ? `${p.activeClass} font-semibold shadow-xs`
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
            "
            @click="form.priority = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Message -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">
          متن پیام شما <span class="text-rose-500">*</span>
        </label>
        <textarea
          v-model="form.message"
          rows="4"
          class="w-full rounded-xl border border-gray-200 p-3 text-sm transition focus:border-nimoura-primary focus:outline-none focus:ring-2 focus:ring-nimoura-primary/10"
          placeholder="شرح دقیق مسئله، شماره پیگیری سفارش یا هرگونه توضیحات لازم را بنویسید..."
          required
        />
      </div>

      <!-- Attachment -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1.5">
          پیوست فایل یا تصویر (اختیاری)
        </label>
        <div class="space-y-2">
          <div
            v-if="attachments.length > 0"
            class="flex flex-wrap gap-2"
          >
            <div
              v-for="(att, idx) in attachments"
              :key="idx"
              class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700"
            >
              <i class="pi pi-file text-nimoura-primary" />
              <span class="max-w-[160px] truncate">{{ att.name }}</span>
              <button
                type="button"
                class="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                @click="removeAttachment(idx)"
              >
                <i class="pi pi-times text-[10px]" />
              </button>
            </div>
          </div>

          <label
            class="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-3 text-xs font-medium text-gray-500 transition hover:border-nimoura-primary hover:bg-nimoura-primary/5 hover:text-nimoura-primary cursor-pointer"
          >
            <i v-if="uploading" class="pi pi-spin pi-spinner text-sm" />
            <i v-else class="pi pi-paperclip text-sm" />
            <span>{{ uploading ? 'در حال بارگذاری فایل...' : 'انتخاب تصویر یا فایل (حداکثر ۱۰ مگابایت)' }}</span>
            <input
              type="file"
              class="hidden"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              :disabled="uploading"
              @change="handleFileSelect"
            />
          </label>
        </div>
      </div>

      <!-- Error alert -->
      <div
        v-if="errorMessage"
        class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          :disabled="submitting"
          @click="visible = false"
        >
          انصراف
        </button>
        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-xl bg-nimoura-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-nimoura-primary/20 transition hover:bg-nimoura-primary-dark disabled:opacity-50 cursor-pointer"
          :disabled="submitting || uploading"
        >
          <i v-if="submitting" class="pi pi-spin pi-spinner text-xs" />
          <i v-else class="pi pi-send text-xs" />
          <span>{{ submitting ? 'در حال ارسال...' : 'ارسال تیکت' }}</span>
        </button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import {
  TicketDepartment,
  TicketPriority,
  type TicketAttachment,
} from '@nimoura/shared-types';

const visible = defineModel<boolean>('visible', { default: false });
const emit = defineEmits<{
  (e: 'created', ticket: any): void;
}>();

const { createTicket, uploadAttachment, uploading } = useTickets();

const departments = [
  { value: TicketDepartment.ORDERS, label: 'سفارشات و ارسال', icon: 'pi-shopping-bag' },
  { value: TicketDepartment.FINANCIAL, label: 'امور مالی و پرداخت', icon: 'pi-credit-card' },
  { value: TicketDepartment.TECHNICAL, label: 'پشتیبانی فنی', icon: 'pi-cog' },
  { value: TicketDepartment.SALES, label: 'مشاوره خرید', icon: 'pi-question-circle' },
  { value: TicketDepartment.GENERAL, label: 'عمومی و پیشنهادات', icon: 'pi-comments' },
];

const priorities = [
  { value: TicketPriority.LOW, label: 'عادی', activeClass: 'border-gray-400 bg-gray-100 text-gray-800' },
  { value: TicketPriority.MEDIUM, label: 'متوسط', activeClass: 'border-blue-400 bg-blue-50 text-blue-700' },
  { value: TicketPriority.HIGH, label: 'زیاد', activeClass: 'border-orange-400 bg-orange-50 text-orange-700' },
  { value: TicketPriority.URGENT, label: 'فوری', activeClass: 'border-rose-400 bg-rose-50 text-rose-700' },
];

const form = ref({
  title: '',
  department: TicketDepartment.ORDERS,
  priority: TicketPriority.MEDIUM,
  message: '',
});

const attachments = ref<TicketAttachment[]>([]);
const submitting = ref(false);
const errorMessage = ref('');

const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1);
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'حجم فایل نمی‌تواند بیشتر از ۱۰ مگابایت باشد.';
    return;
  }

  errorMessage.value = '';
  try {
    const uploaded = await uploadAttachment(file);
    attachments.value.push(uploaded);
  } catch (err: any) {
    errorMessage.value = err?.message || 'خطا در آپلود فایل';
  } finally {
    target.value = '';
  }
};

const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.message.trim()) {
    errorMessage.value = 'لطفاً تمامی فیلدهای الزامی را تکمیل کنید.';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    const created = await createTicket({
      title: form.value.title.trim(),
      department: form.value.department,
      priority: form.value.priority,
      message: form.value.message.trim(),
      attachments: attachments.value,
    });

    // پاکسازی فرم
    form.value.title = '';
    form.value.message = '';
    form.value.department = TicketDepartment.ORDERS;
    form.value.priority = TicketPriority.MEDIUM;
    attachments.value = [];
    visible.value = false;

    emit('created', created);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'خطا در ثبت تیکت';
  } finally {
    submitting.value = false;
  }
};
</script>

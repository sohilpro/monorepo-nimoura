<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="ثبت تیکت پشتیبانی جدید"
    :style="{ width: '92vw', maxWidth: '580px' }"
    :closable="!submitting"
    dir="rtl"
    class="!overflow-hidden !rounded-2xl !shadow-[0_20px_60px_rgba(39,33,33,0.18)]"
    :pt="{
      header: { class: '!border-b !border-nimoura-text-100 !bg-nimoura-50/70 !px-5 !py-4' },
      title: { class: '!font-vazir !text-sm !font-bold !text-nimoura-text-900' },
      content: { class: '!px-5 !py-4' },
    }"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5 pt-1 font-vazir text-sm text-nimoura-text-700">
      <!-- Title -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          موضوع تیکت <span class="text-nimoura-error">*</span>
        </label>
        <InputText
          v-model="form.title"
          type="text"
          class="!w-full !rounded-xl !border-nimoura-text-100 !bg-white !px-3.5 !py-2.5 !font-vazir !text-sm !text-nimoura-text-800 placeholder:!text-nimoura-text-400 focus:!border-nimoura-primary focus:!ring-2 focus:!ring-nimoura-primary/10"
          placeholder="مثلاً: مشکل در ثبت سفارش یا مغایرت کالای ارسالی"
          required
        />
      </div>

      <!-- Department -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          بخش مربوطه (دپارتمان) <span class="text-nimoura-error">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button
            v-for="dept in departments"
            :key="dept.value"
            :label="dept.label"
            :icon="`pi ${dept.icon}`"
            icon-pos="left"
            :class="
              form.department === dept.value
                ? '!justify-start !rounded-xl !border-nimoura-primary !bg-nimoura-primary/10 !text-nimoura-primary !shadow-[0_4px_12px_rgba(183,110,121,0.12)] !font-semibold'
                : '!justify-start !rounded-xl !border-nimoura-text-100 !bg-white !font-medium !text-nimoura-text-600 transition-colors hover:!border-nimoura-primary/40 hover:!bg-nimoura-50 hover:!text-nimoura-primary'
            "
            @click="form.department = dept.value"
          />
        </div>
      </div>

      <!-- Priority -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          اولویت پاسخ‌دهی
        </label>
        <div class="flex gap-2">
          <Button
            v-for="p in priorities"
            :key="p.value"
            :label="p.label"
            :class="
              form.priority === p.value
                ? `${p.activeClass} !font-semibold !shadow-[0_4px_12px_rgba(39,33,33,0.06)]`
                : '!rounded-lg !border-nimoura-text-100 !bg-white !text-xs !font-medium !text-nimoura-text-500 transition-colors hover:!bg-nimoura-50'
            "
            @click="form.priority = p.value"
          />
        </div>
      </div>

      <!-- Message -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          متن پیام شما <span class="text-nimoura-error">*</span>
        </label>
        <Textarea
          v-model="form.message"
          :rows="4"
          class="!w-full !rounded-xl !border-nimoura-text-100 !bg-white !p-3 !font-vazir !text-sm !text-nimoura-text-800 placeholder:!text-nimoura-text-400 focus:!border-nimoura-primary focus:!ring-2 focus:!ring-nimoura-primary/10"
          placeholder="شرح دقیق مسئله، شماره پیگیری سفارش یا هرگونه توضیحات لازم را بنویسید..."
          required
        />
      </div>

      <!-- Attachment -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          پیوست فایل یا تصویر (اختیاری)
        </label>
        <div class="space-y-2">
          <div v-if="attachments.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(att, idx) in attachments"
              :key="idx"
              class="flex items-center gap-2 rounded-lg border border-nimoura-text-100 bg-nimoura-50 px-2.5 py-1.5 text-xs text-nimoura-text-700"
            >
              <i class="pi pi-file text-nimoura-primary" />
              <span class="max-w-[160px] truncate">{{ att.name }}</span>
              <Button
                icon="pi pi-times"
                title="حذف پیوست"
                class="!flex !size-5 !items-center !justify-center !border-0 !bg-transparent !p-0 !text-[10px] !text-nimoura-text-400 transition-colors hover:!bg-transparent hover:!text-nimoura-error"
                @click="removeAttachment(idx)"
              />
            </div>
          </div>

          <Button
            as="label"
            :loading="uploading"
            :disabled="uploading"
            class="!flex !w-full !cursor-pointer !items-center !justify-center !gap-2 !rounded-xl !border !border-dashed !border-nimoura-text-200 !bg-nimoura-50/60 !px-3 !py-3 !font-vazir !text-xs !font-medium !text-nimoura-text-500 transition-colors hover:!border-nimoura-primary hover:!bg-nimoura-primary/5 hover:!text-nimoura-primary"
          >
            <i v-if="uploading" class="pi pi-spin pi-spinner text-sm!" />
            <i v-else class="pi pi-paperclip text-sm!" />
            <span>{{ uploading ? 'در حال بارگذاری فایل...' : 'انتخاب تصویر یا فایل (حداکثر ۱۰ مگابایت)' }}</span>
            <input
              type="file"
              class="hidden"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              :disabled="uploading"
              @change="handleFileSelect"
            />
          </Button>
        </div>
      </div>

      <!-- Error alert -->
      <div
        v-if="errorMessage"
        class="flex items-start gap-2 rounded-xl border border-nimoura-error/30 bg-nimoura-error/5 p-3 text-xs font-medium text-nimoura-error"
      >
        <i class="pi pi-exclamation-circle mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2.5 border-t border-nimoura-text-100 pt-4">
        <Button
          label="انصراف"
          text
          :disabled="submitting"
          class="!rounded-xl !font-vazir !text-xs !font-medium !text-nimoura-text-600 hover:!bg-nimoura-50"
          @click="visible = false"
        />
        <Button
          type="submit"
          :label="submitting ? 'در حال ارسال...' : 'ارسال تیکت'"
          icon="pi pi-send"
          icon-pos="left"
          :loading="submitting"
          :disabled="submitting || uploading"
          class="!inline-flex !items-center !gap-2 !rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-5 !py-2.5 !font-vazir !text-xs !font-semibold !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.24)] transition-colors hover:!bg-nimoura-primary/90 disabled:!opacity-50"
        />
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
  { value: TicketPriority.LOW, label: 'عادی', activeClass: '!rounded-lg !border-nimoura-text-300 !bg-nimoura-50 !text-nimoura-text-800' },
  { value: TicketPriority.MEDIUM, label: 'متوسط', activeClass: '!rounded-lg !border-nimoura-primary/40 !bg-nimoura-primary/10 !text-nimoura-primary' },
  { value: TicketPriority.HIGH, label: 'زیاد', activeClass: '!rounded-lg !border-nimoura-warning/60 !bg-nimoura-warning/10 !text-nimoura-warning' },
  { value: TicketPriority.URGENT, label: 'فوری', activeClass: '!rounded-lg !border-nimoura-error/40 !bg-nimoura-error/10 !text-nimoura-error' },
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

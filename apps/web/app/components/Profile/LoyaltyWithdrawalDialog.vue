<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="درخواست تسویه و برداشت اعتبار"
    :style="{ width: '92vw', maxWidth: '480px' }"
    :closable="!submitting"
    dir="rtl"
  >
    <div class="space-y-4 pt-2 text-sm text-nimoura-text-700">
      <div class="rounded-xl border border-nimoura-primary/15 bg-nimoura-primary/5 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-nimoura-text-500">اعتبار قابل برداشت:</span>
          <span class="font-modam text-base font-bold text-nimoura-primary">{{ numberFormat(balance) }} تومان</span>
        </div>
        <p class="mt-1 text-[11px] text-nimoura-text-400">حداقل مبلغ جهت ثبت درخواست تسویه ۱۰٬۰۰۰ تومان است.</p>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          مبلغ درخواستی (تومان) <span class="text-nimoura-error">*</span>
        </label>
        <div class="flex gap-2">
          <InputText
            :model-value="String(form.amount)"
            type="number"
            :max="balance"
            min="10000"
            placeholder="مثلاً ۵۰۰۰۰"
            class="!w-full !rounded-xl !border-nimoura-200 !bg-white !px-3 !py-2.5 !text-sm focus:!border-nimoura-primary"
            @update:model-value="form.amount = Number($event)"
          />
          <Button
            type="button"
            label="حداکثر"
            size="small"
            outlined
            class="!shrink-0 !rounded-xl !border-nimoura-200 !bg-nimoura-50 !px-3 !py-2 !text-xs !font-medium !text-nimoura-text-700 hover:!bg-nimoura-100"
            @click="form.amount = balance"
          />
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          شماره شبا (با IR یا بدون آن) <span class="text-nimoura-error">*</span>
        </label>
        <InputText
          v-model="form.iban"
          type="text"
          dir="ltr"
          placeholder="IR120000000000000000000000"
          class="!w-full !rounded-xl !border-nimoura-200 !bg-white !px-3 !py-2.5 !font-mono !text-sm focus:!border-nimoura-primary"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">
          نام و نام خانوادگی صاحب حساب <span class="text-nimoura-error">*</span>
        </label>
        <InputText
          v-model="form.accountHolderName"
          type="text"
          placeholder="نام کامل صاحب حساب بانکی"
          class="!w-full !rounded-xl !border-nimoura-200 !bg-white !px-3 !py-2.5 !text-sm focus:!border-nimoura-primary"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-nimoura-text-700">شماره کارت (اختیاری)</label>
        <InputText
          v-model="form.cardNumber"
          type="text"
          dir="ltr"
          placeholder="۶۰۳۷-xxxx-xxxx-xxxx"
          class="!w-full !rounded-xl !border-nimoura-200 !bg-white !px-3 !py-2.5 !font-mono !text-sm focus:!border-nimoura-primary"
        />
      </div>

      <!--previous requests-->
      <div v-if="withdrawals && withdrawals.length > 0" class="border-t border-nimoura-text-100 pt-3">
        <p class="mb-2 text-xs font-semibold text-nimoura-text-600">درخواستهای قبلی شما:</p>
        <div class="max-h-36 space-y-1.5 overflow-y-auto text-xs">
          <div
            v-for="w in withdrawals.slice(0, 5)"
            :key="w.id"
            class="flex items-center justify-between gap-2 rounded-lg border border-nimoura-100 bg-nimoura-base px-2.5 py-1.5"
          >
            <div>
              <span class="font-modam font-semibold text-nimoura-text-800">{{ numberFormat(w.amount) }} ت</span>
              <span class="ms-1.5 text-[10px] text-nimoura-text-400">{{ formatDate(w.createdAt) }}</span>
            </div>
            <span
              v-if="w.status === 'PENDING'"
              class="rounded-full border border-nimoura-warning/30 bg-nimoura-warning/10 px-2 py-0.5 text-[10px] font-medium text-nimoura-warning"
            >در انتظار بررسی</span>
            <span
              v-else-if="w.status === 'APPROVED'"
              class="rounded-full border border-nimoura-success/30 bg-nimoura-success/10 px-2 py-0.5 text-[10px] font-medium text-nimoura-success"
            >واریز شد</span>
            <span
              v-else
              class="rounded-full border border-nimoura-error/30 bg-nimoura-error/10 px-2 py-0.5 text-[10px] font-medium text-nimoura-error"
            >رد شده</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          label="انصراف"
          text
          size="small"
          class="!text-nimoura-text-600 hover:!bg-nimoura-50"
          :disabled="submitting"
          @click="visible = false"
        />
        <Button
          type="button"
          label="ثبت درخواست تسویه"
          icon="pi pi-check"
          size="small"
          class="!rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !text-white hover:!bg-nimoura-600"
          :loading="submitting"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  balance: number;
}>();

const visible = defineModel<boolean>('visible', { default: false });
const toast = useAppToast();
const { requestWithdrawal, withdrawals, fetchWithdrawals } = useLoyalty();

const submitting = ref(false);
const form = reactive({
  amount: 0,
  iban: '',
  cardNumber: '',
  accountHolderName: '',
});

watch(
  () => visible.value,
  (val) => {
    if (val) {
      form.amount = props.balance > 0 ? props.balance : 0;
      fetchWithdrawals();
    }
  },
);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

async function handleSubmit() {
  if (!form.amount || form.amount < 10000) {
    toast.add({
      severity: 'warn',
      summary: 'مبلغ نامعتبر',
      detail: 'حداقل مبلغ برداشت ۱۰٬۰۰۰ تومان است',
      life: 3000,
    });
    return;
  }

  if (form.amount > props.balance) {
    toast.add({
      severity: 'error',
      summary: 'موجودی ناکافی',
      detail: 'مبلغ درخواستی بیشتر از اعتبار در دسترس شماست',
      life: 3000,
    });
    return;
  }

  let ibanFormatted = form.iban.trim().toUpperCase();
  if (!ibanFormatted.startsWith('IR')) {
    ibanFormatted = `IR${ibanFormatted}`;
  }

  if (ibanFormatted.length < 26) {
    toast.add({
      severity: 'warn',
      summary: 'شماره شبا نامعتبر',
      detail: 'لطفاً شماره شبا ۲۴ رقمی را به درستی وارد کنید',
      life: 3000,
    });
    return;
  }

  if (!form.accountHolderName.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'اطلاعات ناقص',
      detail: 'لطفاً نام و نام خانوادگی صاحب حساب را وارد کنید',
      life: 3000,
    });
    return;
  }

  submitting.value = true;
  try {
    await requestWithdrawal({
      amount: form.amount,
      iban: ibanFormatted,
      cardNumber: form.cardNumber.trim() || undefined,
      accountHolderName: form.accountHolderName.trim(),
    });

    toast.add({
      severity: 'success',
      summary: 'درخواست ثبت شد',
      detail: 'درخواست تسویه با موفقیت ثبت شد و در صف بررسی قرار گرفت.',
      life: 4000,
    });

    visible.value = false;
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در ثبت درخواست',
      detail: err?.data?.message || err?.message || 'مشکلی پیش آمد.',
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

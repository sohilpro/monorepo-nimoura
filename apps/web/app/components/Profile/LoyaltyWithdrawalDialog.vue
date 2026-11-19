<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="درخواست تسویه و برداشت اعتبار"
    :style="{ width: '92vw', maxWidth: '480px' }"
    :closable="!submitting"
    dir="rtl"
  >
    <div class="space-y-4 pt-2 text-sm text-gray-700">
      <div class="rounded-xl bg-nimoura-primary/5 p-3 text-nimoura-text-700 border border-nimoura-primary/15">
        <div class="flex items-center justify-between">
          <span class="text-xs text-nimoura-text-500">اعتبار قابل برداشت:</span>
          <span class="font-modam text-base font-bold text-nimoura-primary">
            {{ numberFormat(balance) }} تومان
          </span>
        </div>
        <p class="mt-1 text-[11px] text-nimoura-text-400">
          حداقل مبلغ جهت ثبت درخواست تسویه ۱۰٬۰۰۰ تومان است.
        </p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          مبلغ درخواستی (تومان) <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model.number="form.amount"
            type="number"
            class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-nimoura-primary focus:outline-none"
            :max="balance"
            min="10000"
            placeholder="مثلاً ۵۰۰۰۰"
          />
          <button
            type="button"
            class="shrink-0 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
            @click="form.amount = balance"
          >
            حداکثر
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          شماره شبا (با IR یا بدون آن) <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.iban"
          type="text"
          dir="ltr"
          class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-nimoura-primary focus:outline-none"
          placeholder="IR120000000000000000000000"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          نام و نام خانوادگی صاحب حساب <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.accountHolderName"
          type="text"
          class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-nimoura-primary focus:outline-none"
          placeholder="نام کامل صاحب حساب بانکی"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          شماره کارت (اختیاری)
        </label>
        <input
          v-model="form.cardNumber"
          type="text"
          dir="ltr"
          class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-nimoura-primary focus:outline-none"
          placeholder="۶۰۳۷-xxxx-xxxx-xxxx"
        />
      </div>

      <!-- درخواست‌های قبلی -->
      <div v-if="withdrawals && withdrawals.length > 0" class="border-t pt-3">
        <p class="text-xs font-semibold text-gray-600 mb-2">درخواست‌های قبلی شما:</p>
        <div class="max-h-36 overflow-y-auto space-y-1.5 text-xs">
          <div
            v-for="w in withdrawals.slice(0, 5)"
            :key="w.id"
            class="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 border border-gray-100"
          >
            <div>
              <span class="font-modam font-semibold text-gray-800">{{ numberFormat(w.amount) }} ت</span>
              <span class="text-[10px] text-gray-400 ms-1.5">{{ formatDate(w.createdAt) }}</span>
            </div>
            <div>
              <span
                v-if="w.status === 'PENDING'"
                class="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-medium border border-amber-200"
              >
                در انتظار بررسی
              </span>
              <span
                v-else-if="w.status === 'APPROVED'"
                class="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-medium border border-emerald-200"
              >
                واریز شد
              </span>
              <span
                v-else
                class="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-medium border border-rose-200"
              >
                رد شده
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          label="انصراف"
          class="p-button-text p-button-sm text-gray-600"
          :disabled="submitting"
          @click="visible = false"
        />
        <Button
          type="button"
          label="ثبت درخواست تسویه"
          icon="pi pi-check"
          class="p-button-sm !bg-nimoura-primary !border-nimoura-primary text-white"
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

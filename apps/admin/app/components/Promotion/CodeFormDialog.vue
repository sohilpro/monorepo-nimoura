<script setup lang="ts">
import type { PromoCodeFormState } from '~~/server/types/promo-code';
import { DiscountType } from '~~/server/types/promo-code';

const props = defineProps<{
  visible: boolean;
  promoCodeId: string | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  saved: [];
}>();

const toast = useAppToast();
const { createPromoCode, updatePromoCode, generateCode } = usePromoCodes();

const saving = ref(false);
const generating = ref(false);

const emptyForm = (): PromoCodeFormState => ({
  code: '',
  description: '',
  discountType: DiscountType.PERCENTAGE,
  discountValue: null,
  maxDiscountAmount: null,
  minOrderAmount: null,
  usageLimit: null,
  usageLimitPerUser: 1,
  startDate: new Date(),
  endDate: null,
  isActive: true,
  firstOrderOnly: false,
});

const form = ref<PromoCodeFormState>(emptyForm());
const errors = ref<Record<string, string>>({});

const isEdit = computed(() => !!props.promoCodeId);
const discountOptions = [
  { label: 'درصدی', value: DiscountType.PERCENTAGE },
  { label: 'مبلغ ثابت', value: DiscountType.FIXED_AMOUNT },
];

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    errors.value = {};
    if (props.promoCodeId) {
      const data = await $fetch(`/api/promo-codes/${props.promoCodeId}`);
      form.value = {
        id: data.id,
        code: data.code,
        description: data.description ?? '',
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        firstOrderOnly: data.firstOrderOnly,
      };
    } else {
      form.value = emptyForm();
    }
  },
);

async function handleGenerateCode() {
  generating.value = true;
  try {
    form.value.code = await generateCode();
  } catch {
    toast.add({ severity: 'error', summary: 'تولید کد ناموفق بود', life: 3000 });
  } finally {
    generating.value = false;
  }
}

function validate(): boolean {
  const e: Record<string, string> = {};
  if (!form.value.code.trim()) e.code = 'وارد کردن کد الزامی است';
  if (!form.value.discountValue || form.value.discountValue <= 0)
    e.discountValue = 'مقدار تخفیف باید بزرگ‌تر از صفر باشد';
  if (form.value.discountType === DiscountType.PERCENTAGE && (form.value.discountValue ?? 0) > 100)
    e.discountValue = 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد';
  if (!form.value.startDate) e.startDate = 'تاریخ شروع الزامی است';
  if (form.value.endDate && form.value.startDate && form.value.endDate <= form.value.startDate)
    e.endDate = 'تاریخ پایان باید بعد از تاریخ شروع باشد';
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;
  saving.value = true;
  try {
    if (isEdit.value && props.promoCodeId) {
      await updatePromoCode(props.promoCodeId, form.value);
      toast.add({ severity: 'success', summary: 'کد تخفیف به‌روزرسانی شد', life: 2500 });
    } else {
      await createPromoCode(form.value);
      toast.add({ severity: 'success', summary: 'کد تخفیف ایجاد شد', life: 2500 });
    }
    emit('saved');
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: e?.data?.statusMessage ?? 'ذخیره‌سازی ناموفق بود',
      life: 4000,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    modal
    :header="isEdit ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'"
    :style="{ width: '32rem' }"
    dir="rtl"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">کد تخفیف</label>
        <div class="flex gap-2">
          <InputText
            v-model="form.code"
            placeholder="SUMMER25"
            class="flex-1 font-mono uppercase"
            :invalid="!!errors.code"
          />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            :loading="generating"
            @click="handleGenerateCode"
          />
        </div>
        <small v-if="errors.code" class="text-red-500">{{ errors.code }}</small>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">توضیحات (اختیاری)</label>
        <Textarea v-model="form.description" rows="2" class="w-full" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">نوع تخفیف</label>
          <SelectButton
            v-model="form.discountType"
            :options="discountOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            مقدار تخفیف {{ form.discountType === 'percentage' ? '(٪)' : '(تومان)' }}
          </label>
          <InputNumber
            v-model="form.discountValue"
            class="w-full"
            :invalid="!!errors.discountValue"
            :max="form.discountType === 'percentage' ? 100 : undefined"
          />
          <small v-if="errors.discountValue" class="text-red-500">{{ errors.discountValue }}</small>
        </div>
      </div>

      <div v-if="form.discountType === 'percentage'">
        <label class="block text-sm font-medium text-slate-700 mb-1">سقف مبلغ تخفیف (تومان، اختیاری)</label>
        <InputNumber v-model="form.maxDiscountAmount" class="w-full" placeholder="بدون سقف" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">حداقل مبلغ سفارش (تومان)</label>
          <InputNumber v-model="form.minOrderAmount" class="w-full" placeholder="بدون محدودیت" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">سقف استفاده کل</label>
          <InputNumber v-model="form.usageLimit" class="w-full" placeholder="نامحدود" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">تاریخ شروع</label>
          <DatePicker v-model="form.startDate" show-time class="w-full" :invalid="!!errors.startDate" />
          <small v-if="errors.startDate" class="text-red-500">{{ errors.startDate }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">تاریخ پایان (اختیاری)</label>
          <DatePicker v-model="form.endDate" show-time class="w-full" :invalid="!!errors.endDate" />
          <small v-if="errors.endDate" class="text-red-500">{{ errors.endDate }}</small>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-slate-700">فقط برای اولین سفارش کاربر</label>
        <ToggleSwitch v-model="form.firstOrderOnly" />
      </div>

      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-slate-700">فعال باشد</label>
        <ToggleSwitch v-model="form.isActive" />
      </div>
    </div>

    <template #footer>
      <Button label="انصراف" severity="secondary" text @click="emit('update:visible', false)" />
      <Button label="ذخیره" :loading="saving" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<template>
  <form @submit.prevent="onSubmit" id="promo-form" class="space-y-8">
    <CommonComponentCard title="اطلاعات تخفیف">
      <CommonCustomInput
        v-model="model.title"
        label="عنوان"
        placeholder="تخفیف تابستانه"
      />
      <CommonCustomInput
        v-model="model.promoCode"
        label="کد"
        placeholder="OFF20"
      />

      <div class="flex items-center gap-5">
        <DatePicker
          v-model="model.startDate"
          label="شروع"
          class="w-full"
          placeholder="YYYY/MM/DD"
          format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          display-format="jYYYY/jMM/jDD"
        />
        <DatePicker
          v-model="model.endDate"
          label="پایان"
          class="w-full"
          placeholder="YYYY/MM/DD"
          format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          display-format="jYYYY/jMM/jDD"
        />
      </div>

      <CommonSelectInput
        v-model="model.type"
        :options="[
          { name: 'درصدی', id: 'PERCENTAGE' },
          { name: 'ثابت', id: 'FIXED' },
        ]"
        label="نوع تخفیف"
        placeholder="جستجو در تایپ ها..."
      />

      <CommonFormattedNumberInput v-model="model.amount" label="میزان تخفیف به عدد" />
      <CommonTextArea
        v-model="model.description"
        label="توضیحات"
        placeholder="این تخفیف فقط برای محصولات منتخب تابستانی اعمال می‌شود."
      />
    </CommonComponentCard>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any;
  loading?: boolean;
  onSubmit: () => void;
}>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

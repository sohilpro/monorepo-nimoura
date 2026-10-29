<template>
  <form @submit.prevent="onSubmit" id="customer-form" class="space-y-8">
    <CommonComponentCard title="اطلاعات کاربر">
      <CommonCustomInput v-model="model.mobile" label="موبایل" />

      <CommonCustomInput v-model="model.first_name" label="نام" />

      <CommonCustomInput v-model="model.last_name" label="نام خانوادگی" />

      <CommonCustomInput v-model="model.email" label="ایمیل" />

      <CommonSelectInput
        v-model="model.role"
        :options="[
          { name: 'مالک', id: 'OWNER' },
          { name: 'ادمین', id: 'ADMIN' },
          { name: 'کاربر', id: 'USER' },
        ]"
        label="نقش"
        placeholder="جستجو در نقش ها..."
      />

      <CommonCustomInput v-model="model.identity_card" label="کد ملی" />
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

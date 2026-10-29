<!-- components/Brand/Form.vue -->
<template>
  <form @submit.prevent="$emit('submit')" id="brand-form" class="space-y-8">
    <div class="flex gap-5">
      <main class="flex flex-col gap-5 w-full">
        <CommonComponentCard title="اطلاعات اصلی برند">
          <CommonCustomInput
            v-model="model.name"
            label="نام / عنوان برند"
            placeholder="مثلا: یو هلث (You Health)"
          />
          <CommonCustomInput
            v-model="model.slug"
            label="اسلاگ"
            placeholder="loveral"
          />

          <!-- آپلودر لوگو با استفاده از آپلودر سراسری و انام بک‌اند -->
          <UtilsFileUploader
            label="لوگوی برند"
            name="logo"
            :multiple="false"
            ownerType="brand_logo"
            v-model="model.logo"
            :existing="initialLogoUrl ? [{ url: initialLogoUrl }] : []"
            @remove-existing="() => emit('remove-logo')"
          />

          <!-- توضیحات برند -->
          <CommonTextArea
            v-model="model.description"
            label="توضیحات برند"
            placeholder="توضیحاتی درباره تاریخچه یا ویژگی‌های این برند..."
            :rows="4"
          />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">ساب‌برندها (زیرمجموعه‌ها)</label>
            <CommonTagInput
              v-model="model.subBrands"
              placeholder="ساب‌برند را وارد کنید و اینتر بزنید"
            />
          </div>
        </CommonComponentCard>
      </main>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    name: string;
    slug: string;
    logo: string | null;
    description: string;
    subBrands: string[];
  };
  initialLogoUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: typeof props.modelValue): void;
  (e: "submit"): void;
  (e: "remove-logo"): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
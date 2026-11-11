<template>
  <form @submit.prevent="onSubmit" id="comments-form" class="space-y-8">
    <CommonComponentCard title="اطلاعات دیدگاه">
      <CommonCustomInput v-model="model.subject" label="عنوان" />
      <CommonTextArea v-model="model.description" label="عنوان" />

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="approve"
          class="bg-emerald-600 text-white flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition"
        >
          تایید
        </button>
        <button
          type="button"
          @click="reject"
          class="bg-rose-600 text-white flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-rose-700 transition"
        >
          رد
        </button>
      </div>
    </CommonComponentCard>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any;
  loading?: boolean;
  onSubmit: () => void;
}>();
const route = useRoute();
const id = route.params.slug;

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
const { isLoading } = useLoading();
const toast = useAppToast();

async function approve() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/approve`, {
      method: "PATCH",
      query: { id },
    });

    toast.info(data?.data?.message || "دیدگاه با موفقیت تایید شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || "خطا در تایید دیدگاه");
  } finally {
    isLoading.value = false;
  }
}

async function reject() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/reject`, {
      method: "PATCH",
      query: { id },
    });

    toast.info(data?.data?.message || "دیدگاه با موفقیت رد شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || "خطا در رد دیدگاه");
  } finally {
    isLoading.value = false;
  }
}
</script>

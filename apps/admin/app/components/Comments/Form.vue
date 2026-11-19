<template>
  <form @submit.prevent="onSubmit" id="comments-form" class="space-y-6">
    <!-- Comment Context & Metadata Card -->
    <CommonComponentCard v-if="comment" title="مشخصات دیدگاه و کاربر">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm pb-4 border-b border-gray-100">
        <div>
          <span class="text-gray-400 block mb-1">محصول:</span>
          <span class="font-semibold text-gray-800">{{ comment?.product?.title || '—' }}</span>
        </div>

        <div>
          <span class="text-gray-400 block mb-1">کاربر:</span>
          <span class="font-semibold text-gray-800">
            {{ userDisplayName }}
          </span>
        </div>

        <div>
          <span class="text-gray-400 block mb-1">امتیاز:</span>
          <span class="font-semibold text-amber-500">
            {{ comment?.rating ? `${comment.rating} از ۵ ⭐` : '—' }}
          </span>
        </div>

        <div>
          <span class="text-gray-400 block mb-1">وضعیت:</span>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              statusBadge.badgeClass
            ]"
          >
            {{ statusBadge.text }}
          </span>
        </div>
      </div>

      <!-- User uploaded images if any -->
      <div v-if="comment?.images?.length" class="pt-4">
        <span class="text-xs text-gray-400 block mb-2">تصاویر ارسالی کاربر:</span>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="(img, idx) in comment.images"
            :key="idx"
            :href="img"
            target="_blank"
            class="h-20 w-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition"
          >
            <img :src="img" class="h-full w-full object-cover" alt="تصویر کاربر" />
          </a>
        </div>
      </div>
    </CommonComponentCard>

    <!-- Comment Content Card -->
    <CommonComponentCard title="متن دیدگاه">
      <CommonCustomInput v-model="model.subject" label="عنوان دیدگاه" />
      <CommonTextArea v-model="model.description" label="متن دیدگاه" />

      <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          :disabled="loading"
          @click="approve"
          class="bg-emerald-600 text-white flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
        >
          <i class="pi pi-check"></i>
          تایید دیدگاه
        </button>

        <button
          type="button"
          :disabled="loading"
          @click="reject"
          class="bg-rose-600 text-white flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
        >
          <i class="pi pi-times"></i>
          رد دیدگاه
        </button>
      </div>
    </CommonComponentCard>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any;
  comment?: any;
  loading?: boolean;
  onSubmit: () => void;
}>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const route = useRoute();
const id = (route.params.slug || props.comment?.id) as string;

const { isLoading } = useLoading();
const toast = useAppToast();

const userDisplayName = computed(() => {
  const u = props.comment?.user;
  if (!u) return "—";
  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return name ? `${name} (${u.mobile || "—"})` : u.mobile || "—";
});

const statusBadge = computed(() => {
  if (props.comment?.isApproved) {
    return { text: "تایید شده", badgeClass: "bg-emerald-100 text-emerald-800" };
  }
  if (props.comment?.isRejected) {
    return { text: "رد شده", badgeClass: "bg-rose-100 text-rose-800" };
  }
  return { text: "در انتظار بررسی", badgeClass: "bg-amber-100 text-amber-800" };
});

async function approve() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/${id}/approve`, {
      method: "PATCH",
    });

    toast.info(data?.data?.message || data?.message || "دیدگاه با موفقیت تایید شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || error?.data?.message || "خطا در تایید دیدگاه");
  } finally {
    isLoading.value = false;
  }
}

async function reject() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/${id}/reject`, {
      method: "PATCH",
    });

    toast.info(data?.data?.message || data?.message || "دیدگاه با موفقیت رد شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || error?.data?.message || "خطا در رد دیدگاه");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دیدگاه کاربران', href: '/comments' },
        { label: 'ویرایش دیدگاه', href: '' },
      ]"
      title="ویرایش دیدگاه"
      subtitle="بررسی و مدیریت دیدگاه کاربر"
      publish-label="ذخیره تغییرات"
      discard-label="انصراف"
      form="comments-form"
      @discard="() => navigateTo('/comments')"
    />

    <div class="flex flex-col lg:flex-row gap-6">
      <main class="flex flex-col gap-5 flex-1">
        <CommentsForm
          v-model="body"
          :comment="commentItem"
          :loading="isLoading"
          :onSubmit="submitForm"
        />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug as string;
const { isLoading } = useLoading();
const toast = useAppToast();

const { data: comments }: any = await useFetch(`/api/comments/${id}`);

const commentItem = computed(() => comments.value?.data || comments.value || {});

const body = reactive({
  subject: commentItem.value.subject || "",
  description: commentItem.value.description || "",
});

watch(commentItem, (val) => {
  if (val) {
    body.subject = val.subject || "";
    body.description = val.description || "";
  }
});

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/${id}`, {
      method: "PUT",
      body,
    });

    toast.info(data?.data?.message || data?.message || "دیدگاه با موفقیت ویرایش شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || error?.data?.message || "خطا در آپدیت دیدگاه");
  } finally {
    isLoading.value = false;
  }
}
</script>

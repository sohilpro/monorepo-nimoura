<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دیدگاه کاربران', href: '/brand' },
        { label: 'ویرایش دیدگاه', href: '' },
      ]"
      title="ویرایش دیدگاه"
      subtitle="آپدیت دیدگاه"
      publish-label="ویرایش دیدگاه"
      discard-label="انصراف"
      form="comments-form"
      @discard="() => navigateTo('/comments')"
    />

    <div class="flex gap-5">
      <main class="flex flex-col gap-5 basis-4/6">
        <CommentsForm
          v-model="body"
          :loading="isLoading"
          :onSubmit="submitForm"
        />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.slug;
const { isLoading } = useLoading();
const toast = useAppToast();

const { data: comments }: any = await useFetch(`/api/comments/getOne`, {
  query: { id },
});

const body = reactive({
  subject: comments.value.data.subject || "",
  description: comments.value.data.description || "",
});

async function submitForm() {
  isLoading.value = true;
  try {
    const data: any = await $fetch(`/api/comments/update`, {
      method: "PUT",
      body,
      query: { id },
    });

    toast.info(data?.data?.message || "دیدگاه با موفقیت ویرایش شد");
    navigateTo("/comments");
  } catch (error: any) {
    toast.error(error?.data?.data?.message || "خطا در آپدیت دیدگاه");
  } finally {
    isLoading.value = false;
  }
}
</script>

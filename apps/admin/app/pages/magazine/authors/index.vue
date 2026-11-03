<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type { Author } from '~~/server/types/magazine';
import type { AuthorFormPayload } from '~/composables/useAdminAuthors';

const confirm = useConfirm();
const toast = useAppToast();
const { data: authors, pending, refresh } = useAdminAuthorsList();

const dialogVisible = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);
const uploadingAvatar = ref(false);

const form = reactive<AuthorFormPayload>({
  name: '',
  avatar: '',
  jobTitle: '',
  bio: '',
  isActive: true,
  socialLinks: { instagram: '', telegram: '' },
});

function openCreate() {
  editingId.value = null;
  Object.assign(form, { name: '', avatar: '', jobTitle: '', bio: '', isActive: true, socialLinks: { instagram: '', telegram: '' } });
  dialogVisible.value = true;
}

function openEdit(author: Author) {
  editingId.value = author.id;
  Object.assign(form, {
    name: author.name,
    avatar: author.avatar ?? '',
    jobTitle: author.jobTitle ?? '',
    bio: author.bio ?? '',
    isActive: (author as any).isActive ?? true,
    socialLinks: { instagram: author.socialLinks?.instagram ?? '', telegram: author.socialLinks?.telegram ?? '' },
  });
  dialogVisible.value = true;
}

async function onAvatarSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingAvatar.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await $fetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: formData });
    form.avatar = res.url;
  } catch {
    toast.add({ severity: 'error', summary: 'آپلود تصویر ناموفق بود', life: 3000 });
  } finally {
    uploadingAvatar.value = false;
  }
}

async function handleSubmit() {
  if (!form.name.trim()) {
    toast.add({ severity: 'warn', summary: 'نام نویسنده الزامی است', life: 3000 });
    return;
  }
  submitting.value = true;
  try {
    if (editingId.value) {
      await updateAuthor(editingId.value, form);
    } else {
      await createAuthor(form);
    }
    toast.add({ severity: 'success', summary: 'ذخیره شد', life: 2500 });
    dialogVisible.value = false;
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'خطا', detail: e?.data?.message, life: 4000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(author: Author) {
  confirm.require({
    message: `نویسنده «${author.name}» حذف شود؟ اگر مقاله‌ای به این نویسنده وصل باشد، حذف با خطا مواجه می‌شود — بهتر است به‌جای حذف، غیرفعالش کنید.`,
    header: 'تایید حذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      try {
        await deleteAuthor(author.id);
        toast.add({ severity: 'success', summary: 'حذف شد', life: 2500 });
        refresh();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'خطا در حذف', detail: e?.data?.message, life: 4000 });
      }
    },
  });
}
</script>

<template>
  <div>
    <ConfirmDialog />

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">نویسندگان مجله</h1>
      <Button label="نویسنده جدید" icon="pi pi-plus" class="!bg-nimoura-primary !border-nimoura-primary" @click="openCreate" />
    </div>

    <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <DataTable :value="authors?.data ?? []" :loading="pending" striped-rows data-key="id">
        <Column header="نویسنده">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar :image="data.avatar" :label="!data.avatar ? data.name?.[0] : undefined" shape="circle" />
              <div>
                <p class="font-bold text-gray-800">{{ data.name }}</p>
                <p class="text-xs text-gray-400">{{ data.jobTitle }}</p>
              </div>
            </div>
          </template>
        </Column>
        <Column header="وضعیت" style="width: 110px">
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'فعال' : 'غیرفعال'" :severity="data.isActive ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="عملیات" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="py-10 text-center text-gray-400">نویسنده‌ای ثبت نشده.</div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? 'ویرایش نویسنده' : 'نویسنده جدید'" class="w-full max-w-lg">
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <Avatar :image="form.avatar" :label="!form.avatar ? '?' : undefined" size="xlarge" shape="circle" />
          <label class="cursor-pointer text-sm text-nimoura-primary hover:underline">
            {{ uploadingAvatar ? 'در حال آپلود...' : 'انتخاب تصویر پروفایل' }}
            <input type="file" accept="image/*" class="hidden" @change="onAvatarSelected" />
          </label>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">نام و نام خانوادگی</label>
          <InputText v-model="form.name" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">سمت (مثلا: متخصص پوست و مو)</label>
          <InputText v-model="form.jobTitle" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">بیوگرافی کوتاه</label>
          <Textarea v-model="form.bio" class="w-full" rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">اینستاگرام</label>
            <InputText v-model="form.socialLinks!.instagram" class="w-full" placeholder="آدرس پروفایل" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">تلگرام</label>
            <InputText v-model="form.socialLinks!.telegram" class="w-full" placeholder="آدرس کانال/پروفایل" />
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded accent-nimoura-primary" />
          نویسنده فعال است (در سایت نمایش داده شود)
        </label>
      </div>

      <template #footer>
        <Button label="انصراف" text severity="secondary" @click="dialogVisible = false" />
        <Button :label="submitting ? 'در حال ذخیره...' : 'ذخیره'" :disabled="submitting" class="!bg-nimoura-primary !border-nimoura-primary" @click="handleSubmit" />
      </template>
    </Dialog>
  </div>
</template>
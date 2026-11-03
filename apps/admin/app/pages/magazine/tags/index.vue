<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type { Tag } from '~~/server/types/magazine';

const confirm = useConfirm();
const toast = useAppToast();
const { data: tags, pending, refresh } = useAdminTagsList();

const dialogVisible = ref(false);
const editingTag = ref<Tag | null>(null);
const name = ref('');
const submitting = ref(false);

function openCreate() {
  editingTag.value = null;
  name.value = '';
  dialogVisible.value = true;
}

function openEdit(tag: Tag) {
  editingTag.value = tag;
  name.value = tag.name;
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!name.value.trim()) return;
  submitting.value = true;
  try {
    if (editingTag.value) {
      await updateTag(editingTag.value.id, name.value);
    } else {
      await createTag(name.value);
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

function confirmDelete(tag: Tag) {
  confirm.require({
    message: `برچسب «${tag.name}» حذف شود؟`,
    header: 'تایید حذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      try {
        await deleteTag(tag.id);
        toast.add({ severity: 'success', summary: 'حذف شد', life: 2500 });
        refresh();
      } catch {
        toast.add({ severity: 'error', summary: 'خطا در حذف', life: 3000 });
      }
    },
  });
}
</script>

<template>
  <div>
    <ConfirmDialog />

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">برچسب‌های مجله</h1>
      <Button label="برچسب جدید" icon="pi pi-plus" class="!bg-nimoura-primary !border-nimoura-primary" @click="openCreate" />
    </div>

    <div v-if="pending" class="text-gray-400">در حال بارگذاری...</div>
    <div v-else class="flex flex-wrap gap-3">
      <div
        v-for="tag in tags?.data"
        :key="tag.id"
        class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-gray-100"
      >
        <span class="text-gray-700">{{ tag.name }}</span>
        <button class="text-gray-400 hover:text-nimoura-primary" @click="openEdit(tag)">
          <i class="pi pi-pencil text-xs" />
        </button>
        <button class="text-gray-400 hover:text-red-500" @click="confirmDelete(tag)">
          <i class="pi pi-times text-xs" />
        </button>
      </div>
      <p v-if="!tags?.length" class="text-gray-400">برچسبی ثبت نشده.</p>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="editingTag ? 'ویرایش برچسب' : 'برچسب جدید'" class="w-full max-w-sm">
      <InputText v-model="name" class="w-full" placeholder="مثلا: ضدآفتاب" @keyup.enter="handleSubmit" />
      <template #footer>
        <Button label="انصراف" text severity="secondary" @click="dialogVisible = false" />
        <Button :label="submitting ? 'در حال ذخیره...' : 'ذخیره'" :disabled="submitting" class="!bg-nimoura-primary !border-nimoura-primary" @click="handleSubmit" />
      </template>
    </Dialog>
  </div>
</template>
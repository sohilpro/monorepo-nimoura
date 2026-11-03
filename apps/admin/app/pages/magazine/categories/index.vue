<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type { Category } from '~~/server/types/magazine';
import type { CategoryFormPayload } from '~/composables/useAdminCategories';

const confirm = useConfirm();
const toast = useAppToast();
const { data: categories, pending, refresh } = useAdminCategoriesList();

const dialogVisible = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);

const form = reactive<CategoryFormPayload>({
  name: '',
  description: '',
  icon: '',
  parentId: null,
  sortOrder: 0,
});

// دسته‌هایی که می‌توان به‌عنوان والد انتخاب کرد (خودش را از لیست حذف می‌کنیم)
const parentOptions = computed(() => {
  // بررسی می‌کنیم که categories.value دقیقاً آرایه باشد، یا اگر آبجکت پِی‌جینیشن است به آرایه آیتم‌ها دسترسی پیدا کنیم
  const list = Array.isArray(categories.value) 
    ? categories.value 
    : (categories.value as any)?.items ?? [];

  return list.filter((c: any) => c.id !== editingId.value);
});

function openCreate() {
  editingId.value = null;
  Object.assign(form, { name: '', description: '', icon: '', parentId: null, sortOrder: 0 });
  dialogVisible.value = true;
}

function openEdit(cat: Category) {
  editingId.value = cat.id;
  Object.assign(form, {
    name: cat.name,
    description: cat.description ?? '',
    icon: cat.icon ?? '',
    parentId: (cat as any).parent?.id ?? null,
    sortOrder: (cat as any).sortOrder ?? 0,
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  if (!form.name.trim()) {
    toast.add({ severity: 'warn', summary: 'نام دسته‌بندی الزامی است', life: 3000 });
    return;
  }
  submitting.value = true;
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, form);
      toast.add({ severity: 'success', summary: 'ویرایش شد', life: 2500 });
    } else {
      await createCategory(form);
      toast.add({ severity: 'success', summary: 'دسته‌بندی ایجاد شد', life: 2500 });
    }
    dialogVisible.value = false;
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'خطا', detail: e?.data?.message || 'عملیات ناموفق بود', life: 4000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(cat: Category) {
  confirm.require({
    message: `دسته‌بندی «${cat.name}» حذف شود؟ مقالات این دسته حذف نمی‌شوند اما بدون دسته می‌مانند.`,
    header: 'تایید حذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      try {
        await deleteCategory(cat.id);
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
      <h1 class="text-xl font-bold text-gray-800">دسته‌بندی‌های مجله</h1>
      <Button label="دسته‌بندی جدید" icon="pi pi-plus" class="!bg-nimoura-primary !border-nimoura-primary" @click="openCreate" />
    </div>

    <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <DataTable :value="categories?.data ?? []" :loading="pending" striped-rows data-key="id">
        <Column field="name" header="نام">
          <template #body="{ data }">
            <span class="font-bold text-gray-800">{{ data.name }}</span>
            <span v-if="data.parent" class="mr-2 text-xs text-gray-400"> — زیرمجموعه‌ی {{ data.parent.name }}</span>
          </template>
        </Column>
        <Column field="slug" header="Slug" style="width: 200px" />
        <Column header="عملیات" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="py-10 text-center text-gray-400">دسته‌بندی‌ای ثبت نشده.</div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'" class="w-full max-w-md">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-xs text-gray-500">نام دسته‌بندی</label>
          <InputText v-model="form.name" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">توضیح کوتاه</label>
          <Textarea v-model="form.description" class="w-full" rows="2" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">دسته والد (اختیاری)</label>
          <Select
            v-model="form.parentId"
            :options="parentOptions"
            option-label="name"
            option-value="id"
            show-clear
            filter
            placeholder="بدون والد (دسته اصلی)"
            class="w-full"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">آیکون (کلاس PrimeIcons، مثلا pi-heart)</label>
          <InputText v-model="form.icon" class="w-full" placeholder="pi-heart" />
        </div>
      </div>

      <template #footer>
        <Button label="انصراف" text severity="secondary" @click="dialogVisible = false" />
        <Button
          :label="submitting ? 'در حال ذخیره...' : 'ذخیره'"
          :disabled="submitting"
          class="!bg-nimoura-primary !border-nimoura-primary"
          @click="handleSubmit"
        />
      </template>
    </Dialog>
  </div>
</template>
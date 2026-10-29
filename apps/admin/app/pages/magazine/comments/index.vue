<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();
const toast = useToast();

const query = ref<{ page: number; limit: number; status: '' | 'pending' | 'approved' | 'rejected' }>({
  page: 1,
  limit: 15,
  status: 'pending',
});

const { data: comments, pending, refresh } = useAdminCommentsList(query);

const statusTabs = [
  { label: 'در انتظار تایید', value: 'pending' },
  { label: 'تاییدشده', value: 'approved' },
  { label: 'ردشده', value: 'rejected' },
  { label: 'همه', value: '' },
];

function setStatus(value: typeof query.value.status) {
  query.value = { ...query.value, status: value, page: 1 };
}

function onPage(event: { page: number; rows: number }) {
  query.value = { ...query.value, page: event.page + 1, limit: event.rows };
}

async function approve(id: string) {
  try {
    await moderateComment(id, 'approved');
    toast.add({ severity: 'success', summary: 'نظر تایید شد', life: 2500 });
    refresh();
  } catch {
    toast.add({ severity: 'error', summary: 'خطا در تایید نظر', life: 3000 });
  }
}

async function reject(id: string) {
  try {
    await moderateComment(id, 'rejected');
    toast.add({ severity: 'success', summary: 'نظر رد شد', life: 2500 });
    refresh();
  } catch {
    toast.add({ severity: 'error', summary: 'خطا در رد نظر', life: 3000 });
  }
}

function confirmDelete(id: string) {
  confirm.require({
    message: 'این نظر برای همیشه حذف می‌شود. مطمئن هستید؟',
    header: 'تایید حذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      try {
        await deleteComment(id);
        toast.add({ severity: 'success', summary: 'حذف شد', life: 2500 });
        refresh();
      } catch {
        toast.add({ severity: 'error', summary: 'خطا در حذف', life: 3000 });
      }
    },
  });
}

const statusMeta: Record<string, { label: string; severity: string }> = {
  pending: { label: 'در انتظار', severity: 'warn' },
  approved: { label: 'تاییدشده', severity: 'success' },
  rejected: { label: 'ردشده', severity: 'danger' },
};
</script>

<template>
  <div>
    <Toast />
    <ConfirmDialog />

    <h1 class="mb-6 text-xl font-bold text-gray-800">مدیریت نظرات مقالات</h1>

    <div class="mb-5 flex gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="rounded-full px-4 py-1.5 text-sm transition"
        :class="query.status === tab.value ? 'bg-nimoura-primary text-white' : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50'"
        @click="setStatus(tab.value as any)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <DataTable :value="comments?.items ?? []" :loading="pending" striped-rows data-key="id">
        <Column header="نظر">
          <template #body="{ data }">
            <div class="max-w-md">
              <p class="text-sm text-gray-700">{{ data.content }}</p>
              <p class="mt-1 text-xs text-gray-400">
                {{ data.name }} · {{ data.email }}
              </p>
            </div>
          </template>
        </Column>
        <Column header="مقاله" style="width: 220px">
          <template #body="{ data }">
            <NuxtLink :to="`/magazine/${data.article?.slug}`" target="_blank" class="text-sm text-nimoura-primary hover:underline">
              {{ data.article?.title }}
            </NuxtLink>
          </template>
        </Column>
        <Column header="وضعیت" style="width: 110px">
          <template #body="{ data }">
            <Tag :value="statusMeta[data.status]?.label" :severity="statusMeta[data.status]?.severity" />
          </template>
        </Column>
        <Column header="تاریخ" style="width: 130px">
          <template #body="{ data }">{{ new Date(data.createdAt).toLocaleDateString('fa-IR') }}</template>
        </Column>
        <Column header="عملیات" style="width: 160px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                v-if="data.status !== 'approved'"
                icon="pi pi-check"
                text
                rounded
                severity="success"
                v-tooltip.top="'تایید'"
                @click="approve(data.id)"
              />
              <Button
                v-if="data.status !== 'rejected'"
                icon="pi pi-times"
                text
                rounded
                severity="warn"
                v-tooltip.top="'رد کردن'"
                @click="reject(data.id)"
              />
              <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'حذف'" @click="confirmDelete(data.id)" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="py-10 text-center text-gray-400">نظری در این وضعیت پیدا نشد.</div>
        </template>
      </DataTable>

      <div v-if="comments?.meta && comments.meta.totalPages > 1" class="border-t border-gray-100 p-3">
        <Paginator
          :rows="comments.meta.itemsPerPage"
          :total-records="comments.meta.totalItems"
          :first="(comments.meta.currentPage - 1) * comments.meta.itemsPerPage"
          @page="onPage"
        />
      </div>
    </div>
  </div>
</template>
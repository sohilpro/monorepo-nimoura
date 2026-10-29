<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const confirm = useConfirm();
const toast = useToast();

const query = ref({
  page: 1,
  limit: 10,
  search: '',
  // status: '' as '' | 'draft' | 'published' | 'archived',
});

const searchDebounced = ref('');
let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchDebounced, (v) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    query.value = { ...query.value, search: v, page: 1 };
  }, 400);
});

const { articles, pending, refresh } = useAdminArticleList(query);

const statusOptions = [
  { label: 'همه وضعیت‌ها', value: '' },
  { label: 'پیش‌نویس', value: 'draft' },
  { label: 'منتشرشده', value: 'published' },
  { label: 'بایگانی', value: 'archived' },
];

const statusMeta: Record<string, { label: string; severity: string }> = {
  draft: { label: 'پیش‌نویس', severity: 'warn' },
  published: { label: 'منتشرشده', severity: 'success' },
  archived: { label: 'بایگانی', severity: 'secondary' },
};

function onPage(event: { page: number; rows: number }) {
  query.value = { ...query.value, page: event.page + 1, limit: event.rows };
}

function confirmDelete(id: string, title: string) {
  confirm.require({
    message: `مقاله «${title}» برای همیشه حذف می‌شود. مطمئن هستید؟`,
    header: 'تایید حذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      try {
        await deleteArticle(id);
        toast.add({ severity: 'success', summary: 'حذف شد', detail: 'مقاله با موفقیت حذف شد', life: 3000 });
        refresh();
      } catch {
        toast.add({ severity: 'error', summary: 'خطا', detail: 'حذف مقاله ناموفق بود', life: 3000 });
      }
    },
  });
}
</script>

<template>
  <div>
    <ConfirmDialog />

    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-xl font-bold text-gray-800">مدیریت مقالات مجله</h1>
      <NuxtLink to="/magazine/articles/create">
        <Button label="مقاله جدید" icon="pi pi-plus" class="!bg-nimoura-500 !border-nimoura-500" />
      </NuxtLink>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <IconField class="flex-1 min-w-[220px]">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchDebounced" placeholder="جستجو در عنوان یا خلاصه..." class="w-full" />
      </IconField>

      <Select
        v-model="query.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        class="w-48"
        @change="query.page = 1"
      />
    </div>

    <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <DataTable
        :value="articles?.data.items ?? []"
        :loading="pending"
        striped-rows
        data-key="id"
      >
        <Column field="title" header="عنوان">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <img
                v-if="data.coverImage"
                :src="data.coverImage"
                class="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <p class="font-bold text-gray-800">{{ data.title }}</p>
                <p class="text-xs text-gray-400">{{ data.category?.name }} · {{ data.author?.name }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column field="status" header="وضعیت" style="width: 130px">
          <template #body="{ data }">
            <Tag :value="statusMeta[data.status]?.label" :severity="statusMeta[data.status]?.severity" />
          </template>
        </Column>

        <Column field="viewCount" header="بازدید" style="width: 100px">
          <template #body="{ data }">{{ data.viewCount.toLocaleString('fa-IR') }}</template>
        </Column>

        <Column field="updatedAt" header="آخرین ویرایش" style="width: 160px">
          <template #body="{ data }">
            {{ new Date(data.updatedAt).toLocaleDateString('fa-IR') }}
          </template>
        </Column>

        <Column header="عملیات" style="width: 140px">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <NuxtLink :to="`/magazine/articles/${data.id}`">
                <Button icon="pi pi-pencil" text rounded severity="secondary" />
              </NuxtLink>
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data.id, data.title)" />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="py-10 text-center text-gray-400">مقاله‌ای پیدا نشد.</div>
        </template>
      </DataTable>

      <div v-if="articles?.meta && articles.meta.totalPages > 1" class="border-t border-gray-100 p-3">
        <Paginator
          :rows="articles.meta.itemsPerPage"
          :total-records="articles.meta.totalItems"
          :first="(articles.meta.currentPage - 1) * articles.meta.itemsPerPage"
          @page="onPage"
        />
      </div>
    </div>
  </div>
</template>
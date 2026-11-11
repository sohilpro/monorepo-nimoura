<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import type { PromoCode } from '~~/server/types/promo-code';
import { DiscountType } from '~~/server/types/promo-code';


const { items, meta, loading, fetchList, deletePromoCode, toggleActive } = usePromoCodes();
const confirm = useConfirm();
const toast = useAppToast();

const search = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
const formDialogOpen = ref(false);
const editingId = ref<string | null>(null);

async function load() {
  await fetchList({
    page: meta.value.page,
    limit: meta.value.limit,
    search: search.value || undefined,
    isActive: statusFilter.value === 'all' ? undefined : statusFilter.value === 'active',
  });
}

onMounted(load);

let searchTimeout: ReturnType<typeof setTimeout>;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(load, 350);
});
watch(statusFilter, load);

function onPage(event: { page: number; rows: number }) {
  meta.value.page = event.page + 1;
  meta.value.limit = event.rows;
  load();
}

function openCreate() {
  editingId.value = null;
  formDialogOpen.value = true;
}

function openEdit(row: PromoCode) {
  editingId.value = row.id;
  formDialogOpen.value = true;
}

async function onToggle(row: PromoCode) {
  try {
    await toggleActive(row.id);
    toast.add({
      severity: 'success',
      summary: row.isActive ? 'کد تخفیف غیرفعال شد' : 'کد تخفیف فعال شد',
      life: 2500,
    });
    load();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'خطا', detail: e?.data?.statusMessage, life: 4000 });
  }
}

function confirmDelete(row: PromoCode) {
  confirm.require({
    message: `کد "${row.code}" برای همیشه حذف شود؟`,
    header: 'حذف کد تخفیف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deletePromoCode(row.id);
        toast.add({ severity: 'success', summary: 'کد تخفیف حذف شد', life: 2500 });
        load();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'خطا', detail: e?.data?.statusMessage, life: 4000 });
      }
    },
  });
}

function formatMoney(v: string | null) {
  if (!v) return '—';
  return `${Number(v).toLocaleString('fa-IR')} تومان`;
}

function discountLabel(row: PromoCode) {
  return row.discountType === DiscountType.PERCENTAGE
    ? `${Number(row.discountValue)}٪`
    : `${Number(row.discountValue).toLocaleString('fa-IR')} تومان`;
}

function onFormSaved() {
  formDialogOpen.value = false;
  load();
}
</script>

<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">کدهای تخفیف</h1>
        <p class="text-sm text-gray-500 mt-1">مدیریت کدهای تخفیف و پروموشن‌های فروشگاه</p>
      </div>
      <Button label="کد تخفیف جدید" icon="pi pi-plus" @click="openCreate" />
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <span class="p-input-icon-right flex-1">
        <i class="pi pi-search" />
        <InputText v-model="search" placeholder="جستجو در کد یا توضیحات..." class="w-full" />
      </span>
      <Select
        v-model="statusFilter"
        :options="[
          { label: 'همه', value: 'all' },
          { label: 'فعال', value: 'active' },
          { label: 'غیرفعال', value: 'inactive' },
        ]"
        option-label="label"
        option-value="value"
        class="w-full sm:w-48"
      />
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
      <DataTable
        :value="items"
        :loading="loading"
        :total-records="meta.total"
        :rows="meta.limit"
        :first="(meta.page - 1) * meta.limit"
        paginator
        lazy
        @page="onPage"
        striped-rows
        removable-sort
      >
        <template #empty>
          <div class="text-center py-10 text-gray-400">هیچ کد تخفیفی یافت نشد</div>
        </template>

        <Column field="code" header="کد">
          <template #body="{ data }">
            <span class="font-mono font-semibold text-gray-800">{{ data.code }}</span>
          </template>
        </Column>

        <Column header="تخفیف">
          <template #body="{ data }">
            <span class="font-medium">{{ discountLabel(data) }}</span>
          </template>
        </Column>

        <Column header="حداقل سفارش">
          <template #body="{ data }">{{ formatMoney(data.minOrderAmount) }}</template>
        </Column>

        <Column header="مصرف">
          <template #body="{ data }">
            {{ data.usedCount }}{{ data.usageLimit ? ` / ${data.usageLimit}` : '' }}
          </template>
        </Column>

        <Column header="وضعیت">
          <template #body="{ data }">
            <Tag :severity="data.isActive ? 'success' : 'secondary'" :value="data.isActive ? 'فعال' : 'غیرفعال'" />
          </template>
        </Column>

        <Column header="عملیات" style="width: 12rem">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <Button icon="pi pi-pencil" text rounded severity="secondary" @click="openEdit(data)" />
              <Button
                :icon="data.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'"
                text
                rounded
                severity="secondary"
                @click="onToggle(data)"
              />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <PromotionCodeFormDialog
      v-model:visible="formDialogOpen"
      :promo-code-id="editingId"
      @saved="onFormSaved"
    />

    <ConfirmDialog />
  </div>
</template>

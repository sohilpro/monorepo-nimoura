<template>
  <div class="address-root" dir="rtl">

    <!-- Header -->
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="panel-title">آدرس‌های من</h2>
        <p class="mt-1 text-xs font-vazir" style="color:var(--nt-400)">
          {{ addresses.length }} آدرس ثبت شده
        </p>
      </div>
      <Button
        label="آدرس جدید"
        icon="pi pi-plus"
        size="small"
        class="!rounded-2xl !text-sm !font-vazir !px-4 !py-2.5"
        style="background:linear-gradient(135deg,#b76e79,#9a5a64);border:none;box-shadow:0 4px 14px rgba(183,110,121,0.3)"
        @click="openCreate"
      />
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 2" :key="n" class="addr-card animate-pulse">
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gray-100 shrink-0" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 w-24 rounded-full bg-gray-100" />
            <div class="h-3 w-40 rounded-full bg-gray-100" />
            <div class="h-3 w-full rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <TransitionGroup name="addr-list" tag="div" class="space-y-3">
        <ProfileAddressCard
        v-for="addr in addresses" :key="addr.id"
        :address="addr" mode="manage"
        @edit="openEdit(addr)" @delete="handleDelete(addr)"
      />
      </TransitionGroup>

      <!-- Dashed add button -->
      <button type="button" class="addr-card-dashed w-full" @click="openCreate">
        <i class="pi pi-plus text-lg mb-1.5 block" style="color:var(--primary);opacity:.5" />
        <span class="text-sm font-medium font-vazir" style="color:var(--primary)">افزودن آدرس جدید</span>
      </button>
    </div>

    <!-- ══ Dialog ══ -->
    <ProfileAddressFormDialog v-model:visible="dialogOpen" :address="editingAddress" />

    <!-- Confirm delete -->
    <ConfirmDialog group="addr-del" class="nimora-confirm" />
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/composables/useAddresses'

const { addresses, loading, fetchAddresses, removeAddress } = useAddresses()
const confirm = useConfirm()
const toast = useToast()

const dialogOpen = ref(false)
const editingAddress = ref<Address | null>(null)

function openCreate() { editingAddress.value = null; dialogOpen.value = true }
function openEdit(addr: Address) { editingAddress.value = addr; dialogOpen.value = true }

function handleDelete(addr: Address) {
  confirm.require({
    group: 'addr-del',
    header: 'حذف آدرس',
    message: `آدرس «${addr.title}» حذف شود؟`,
    acceptLabel: 'بله، حذف کن',
    rejectLabel: 'انصراف',
    acceptProps: {
      style: 'background:#dc2626;border:none;border-radius:12px;font-family:Vazirmatn,sans-serif;font-size:.85rem;font-weight:600;padding:8px 18px;box-shadow:0 4px 12px rgba(220,38,38,0.25)',
    },
    rejectProps: {
      style: 'background:transparent;border:1.5px solid rgba(183,110,121,0.3);color:#9b9191;border-radius:12px;font-family:Vazirmatn,sans-serif;font-size:.85rem;padding:8px 18px',
    },
    accept: async () => {
      try {
        await removeAddress(addr.id)
        toast.add({ severity: 'info', summary: 'حذف شد', detail: 'آدرس با موفقیت حذف شد', life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: 'خطا', detail: 'حذف انجام نشد', life: 3000 })
      }
    },
  })
}

onMounted(() => fetchAddresses())
</script>
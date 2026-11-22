<template>
  <section dir="rtl" aria-label="آدرس‌های من">
    <!-- Header -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="relative pr-3 text-base font-bold text-nimoura-text-900">
          <span
            class="absolute right-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-nimoura-primary"
            aria-hidden="true"
          />
          آدرس‌های من
        </h2>
        <p class="mt-1 text-xs text-nimoura-text-400">
          {{ addresses.length }} آدرس ثبت شده
        </p>
      </div>
      <Button
        label="آدرس جدید"
        icon="pi pi-plus"
        class="!rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !py-2.5 !text-sm !font-semibold !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.25)] hover:!bg-nimoura-600"
        @click="openCreate"
      />
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-3" aria-busy="true">
      <div
        v-for="n in 2"
        :key="n"
        class="animate-pulse rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
      >
        <div class="flex gap-3">
          <div class="size-10 shrink-0 rounded-xl bg-nimoura-text-100" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 w-24 rounded-full bg-nimoura-text-100" />
            <div class="h-3 w-40 rounded-full bg-nimoura-text-100" />
            <div class="h-3 w-full rounded-full bg-nimoura-text-100" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- List -->
      <div v-if="addresses.length" class="space-y-3">
        <TransitionGroup name="addr-list" tag="div" class="space-y-3">
          <ProfileAddressCard
            v-for="addr in addresses"
            :key="addr.id"
            :address="addr"
            mode="manage"
            @edit="openEdit(addr)"
            @delete="handleDelete(addr)"
          />
        </TransitionGroup>

        <!-- Dashed add button -->
        <button
          type="button"
          class="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-nimoura-primary/30 bg-white/60 px-4 py-6 transition-colors hover:border-nimoura-primary/60 hover:bg-nimoura-primary/5"
          @click="openCreate"
        >
          <i class="pi pi-plus mb-1.5 block text-lg! text-nimoura-primary/50" aria-hidden="true" />
          <span class="text-sm font-medium text-nimoura-primary">افزودن آدرس جدید</span>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-nimoura-text-100 bg-white px-6 py-12 text-center"
      >
        <span
          class="mb-3 flex size-12 items-center justify-center rounded-full bg-nimoura-primary/10 text-nimoura-primary"
          aria-hidden="true"
        >
          <i class="pi pi-map-marker text-lg!" />
        </span>
        <p class="text-sm font-semibold text-nimoura-text-700">هنوز آدرسی ثبت نکرده‌ای</p>
        <p class="mt-1 text-xs text-nimoura-text-400">
          با افزودن آدرس، فرایند خرید سریعتر می‌شود.
        </p>
      </div>
    </template>

    <!-- ══ Dialog ══ -->
    <ProfileAddressFormDialog v-model:visible="dialogOpen" :address="editingAddress" />

    <!-- Confirm delete -->
    <ConfirmDialog
      group="addr-del"
      :pt="{
        root: {
          class: '!w-[min(420px,92vw)] !overflow-hidden !rounded-2xl !border !border-nimoura-text-100 !bg-white !font-vazir',
        },
        header: {
          class: '!border-b !border-nimoura-text-100 !bg-nimoura-base/70 !px-6 !pb-4 !pt-5',
        },
        title: { class: '!text-sm !font-bold !text-nimoura-text-900' },
        content: {
          class: '!bg-white !px-6 !py-5 !text-sm !leading-6 !text-nimoura-text-600',
        },
        footer: {
          class: '!gap-2 !border-t !border-nimoura-text-100 !bg-white !px-6 !pb-5 !pt-4',
        },
        closeButton: { class: '!text-nimoura-text-400' },
      }"
    />
  </section>
</template>

<script setup lang="ts">
import type { Address } from '~/composables/useAddresses'

const { addresses, loading, fetchAddresses, removeAddress } = useAddresses()
const confirm = useConfirm()
const toast = useAppToast()

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
    acceptClass:
      '!rounded-xl !border-nimoura-error !bg-nimoura-error !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-[0_6px_18px_rgba(240,68,56,0.25)] hover:!bg-nimoura-error/90',
    rejectClass:
      '!rounded-xl !border !border-nimoura-text-100 !bg-white !px-5 !py-2.5 !text-sm !font-semibold !text-nimoura-text-600 hover:!bg-nimoura-50',
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

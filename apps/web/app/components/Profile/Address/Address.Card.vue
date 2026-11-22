<script setup lang="ts">
import type { Address } from '~/composables/useAddresses'

withDefaults(
  defineProps<{
    address: Address
    mode?: 'manage' | 'select'
    selected?: boolean
  }>(),
  { mode: 'manage', selected: false }
)

defineEmits<{ (e: 'edit'): void; (e: 'delete'): void; (e: 'select'): void }>()
</script>

<template>
  <div
    class="rounded-2xl border border-nimoura-text-100 bg-white p-4 shadow-[0_8px_30px_rgba(39,33,33,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(39,33,33,0.09)] sm:p-5"
    :class="{
      'cursor-pointer': mode === 'select',
      'border-nimoura-primary ring-2 ring-nimoura-primary/15': selected,
    }"
    @click="mode === 'select' && $emit('select')"
  >
    <div class="flex items-start gap-3">
      <input
        v-if="mode === 'select'"
        type="radio"
        class="mt-1 size-4 shrink-0 accent-nimoura-primary"
        :checked="selected"
        @change="$emit('select')"
      />

      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary"
        aria-hidden="true"
      >
        <i class="pi pi-map-marker text-sm!" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-nimoura-text-900">{{ address.title }}</p>
        <p class="mt-1 text-xs leading-6 text-nimoura-text-600">
          {{ address.state }}، {{ address.city }} — {{ address.address }}
        </p>
        <p class="mt-1 font-modam text-[11px] text-nimoura-text-400">
          کد پستی: {{ address.postal_code }}
        </p>
      </div>
    </div>

    <div v-if="mode === 'manage'" class="mt-4 flex items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-nimoura-primary/10 px-3 py-1.5 text-[11px] font-semibold text-nimoura-primary transition-colors hover:bg-nimoura-primary/20"
        @click.stop="$emit('edit')"
      >
        <i class="pi pi-pencil text-[10px]!" aria-hidden="true" />
        ویرایش
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-nimoura-error/10 px-3 py-1.5 text-[11px] font-semibold text-nimoura-error transition-colors hover:bg-nimoura-error/20"
        @click.stop="$emit('delete')"
      >
        <i class="pi pi-trash text-[10px]!" aria-hidden="true" />
        حذف
      </button>
    </div>
  </div>
</template>

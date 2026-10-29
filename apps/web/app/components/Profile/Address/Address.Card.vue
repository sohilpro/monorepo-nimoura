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
    class="addr-card"
    :class="{ 'addr-card--selectable': mode === 'select', 'addr-card--selected': selected }"
    @click="mode === 'select' && $emit('select')"
  >
    <div class="flex items-start gap-3">
      <input v-if="mode === 'select'" type="radio" class="accent-nimoura-primary w-4 h-4 mt-1"
        :checked="selected" @change="$emit('select')" />
      <div class="addr-icon-wrap">
        <i class="pi pi-map-marker text-sm" style="color:#b76e79" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm" style="color:#3a3131">{{ address.title }}</p>
        <p class="text-xs mt-1 leading-6" style="color:#807676">
          {{ address.state }}، {{ address.city }} — {{ address.address }}
        </p>
        <p class="text-[11px] mt-1 font-modam" style="color:#9b9191">کد پستی: {{ address.postal_code }}</p>
      </div>
    </div>

    <div v-if="mode === 'manage'" class="flex items-center gap-2 mt-3">
      <button type="button" class="action-btn action-btn--edit" @click.stop="$emit('edit')">
        <i class="pi pi-pencil text-[10px]" /> ویرایش
      </button>
      <button type="button" class="action-btn action-btn--danger" @click.stop="$emit('delete')">
        <i class="pi pi-trash text-[10px]" /> حذف
      </button>
    </div>
  </div>
</template>

<style scoped>
.addr-card { background:#fff; border-radius:20px; padding:16px; border:1px solid rgba(183,110,121,0.1); box-shadow:0 2px 16px rgba(183,110,121,0.05); transition:box-shadow .2s, transform .2s, border-color .2s; font-family:'Vazirmatn',sans-serif; }
.addr-card:hover { box-shadow:0 6px 24px rgba(183,110,121,0.1); transform:translateY(-1px); }
.addr-card--selectable { cursor:pointer; }
.addr-card--selected { border-color:#b76e79; box-shadow:0 0 0 2px rgba(183,110,121,0.15); }
.addr-icon-wrap { width:38px; height:38px; border-radius:12px; flex-shrink:0; background:rgba(183,110,121,0.08); display:flex; align-items:center; justify-content:center; }
.action-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 12px; border-radius:10px; border:none; font-size:11px; font-family:'Vazirmatn',sans-serif; font-weight:600; cursor:pointer; transition:all .15s; }
.action-btn--edit { background:rgba(183,110,121,0.08); color:#b76e79; }
.action-btn--edit:hover { background:rgba(183,110,121,0.16); }
.action-btn--danger { background:rgba(220,38,38,0.06); color:#dc2626; }
.action-btn--danger:hover { background:rgba(220,38,38,0.12); }
</style>
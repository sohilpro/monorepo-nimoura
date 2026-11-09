<template>
  <Dialog :visible="visible" modal header="ادغام تگ" class="w-[95vw] max-w-md" @update:visible="emit('close')">
    <div v-if="source" class="space-y-4 text-sm">
      <p class="leading-7 text-gray-700">
        همه محصولاتِ دارای «<b>{{ source.name }}</b>» به تگ انتخابی منتقل می‌شوند و «{{ source.name }}» حذف می‌شود.
        این کار قابل بازگشت نیست.
      </p>
      <div>
        <label class="mb-1.5 block font-medium text-gray-700">ادغام شود در</label>
        <select
          v-model.number="targetId"
          class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
        >
          <option :value="0" disabled>یک تگ انتخاب کنید</option>
          <option v-for="t in candidates" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <p v-if="!candidates.length" class="mt-2 text-xs text-amber-600">تگ دیگری در این گروه وجود ندارد.</p>
      </div>
    </div>

    <template #footer>
      <Button label="انصراف" text severity="secondary" @click="emit('close')" />
      <Button :label="saving ? 'در حال ادغام...' : 'ادغام'" severity="danger" :disabled="!targetId || saving" @click="emit('merge', targetId)" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { Tag } from '@nimoura/shared-types';

const props = defineProps<{ visible: boolean; source: Tag | null; tags: Tag[]; saving: boolean }>();
const emit = defineEmits<{ close: []; merge: [targetId: number] }>();

const targetId = ref(0);
const candidates = computed(() => props.tags.filter((t) => t.id !== props.source?.id));

watch(() => props.visible, () => (targetId.value = 0));
</script>

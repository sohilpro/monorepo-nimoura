<template>
  <Dialog :visible="visible" modal header="ویرایش تگ" class="w-[95vw] max-w-md" @update:visible="emit('close')">
    <form id="tag-form" class="space-y-4" @submit.prevent="submit">
      <CommonCustomInput v-model="form.name" label="نام تگ" />
      <CommonCustomInput v-model="form.slug" label="شناسه (slug)" dir="ltr" />

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">گروه</label>
        <select
          v-model.number="form.groupId"
          class="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
        >
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">رنگ نشان (اختیاری)</span>
          <button v-if="form.color" type="button" class="text-xs text-gray-500 hover:text-rose-600" @click="form.color = ''">
            حذف رنگ
          </button>
        </div>
        <CommonColorPicker :model-value="form.color || '#B76E79'" @update:model-value="form.color = $event" />
      </div>

      <CommonToggleSwitch id="tag-active" v-model="form.isActive" label="تگ فعال است" />
    </form>

    <template #footer>
      <Button label="انصراف" text severity="secondary" @click="emit('close')" />
      <Button
        type="submit"
        form="tag-form"
        :label="saving ? 'در حال ذخیره...' : 'ذخیره'"
        :disabled="saving || !form.name.trim()"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { Tag, TagGroup, UpdateTagPayload } from '@nimoura/shared-types';

const props = defineProps<{ visible: boolean; tag: Tag | null; groups: TagGroup[]; saving: boolean }>();
const emit = defineEmits<{ close: []; save: [payload: UpdateTagPayload] }>();

const form = reactive({ name: '', slug: '', groupId: 0, color: '', isActive: true });

watch(
  () => [props.visible, props.tag] as const,
  ([visible, tag]) => {
    if (!visible || !tag) return;
    form.name = tag.name;
    form.slug = tag.slug;
    form.groupId = tag.groupId;
    form.color = tag.color ?? '';
    form.isActive = tag.isActive;
  },
  { immediate: true },
);

function submit() {
  emit('save', {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    groupId: form.groupId,
    // null clears the color on the server
    color: form.color || null,
    isActive: form.isActive,
  });
}
</script>

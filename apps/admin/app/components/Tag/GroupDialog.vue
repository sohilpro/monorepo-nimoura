<template>
  <Dialog
    :visible="visible"
    modal
    :header="group ? 'ویرایش گروه تگ' : 'گروه تگ جدید'"
    class="w-[95vw] max-w-md"
    @update:visible="emit('close')"
  >
    <form id="tag-group-form" class="space-y-4" @submit.prevent="submit">
      <CommonCustomInput v-model="form.name" label="نام گروه" placeholder="مثال: نوع پوست" />
      <CommonCustomInput
        v-model="form.slug"
        label="شناسه انگلیسی (اختیاری)"
        placeholder="skin-type"
        dir="ltr"
      />
      <CommonCustomInput v-model="form.description" label="توضیح (اختیاری)" placeholder="کوتاه و مفید" />

      <div class="space-y-3 rounded-xl bg-gray-50 p-3.5">
        <CommonToggleSwitch id="group-active" v-model="form.isActive" label="گروه فعال است" />
        <CommonToggleSwitch
          id="group-filterable"
          v-model="form.isFilterable"
          label="نمایش در فیلترهای فروشگاه"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex w-full items-center justify-between gap-2">
        <button
          v-if="group"
          type="button"
          class="rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          @click="emit('delete', group)"
        >
          حذف گروه
        </button>
        <span v-else />
        <div class="flex gap-2">
          <Button label="انصراف" text severity="secondary" @click="emit('close')" />
          <Button
            type="submit"
            form="tag-group-form"
            :label="saving ? 'در حال ذخیره...' : 'ذخیره'"
            :disabled="saving || !form.name.trim()"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { CreateTagGroupPayload, TagGroup } from '@nimoura/shared-types';

const props = defineProps<{ visible: boolean; group: TagGroup | null; saving: boolean }>();
const emit = defineEmits<{
  close: [];
  save: [payload: CreateTagGroupPayload];
  delete: [group: TagGroup];
}>();

const form = reactive({ name: '', slug: '', description: '', isActive: true, isFilterable: true });

watch(
  () => [props.visible, props.group] as const,
  ([visible, group]) => {
    if (!visible) return;
    form.name = group?.name ?? '';
    form.slug = group?.slug ?? '';
    form.description = group?.description ?? '';
    form.isActive = group?.isActive ?? true;
    form.isFilterable = group?.isFilterable ?? true;
  },
  { immediate: true },
);

function submit() {
  emit('save', {
    name: form.name.trim(),
    // slug is only sent when the admin typed one; otherwise the server generates it
    slug: form.slug.trim() || undefined,
    description: form.description.trim() || undefined,
    isActive: form.isActive,
    isFilterable: form.isFilterable,
  });
}
</script>

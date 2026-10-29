<template>
  <div class="border border-gray-200  rounded-xl shadow-sm bg-white  overflow-hidden transition-all">
    <!-- هدر و برچسب -->
    <div v-if="label" class="px-4 py-3 bg-gray-50  border-b border-gray-200  flex items-center justify-between">
      <label class="text-sm font-bold text-gray-700 ">
        {{ label }}
      </label>
      <span class="text-xs text-gray-400">متن غنی (Rich Text)</span>
    </div>

    <!-- نوار ابزار (Toolbar) -->
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80  border-b border-gray-200 "
    >
      <button
        type="button"
        v-for="btn in buttons"
        :key="btn.label"
        :title="btn.label"
        :class="[
          'px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center justify-center min-h-[32px]',
          isBtnActive(btn) 
            ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-sm' 
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100  ',
          btn.disabled?.() ? 'opacity-40 cursor-not-allowed' : '',
        ]"
        @click="btn.action"
        :disabled="btn.disabled?.()"
      >
        <span class="inline-block">{{ btn.icon || btn.label }}</span>
      </button>
    </div>

    <!-- محیط ادیتور -->
    <div class="editor-wrapper p-3 bg-white  text-gray-800 ">
      <TiptapEditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';

const { modelValue, label } = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const safeContent = computed(() => modelValue ?? "");

const editor: any = useEditor({
  content: safeContent.value,
  // نکته: مطمئن شوید اکستنشن‌های Heading و Link (در صورت نیاز) به TiptapStarterKit اضافه شده باشند
  extensions: [TiptapStarterKit, TiptapListItem, TiptapBold],
  onUpdate({ editor }) {
    emit("update:modelValue", editor.getHTML());
  },
});

watch(
  () => safeContent.value,
  (val) => {
    if (!editor?.value) return;
    const current = editor.value.getHTML();
    if (val !== current) {
      editor.value.commands.setContent(val, false);
    }
  }
);

function isBtnActive(btn: any) {
  if (!editor?.value) return false;
  if (typeof btn.isActive === "function") return btn.isActive();
  if (typeof btn.isActive === "string")
    return editor.value.isActive(btn.isActive);
  if (typeof btn.isActive === "object")
    return editor.value.isActive(btn.isActive.name, btn.isActive.attrs);
  return false;
}

const buttons = [
  {
    label: "Bold",
    icon: "B",
    isActive: "bold",
    action: () => editor.value.chain().focus().toggleBold().run(),
    disabled: () => !editor.value.can().chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    icon: "𝐼",
    isActive: "italic",
    action: () => editor.value.chain().focus().toggleItalic().run(),
    disabled: () => !editor.value.can().chain().focus().toggleItalic().run(),
  },
  {
    label: "Strike",
    icon: "S̶",
    isActive: "strike",
    action: () => editor.value.chain().focus().toggleStrike().run(),
    disabled: () => !editor.value.can().chain().focus().toggleStrike().run(),
  },
  {
    label: "Heading 2",
    icon: "H2",
    isActive: () => editor.value.isActive("heading", { level: 2 }),
    action: () => editor.value.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    icon: "H3",
    isActive: () => editor.value.isActive("heading", { level: 3 }),
    action: () => editor.value.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    icon: "• لیست",
    isActive: "bulletList",
    action: () => editor.value.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Ordered List",
    icon: "1. لیست",
    isActive: "orderedList",
    action: () => editor.value.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Blockquote",
    icon: "نکته مهم",
    isActive: "blockquote",
    action: () => editor.value.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Clear Format",
    icon: "پاکسازی فرمت",
    action: () => editor.value.chain().focus().unsetAllMarks().clearNodes().run(),
  },
  {
    label: "Undo",
    icon: "↺",
    action: () => editor.value.chain().focus().undo().run(),
    disabled: () => !editor.value.can().chain().focus().undo().run(),
  },
  {
    label: "Redo",
    icon: "↻",
    action: () => editor.value.chain().focus().redo().run(),
    disabled: () => !editor.value.can().chain().focus().redo().run(),
  },
];

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style scoped>
@reference "tailwindcss";

/* استایل‌دهی حرفه‌ای به محتوای داخلی تپ‌تاپ مخصوص توضیحات محصول */
:deep(.tiptap) {
  @apply min-h-[250px] max-h-[450px] p-3 outline-none overflow-y-auto text-sm leading-relaxed;
}

:deep(.tiptap p) {
  @apply mb-2;
}

:deep(.tiptap h2) {
  @apply text-lg font-bold mt-4 mb-2 text-gray-900 ;
}

:deep(.tiptap h3) {
  @apply text-base font-semibold mt-3 mb-1.5 text-gray-800 ;
}

:deep(.tiptap ul) {
  @apply list-disc list-inside my-2 space-y-1;
}

:deep(.tiptap ol) {
  @apply list-decimal list-inside my-2 space-y-1;
}

:deep(.tiptap blockquote) {
  @apply border-r-4 border-blue-500 bg-blue-50/50 p-3 my-3 rounded-l-md text-gray-700 ;
}
</style>
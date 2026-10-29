<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions'
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
    }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Image.configure({ inline: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'متن مقاله را همینجا بنویسید...' }),
  ],
  editorProps: {
    attributes: {
      class: 'magazine-article-body prose max-w-none min-h-[400px] px-4 py-3 focus:outline-none',
      dir: 'rtl',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

// همگام‌سازی وقتی محتوا از بیرون (مثلا هنگام بارگذاری مقاله برای ویرایش) عوض می‌شود
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, false);
    }
  },
);

onBeforeUnmount(() => editor.value?.destroy());

// ---------- آپلود تصویر ----------
const uploading = ref(false);
const fileInput = ref<HTMLInputElement>();

function triggerImageUpload() {
  fileInput.value?.click();
}

async function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !editor.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerType', 'article_content'); // مشخص کردن نوع موجودیت برای آپلودر بک‌اند

    // ارسال به روت سرور نیترو (مطابق مسیر روت سرور آپلود ادمین شما)
    const res = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res?.url) {
      // قرار دادن تصویر در ادیتور با لینک برگشتی از سرور
      editor.value.chain().focus().setImage({ src: res.url }).run();
    } else {
      throw new Error('لینک تصویر دریافت نشد');
    }
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'آپلود تصویر ناموفق بود');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

function setLink() {
  const url = window.prompt('آدرس لینک را وارد کنید:');
  if (url === null) return;
  if (url === '') {
    editor.value?.chain().focus().unsetLink().run();
    return;
  }
  editor.value?.chain().focus().setLink({ href: url }).run();
}

const toolbarButtons = [
  { icon: 'pi-bold', action: () => editor.value?.chain().focus().toggleBold().run(), active: () => editor.value?.isActive('bold') },
  { icon: 'pi-italic', action: () => editor.value?.chain().focus().toggleItalic().run(), active: () => editor.value?.isActive('italic') },
  { icon: 'pi-underline', action: () => editor.value?.chain().focus().toggleUnderline().run(), active: () => editor.value?.isActive('underline') },
];
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.icon"
        type="button"
        class="rounded-md p-2 text-sm transition hover:bg-nimoura-50"
        :class="btn.active?.() ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="btn.action"
      >
        <i class="pi" :class="btn.icon" />
      </button>

      <span class="mx-1 h-5 w-px bg-gray-200" />

      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-bold transition hover:bg-nimoura-50"
        :class="editor?.isActive('heading', { level: 2 }) ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-bold transition hover:bg-nimoura-50"
        :class="editor?.isActive('heading', { level: 3 }) ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <span class="mx-1 h-5 w-px bg-gray-200" />

      <button
        type="button"
        class="rounded-md p-2 text-sm transition hover:bg-nimoura-50"
        :class="editor?.isActive('bulletList') ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <i class="pi pi-list" />
      </button>
      <button
        type="button"
        class="rounded-md p-2 text-sm transition hover:bg-nimoura-50"
        :class="editor?.isActive('orderedList') ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <i class="pi pi-sort-numeric-down" />
      </button>
      <button
        type="button"
        class="rounded-md p-2 text-sm transition hover:bg-nimoura-50"
        :class="editor?.isActive('blockquote') ? 'bg-nimoura-100 text-nimoura-600' : 'text-gray-600'"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <i class="pi pi-comment" />
      </button>

      <span class="mx-1 h-5 w-px bg-gray-200" />

      <button type="button" class="rounded-md p-2 text-sm text-gray-600 transition hover:bg-nimoura-50" @click="setLink">
        <i class="pi pi-link" />
      </button>
      <button
        type="button"
        class="rounded-md p-2 text-sm text-gray-600 transition hover:bg-nimoura-50 disabled:opacity-50"
        :disabled="uploading"
        @click="triggerImageUpload"
      >
        <i :class="uploading ? 'pi pi-spin pi-spinner' : 'pi pi-image'" />
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />

      <span class="mx-1 h-5 w-px bg-gray-200" />

      <button type="button" class="rounded-md p-2 text-sm text-gray-600 transition hover:bg-nimoura-50" @click="editor?.chain().focus().undo().run()">
        <i class="pi pi-replay scale-x-[-1]" />
      </button>
      <button type="button" class="rounded-md p-2 text-sm text-gray-600 transition hover:bg-nimoura-50" @click="editor?.chain().focus().redo().run()">
        <i class="pi pi-replay" />
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

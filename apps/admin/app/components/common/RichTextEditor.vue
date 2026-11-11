<template>
  <div class="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-theme-xs transition-all">
    <!-- Header / Label -->
    <div
      v-if="label"
      class="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between"
    >
      <label class="text-sm font-bold text-gray-700">
        {{ label }}
      </label>
      <span class="text-[11px] text-gray-400 font-medium">ویرایشگر متن پیشرفته</span>
    </div>

    <!-- Toolbar -->
    <ClientOnly>
      <div
        v-if="editor"
        class="flex flex-wrap items-center gap-1 p-2 bg-gray-50/60 border-b border-gray-200 select-none"
      >
        <!-- فرمت متن: بولد، ایتالیک، زیرخط، خط‌خورده -->
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            title="پررنگ (Bold)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <i class="pi pi-bold text-xs" />
          </button>
          <button
            type="button"
            title="مورب (Italic)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <i class="pi pi-italic text-xs" />
          </button>
          <button
            type="button"
            title="خط زیر (Underline)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <i class="pi pi-underline text-xs" />
          </button>
          <button
            type="button"
            title="خط خورده (Strikethrough)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('strike') }"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <span class="text-xs font-serif line-through">S</span>
          </button>
        </div>

        <span class="toolbar-divider" />

        <!-- تیترها -->
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            title="تیتر ۲"
            class="toolbar-btn font-bold text-xs"
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            H2
          </button>
          <button
            type="button"
            title="تیتر ۳"
            class="toolbar-btn font-bold text-xs"
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          >
            H3
          </button>
          <button
            type="button"
            title="تیتر ۴"
            class="toolbar-btn font-bold text-xs"
            :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
            @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          >
            H4
          </button>
        </div>

        <span class="toolbar-divider" />

        <!-- تراز متن -->
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            title="راست‌چین"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            <i class="pi pi-align-right text-xs" />
          </button>
          <button
            type="button"
            title="وسط‌چین"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            <i class="pi pi-align-center text-xs" />
          </button>
          <button
            type="button"
            title="چپ‌چین"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            <i class="pi pi-align-left text-xs" />
          </button>
          <button
            type="button"
            title="هم‌تراز (Justify)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
            @click="editor.chain().focus().setTextAlign('justify').run()"
          >
            <i class="pi pi-align-justify text-xs" />
          </button>
        </div>

        <span class="toolbar-divider" />

        <!-- لیست‌ها و نقل قول -->
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            title="لیست نشانه‌دار (Bullet)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            <i class="pi pi-list text-xs" />
          </button>
          <button
            type="button"
            title="لیست شماره‌دار (Ordered)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            <i class="pi pi-sort-numeric-down text-xs" />
          </button>
          <button
            type="button"
            title="نقل‌قول (Blockquote)"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            @click="editor.chain().focus().toggleBlockquote().run()"
          >
            <i class="pi pi-comment text-xs" />
          </button>
          <button
            type="button"
            title="خط افقی جداکننده"
            class="toolbar-btn"
            @click="editor.chain().focus().setHorizontalRule().run()"
          >
            <i class="pi pi-minus text-xs" />
          </button>
        </div>

        <span class="toolbar-divider" />

        <!-- پیوند و تصویر -->
        <div class="flex items-center gap-0.5">
          <button
            type="button"
            title="درج پیوند"
            class="toolbar-btn"
            :class="{ 'is-active': editor.isActive('link') }"
            @click="setLink"
          >
            <i class="pi pi-link text-xs" />
          </button>
          <button
            type="button"
            title="درج تصویر در متن"
            class="toolbar-btn"
            :disabled="uploadingImage"
            @click="triggerImageBrowse"
          >
            <i :class="uploadingImage ? 'pi pi-spin pi-spinner text-xs' : 'pi pi-image text-xs'" />
          </button>
          <input
            ref="imageInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageSelected"
          />
        </div>

        <span class="toolbar-divider" />

        <!-- تاریخچه و پاکسازی فرمت -->
        <div class="flex items-center gap-0.5 mr-auto">
          <button
            type="button"
            title="پاکسازی تمام فرمت‌ها"
            class="toolbar-btn text-gray-500 hover:text-gray-800"
            @click="editor.chain().focus().unsetAllMarks().clearNodes().run()"
          >
            <i class="pi pi-filter-slash text-xs" />
          </button>
          <button
            type="button"
            title="بازگشت به عقب (Undo)"
            class="toolbar-btn"
            :disabled="!editor.can().chain().focus().undo().run()"
            @click="editor.chain().focus().undo().run()"
          >
            <i class="pi pi-undo text-xs" />
          </button>
          <button
            type="button"
            title="انجام مجدد (Redo)"
            class="toolbar-btn"
            :disabled="!editor.can().chain().focus().redo().run()"
            @click="editor.chain().focus().redo().run()"
          >
            <i class="pi pi-refresh text-xs" />
          </button>
        </div>
      </div>
    </ClientOnly>

    <!-- Editor Body Area -->
    <div
      class="editor-container p-4 text-gray-800 bg-white"
      :style="{ minHeight: minHeight || '260px' }"
      dir="rtl"
    >
      <ClientOnly>
        <EditorContent v-if="editor" :editor="editor" />
        <template #fallback>
          <div class="flex items-center justify-center p-8 text-gray-400 text-xs">
            در حال بارگذاری ویرایشگر...
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    minHeight?: string;
    ownerType?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    placeholder: 'متن خود را اینجا وارد کنید...',
    minHeight: '260px',
    ownerType: 'article_content',
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const toast = useAppToast();
const imageInputRef = ref<HTMLInputElement | null>(null);
const uploadingImage = ref(false);

const editor = useEditor({
  content: props.modelValue || '',
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: 'text-brand-600 underline hover:text-brand-700',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({
      inline: false,
      HTMLAttributes: {
        class: 'rounded-xl max-w-full my-4 border border-gray-200 shadow-xs mx-auto',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'right',
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-content outline-none text-sm leading-relaxed text-gray-800',
      dir: 'rtl',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val || '', false);
    }
  }
);

watch(
  () => props.disabled,
  (val) => {
    editor.value?.setEditable(!val);
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function triggerImageBrowse() {
  imageInputRef.value?.click();
}

async function handleImageSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !editor.value) return;

  uploadingImage.value = true;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ownerType', props.ownerType || 'article_content');
  formData.append('ownerId', 'editor');

  try {
    const res: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const publicUrl = res?.url || res?.data?.publicUrl;
    if (publicUrl) {
      editor.value.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
      toast.success('تصویر با موفقیت در متن درج شد');
    } else {
      throw new Error('آدرس تصویر دریافت نشد');
    }
  } catch (err: any) {
    toast.error(err?.data?.message || err?.statusMessage || 'خطا در بارگذاری تصویر');
  } finally {
    uploadingImage.value = false;
    if (imageInputRef.value) imageInputRef.value.value = '';
  }
}

function setLink() {
  if (!editor.value) return;

  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('آدرس پیوند (URL) را وارد کنید:', previousUrl || 'https://');

  if (url === null) return;

  if (url.trim() === '' || url === 'https://') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
}
</script>

<style scoped>
.toolbar-btn {
  height: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600, #665d5d);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--color-gray-100, #f7eeec);
  color: var(--color-gray-800, #3a3131);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.is-active {
  background-color: var(--color-brand-100, #f5e4e6);
  color: var(--color-brand-700, #87444f);
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(46, 38, 54, 0.06);
}

.toolbar-divider {
  height: 1rem;
  width: 1px;
  background-color: var(--color-gray-200, #ebe0df);
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

:deep(.tiptap) {
  outline: none;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  color: var(--color-gray-400, #9b9191);
  content: attr(data-placeholder);
  float: right;
  height: 0;
  pointer-events: none;
}

:deep(.tiptap h2) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-gray-900, #2e2636);
}

:deep(.tiptap h3) {
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  color: var(--color-gray-800, #3a3131);
}

:deep(.tiptap h4) {
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.625rem;
  margin-bottom: 0.25rem;
  color: var(--color-gray-800, #3a3131);
}

:deep(.tiptap ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-inline-start: 0.5rem;
}

:deep(.tiptap ol) {
  list-style-type: decimal;
  list-style-position: inside;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-inline-start: 0.5rem;
}

:deep(.tiptap blockquote) {
  border-right-width: 4px;
  border-color: var(--color-brand-500, #b76e79);
  background-color: rgba(251, 244, 245, 0.7);
  padding: 0.5rem 0.75rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  font-style: italic;
  color: var(--color-gray-700, #4e4545);
}

:deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--color-gray-200, #ebe0df);
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>

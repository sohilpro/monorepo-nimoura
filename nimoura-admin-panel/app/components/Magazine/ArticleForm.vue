<script setup lang="ts">
import type { Article, ArticleStatus } from "~~/server/types/magazine";
import type { ArticleFormPayload } from "~/composables/useAdminArticles";

const props = defineProps<{
  initial?: Article | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", payload: ArticleFormPayload): void;
}>();

const { data: categories } = useAdminCategoriesList();
const { data: authors } = useAdminAuthorsList();
const { data: tags } = useAdminTagsList();

const statusOptions = [
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشرشده", value: "published" },
  { label: "بایگانی", value: "archived" },
];

const form = reactive<ArticleFormPayload>({
  title: props.initial?.title ?? "",
  summary: props.initial?.summary ?? "",
  content: props.initial?.content ?? "",
  coverImage: props.initial?.coverImage ?? "",
  coverImageAlt: props.initial?.coverImageAlt ?? "",
  status: (props.initial?.status as ArticleStatus) ?? "draft",
  isFeatured: props.initial?.isFeatured ?? false,
  authorId: props.initial?.author?.id ?? null,       // تغییر از "" به null
  categoryId: props.initial?.category?.id ?? null,   // تغییر از "" به null
  tagIds: props.initial?.tags?.map((t) => t.id) ?? [],
  metaTitle: props.initial?.metaTitle ?? "",
  metaDescription: props.initial?.metaDescription ?? "",
  metaKeywords: props.initial?.metaKeywords ?? "",
});

const errors = reactive<Record<string, string>>({});

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k]);

  if (!form.title.trim()) errors.title = "عنوان الزامی است";
  if (!form.summary.trim()) errors.summary = "خلاصه الزامی است";
  if (form.summary.length > 500) errors.summary = "خلاصه حداکثر ۵۰۰ کاراکتر";
  if (!form.content || form.content === "<p></p>")
    errors.content = "متن مقاله الزامی است";
  if (!form.categoryId) errors.categoryId = "انتخاب دسته‌بندی الزامی است";
  if (!form.authorId) errors.authorId = "انتخاب نویسنده الزامی است";

  return Object.keys(errors).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  emit("submit", { ...form });
}

// مدیریت حذف تصویر کاور موجود از سرور
function onRemoveCover() {
  form.coverImage = "";
}

const summaryLength = computed(() => form.summary.length);
const categoriesList = computed(() => {
  const raw = categories.value;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
});

const authorsList = computed(() => {
  const raw = authors.value;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
});
</script>

<template>
  <form
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    @submit.prevent="handleSubmit"
  >
    <!-- ستون اصلی -->
    <div class="space-y-6 lg:col-span-2">
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <label class="mb-1.5 block text-sm font-bold text-gray-700"
          >عنوان مقاله</label
        >
        <InputText
          v-model="form.title"
          class="w-full"
          placeholder="مثلا: راهنمای کامل انتخاب کرم ضدآفتاب"
        />
        <p v-if="errors.title" class="mt-1 text-xs text-red-500">
          {{ errors.title }}
        </p>
      </div>

      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div class="mb-1.5 flex items-center justify-between">
          <label class="block text-sm font-bold text-gray-700"
            >خلاصه مقاله</label
          >
          <span class="text-xs text-gray-400">{{ summaryLength }} / 500</span>
        </div>
        <Textarea
          v-model="form.summary"
          class="w-full"
          rows="3"
          placeholder="یک یا دو جمله کوتاه برای کارت مقاله و متا دیسکریپشن"
        />
        <p v-if="errors.summary" class="mt-1 text-xs text-red-500">
          {{ errors.summary }}
        </p>
      </div>

      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <label class="mb-1.5 block text-sm font-bold text-gray-700"
          >متن کامل مقاله</label
        >
        <MagazineTipTapEditor v-model="form.content" />
        <p v-if="errors.content" class="mt-1 text-xs text-red-500">
          {{ errors.content }}
        </p>
      </div>

      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">تنظیمات سئو (SEO)</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500"
              >عنوان متا (Meta Title)</label
            >
            <InputText v-model="form.metaTitle" class="w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500"
              >توضیحات متا (Meta Description)</label
            >
            <Textarea v-model="form.metaDescription" class="w-full" rows="2" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500"
              >کلمات کلیدی (با کاما جدا کنید)</label
            >
            <InputText v-model="form.metaKeywords" class="w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- ستون کناری -->
    <div class="space-y-6">
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">انتشار</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">وضعیت</label>
            <Select
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input
              v-model="form.isFeatured"
              type="checkbox"
              class="h-4 w-4 rounded accent-nimoura-500"
            />
            مقاله ویژه (نمایش در بخش برجسته)
          </label>
          <Button
            type="submit"
            :label="
              submitting
                ? 'در حال ذخیره...'
                : initial
                  ? 'ذخیره تغییرات'
                  : 'ایجاد مقاله'
            "
            :disabled="submitting"
            class="w-full !bg-nimoura-500 !border-nimoura-500"
          />
        </div>
      </div>

      <!-- استفاده از آپلودر سراسری برای تصویر کاور مقاله -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <UtilsFileUploader
          label="تصویر کاور"
          name="coverImage"
          :multiple="false"
          ownerType="magazine_cover"
          :model-value="form.coverImage || null"
          @update:model-value="
            (val) =>
              (form.coverImage =
                typeof val === 'string' ? val : (val?.[0] ?? ''))
          "
          :existing="form.coverImage ? [{ url: form.coverImage }] : []"
          @remove-existing="onRemoveCover"
        />
        <div class="mt-3">
          <label class="mb-1 block text-xs text-gray-500"
            >متن جایگزین تصویر (Alt)</label
          >
          <InputText v-model="form.coverImageAlt" class="w-full" />
        </div>
      </div>

      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">
          دسته‌بندی و نویسنده
        </h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">دسته‌بندی</label>
            <Select
              v-if="categoriesList"
              v-model="form.categoryId"
              :options="categoriesList"
              option-label="name"
              option-value="id"
              filter
              placeholder="انتخاب دسته‌بندی"
              class="w-full"
            />
            <p v-if="errors.categoryId" class="mt-1 text-xs text-red-500">
              {{ errors.categoryId }}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">نویسنده</label>
           <Select
              v-model="form.authorId"
              :options="authorsList"
              option-label="name"
              option-value="id"
              filter
              placeholder="انتخاب نویسنده"
              class="w-full"
            />
            <p v-if="errors.authorId" class="mt-1 text-xs text-red-500">
              {{ errors.authorId }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">برچسب‌ها</h3>
        
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tag in tags?.data ?? []"
            :key="tag.id"
            class="cursor-pointer rounded-full border px-3 py-1 text-xs transition"
            :class="
              form.tagIds?.includes(tag.id)
                ? 'border-nimoura-500 bg-nimoura-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-nimoura-300'
            "
          >
            <input
              type="checkbox"
              :value="tag.id"
              v-model="form.tagIds"
              class="hidden"
            />
            {{ tag.name }}
          </label>
        </div>
      </div>
    </div>
  </form>
</template>

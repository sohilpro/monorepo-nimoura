<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دسته‌بندی‌ها', href: '/category' },
        { label: mode === 'create' ? 'افزودن دسته‌بندی' : 'ویرایش دسته‌بندی', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد دسته‌بندی جدید' : 'ویرایش دسته‌بندی'"
      :subtitle="mode === 'create' ? 'افزودن دسته‌بندی کالاها به فروشگاه نیمورا' : 'تغییر عنوان، والد یا اسلاگ دسته‌بندی'"
      :publish-label="mode === 'create' ? 'انتشار دسته‌بندی' : 'ذخیره تغییرات'"
      discard-label="انصراف"
      form="category-form"
      @discard="() => navigateTo('/category')"
    />

    <form @submit.prevent="submitForm" id="category-form" class="space-y-6">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Form Column -->
        <main class="flex flex-col basis-full lg:basis-8/12 space-y-6">
          <CommonComponentCard title="اطلاعات اصلی دسته‌بندی">
            <CommonCustomInput
              v-model="form.name"
              label="نام / عنوان دسته‌بندی (فارسی)"
              placeholder="مثال: مراقبت پوستی، ضد آفتاب، کرم مرطوب کننده"
              required
            />

            <CommonCustomInput
              v-model="form.slug"
              label="اسلاگ دسته‌بندی (اختیاری)"
              placeholder="در صورت خالی بودن، به صورت خودکار از نام تولید می‌شود"
            />

            <div v-if="suggestedSlug" class="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg">
              پیش‌نمایش آدرس اینترنتی:
              <span class="font-mono text-brand-600 font-semibold" dir="ltr">/categories/{{ suggestedSlug }}</span>
            </div>
          </CommonComponentCard>

          <CommonComponentCard title="تنظیمات و محتوای سئو (SEO)">
            <div class="space-y-1.5">
              <CommonCustomInput
                v-model="form.seoTitle"
                label="عنوان سئو (Meta Title)"
                placeholder="مثال: خرید انواع لوازم آرایشی اصل با بهترین قیمت | نیمورا"
              />
              <p class="text-[11px] text-gray-400">
                طول پیشنهادی برای گوگل: ۵۰ تا ۶۰ کاراکتر (فعلی: {{ form.seoTitle.trim().length }} کاراکتر)
              </p>
            </div>

            <div class="space-y-1.5">
              <CommonTextArea
                v-model="form.seoDescription"
                label="توضیحات متا (Meta Description)"
                placeholder="توضیح کوتاه و جذاب برای نمایش در نتایج جستجوی گوگل..."
                :rows="3"
                :maxlength="500"
              />
              <p class="text-[11px] text-gray-400">
                طول پیشنهادی برای گوگل: ۱۲۰ تا ۱۶۰ کاراکتر (فعلی: {{ form.seoDescription.trim().length }} کاراکتر)
              </p>
            </div>

            <div class="space-y-2 pt-1">
              <CommonRichTextEditor
                v-model="form.seoText"
                label="توضیحات سئوی پایین صفحه‌ی دسته‌بندی"
                placeholder="متن جامع درباره محصولات این دسته‌بندی همراه با هدینگ‌های H1 / H2 / H3 و لینک‌های داخلی برای کراول بهتر گوگل..."
                :allow-h1="true"
                owner-type="magazine_content_image"
                min-height="260px"
              />
              <p class="text-[11px] text-gray-500 leading-relaxed">
                این متن در انتهای صفحه‌ی دسته‌بندی (زیر لیست محصولات) نمایش داده می‌شود و به‌طور کامل در HTML سمت سرور برای ربات‌های گوگل رندر می‌گردد.
              </p>
            </div>
          </CommonComponentCard>
        </main>

        <!-- Sidebar / Hierarchy Column -->
        <aside class="flex flex-col gap-5 basis-full lg:basis-4/12">
          <CommonComponentCard title="ساختار درختی و والد">
            <CommonSelectInput
              v-model="form.parentId"
              :options="formattedParentOptions"
              label="دسته‌بندی والد"
              placeholder="انتخاب دسته‌بندی والد..."
            />

            <p class="text-xs text-gray-500 leading-relaxed pt-1">
              اگر این دسته‌بندی یک شاخه اصلی است، گزینه «دسته اصلی (بدون والد)» را انتخاب کنید.
            </p>
          </CommonComponentCard>
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';
import type { CreateCategoryPayload } from '@nimoura/shared-types';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    categoryId?: number | string;
  }>(),
  {
    mode: 'create',
  },
);

const {
  getCategoryById,
  createCategory,
  updateCategory,
  fetchParentOptions,
} = useAdminProductCategories();

const form = reactive({
  name: '',
  slug: '',
  parentId: null as number | null,
  seoTitle: '',
  seoDescription: '',
  seoText: '',
});

const parentOptions = ref<any[]>([]);

const formattedParentOptions = computed(() => [
  { id: null, name: 'دسته اصلی (بدون والد)' },
  ...parentOptions.value,
]);

const suggestedSlug = computed(() => {
  if (form.slug?.trim()) {
    return createSlug(form.slug);
  }
  return createSlug(form.name);
});

onMounted(async () => {
  parentOptions.value = await fetchParentOptions(props.categoryId);

  if (props.mode === 'update' && props.categoryId) {
    const existing = await getCategoryById(props.categoryId);
    if (existing) {
      form.name = existing.name || '';
      form.slug = existing.slug || '';
      form.parentId = existing.parent?.id || existing.parentId || null;
      form.seoTitle = existing.seoTitle || '';
      form.seoDescription = existing.seoDescription || '';
      form.seoText = existing.seoText || '';
    }
  }
});

async function submitForm() {
  if (!form.name?.trim()) {
    alert('لطفاً عنوان دسته‌بندی را وارد کنید');
    return;
  }

  const cleanSeoText =
    form.seoText && form.seoText.replace(/<p>\s*<\/p>/g, '').trim()
      ? form.seoText.trim()
      : '';

  const payload: CreateCategoryPayload = {
    name: form.name.trim(),
    slug: form.slug?.trim() ? createSlug(form.slug) : undefined,
    parentId: form.parentId ? Number(form.parentId) : null,
    seoTitle: form.seoTitle.trim() || (props.mode === 'update' ? '' : undefined),
    seoDescription:
      form.seoDescription.trim() || (props.mode === 'update' ? '' : undefined),
    seoText: cleanSeoText || (props.mode === 'update' ? '' : undefined),
  };

  let success = false;
  if (props.mode === 'create') {
    success = await createCategory(payload);
  } else if (props.mode === 'update' && props.categoryId) {
    success = await updateCategory(props.categoryId, payload);
  }

  if (success) {
    await navigateTo('/category');
  }
}
</script>

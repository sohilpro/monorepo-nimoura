<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'برندها', href: '/brand' },
        { label: mode === 'create' ? 'افزودن برند' : 'ویرایش برند', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد برند جدید' : 'ویرایش برند'"
      :subtitle="
        mode === 'create'
          ? 'افزودن برند تولیدکننده به فروشگاه نیمورا'
          : 'تغییر عنوان، لوگو یا زیربرندهای این برند'
      "
      :publish-label="mode === 'create' ? 'انتشار برند' : 'ذخیره تغییرات'"
      discard-label="انصراف"
      form="brand-form"
      @discard="() => navigateTo('/brand')"
    />

    <form @submit.prevent="submitForm" id="brand-form" class="space-y-6">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Column (Left) -->
        <main class="flex flex-col basis-full lg:basis-7/12 space-y-6">
          <CommonComponentCard title="اطلاعات اصلی برند">
            <CommonCustomInput
              v-model="form.name"
              label="نام / عنوان برند"
              placeholder="مثال: لورآل (L'Oréal)، این‌لی (Inlay)"
              required
            />

            <CommonCustomInput
              v-model="form.slug"
              label="اسلاگ آدرس اینترنتی (اختیاری)"
              placeholder="در صورت خالی بودن، به صورت خودکار از نام تولید می‌شود"
            />

            <div v-if="suggestedSlug" class="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg">
              پیش‌نمایش آدرس اینترنتی:
              <span class="font-mono text-brand-600 font-semibold" dir="ltr">/brand/{{ suggestedSlug }}</span>
            </div>

            <CommonTextArea
              v-model="form.description"
              label="توضیحات و معرفی برند (اختیاری)"
              placeholder="توضیحاتی درباره تاریخچه، کشور سازنده یا ویژگی‌های شاخص این برند..."
              :rows="4"
            />
          </CommonComponentCard>

          <CommonComponentCard title="لوگوی رسمی برند">
            <UtilsFileUploader
              label="تصویر لوگوی برند"
              name="logo"
              :multiple="false"
              ownerType="brand_logo"
              v-model="form.logo"
              :existing="existingLogoUrl ? [{ url: existingLogoUrl }] : []"
              @remove-existing="onRemoveOldLogo"
            />
          </CommonComponentCard>
        </main>

        <!-- Sidebar Column (Right) -->
        <aside class="flex flex-col gap-5 basis-full lg:basis-5/12">
          <CommonComponentCard title="زیربرندها (Sub-brands)">
            <p class="text-xs text-gray-500 leading-relaxed mb-3">
              در صورتی که این برند دارای خطوط تولید یا زیرمجموعه‌های متعددی است، نام آن‌ها را وارد کرده و Enter را بزنید.
            </p>

            <CommonTagInput
              v-model="form.subBrands"
              placeholder="نام زیربرند را بنویسید و اینتر بزنید..."
            />
          </CommonComponentCard>
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { createSlug } from '@nimoura/utils';
import type { CreateBrandPayload } from '@nimoura/shared-types';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    brandId?: number | string;
  }>(),
  {
    mode: 'create',
  },
);

const { getBrandById, createBrand, updateBrand } = useAdminBrands();

const form = reactive({
  name: '',
  slug: '',
  logo: null as string | null,
  description: '',
  subBrands: [] as string[],
});

const existingLogoUrl = ref<string | null>(null);

const suggestedSlug = computed(() => {
  if (form.slug?.trim()) {
    return createSlug(form.slug);
  }
  return createSlug(form.name);
});

onMounted(async () => {
  if (props.mode === 'update' && props.brandId) {
    const existing = await getBrandById(props.brandId);
    if (existing) {
      form.name = existing.name || '';
      form.slug = existing.slug || '';
      form.description = existing.description || '';
      form.logo = existing.logo || (existing as any).logoUrl || null;
      existingLogoUrl.value = form.logo;
      form.subBrands = Array.isArray(existing.subBrands)
        ? existing.subBrands.map((s: any) => (typeof s === 'string' ? s : s?.name))
        : [];
    }
  }
});

function onRemoveOldLogo() {
  existingLogoUrl.value = null;
  form.logo = null;
}

async function submitForm() {
  if (!form.name?.trim()) {
    alert('وارد کردن نام برند الزامی است');
    return;
  }

  const payload: CreateBrandPayload = {
    name: form.name.trim(),
    slug: form.slug?.trim() ? createSlug(form.slug) : undefined,
    logo: form.logo || existingLogoUrl.value || null,
    description: form.description?.trim() || undefined,
    subBrands: form.subBrands.filter((s) => typeof s === 'string' && s.trim()),
  };

  let success = false;
  if (props.mode === 'create') {
    success = await createBrand(payload);
  } else if (props.mode === 'update' && props.brandId) {
    success = await updateBrand(props.brandId, payload);
  }

  if (success) {
    await navigateTo('/brand');
  }
}
</script>

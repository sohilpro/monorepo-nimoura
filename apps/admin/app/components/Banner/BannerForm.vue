<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'بنرها', href: '/banners' },
        { label: mode === 'create' ? 'افزودن بنر' : 'ویرایش بنر', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد بنر جدید' : 'ویرایش بنر'"
      :subtitle="
        mode === 'create'
          ? 'افزودن بنر تبلیغاتی یا اسلایدر به فروشگاه نیمورا'
          : 'تغییر تصاویر، لینک و مشخصات بنر'
      "
      :publish-label="mode === 'create' ? 'انتشار بنر' : 'ذخیره تغییرات'"
      discard-label="انصراف"
      form="banner-form"
      @discard="() => navigateTo('/banners')"
    />

    <form @submit.prevent="submitForm" id="banner-form" class="space-y-6">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Column (Left) -->
        <main class="flex flex-col basis-full lg:basis-7/12 space-y-6">
          <CommonComponentCard title="اطلاعات بنر">
            <CommonCustomInput
              v-model="form.title"
              label="عنوان بنر"
              placeholder="مثال: جشنواره تخفیف پاییزی، اسلایدر اصلی"
              required
            />

            <CommonTextArea
              v-model="form.description"
              label="توضیحات کوتاه (اختیاری)"
              placeholder="توضیحاتی برای مدیریت این کمپین..."
              :rows="3"
            />

            <CommonCustomInput
              v-model="form.link"
              label="آدرس لینک بنر (URL)"
              placeholder="مثال: /categories/cosmetics یا https://..."
            />

            <!-- دستیار ساخت سریع لینک بر اساس دسته‌بندی یا برند -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
              <span class="text-xs font-semibold text-gray-700">دستیار ساخت سریع لینک:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CommonSelectInput
                  v-model="selectedCategoryId"
                  :options="categoryOptions"
                  label="انتخاب دسته‌بندی"
                  placeholder="کلیک کنید..."
                  @update:modelValue="onSelectCategory"
                />

                <CommonSelectInput
                  v-model="selectedBrandId"
                  :options="brandOptions"
                  label="انتخاب برند"
                  placeholder="کلیک کنید..."
                  @update:modelValue="onSelectBrand"
                />
              </div>
            </div>
          </CommonComponentCard>

          <!-- تصاویر بنر -->
          <CommonComponentCard title="تصاویر بنر">
            <UtilsFileUploader
              label="تصویر دسکتاپ (الزامی)"
              name="imageUrl"
              :multiple="false"
              ownerType="banner"
              v-model="form.imageUrl"
              :existing="existingDesktopUrl ? [{ url: existingDesktopUrl }] : []"
              @remove-existing="onRemoveOldDesktop"
            />

            <div class="pt-4 border-t border-gray-100">
              <UtilsFileUploader
                label="تصویر اختصاصی موبایل (اختیاری)"
                name="mobileImageUrl"
                :multiple="false"
                ownerType="banner"
                v-model="form.mobileImageUrl"
                :existing="existingMobileUrl ? [{ url: existingMobileUrl }] : []"
                @remove-existing="onRemoveOldMobile"
              />
            </div>
          </CommonComponentCard>
        </main>

        <!-- Sidebar Column (Right) -->
        <aside class="flex flex-col gap-5 basis-full lg:basis-5/12">
          <!-- جایگاه و نحوه نمایش -->
          <CommonComponentCard title="تنظیمات نمایش">
            <CommonSelectInput
              v-model="form.positionId"
              :options="formattedPositionOptions"
              label="جایگاه نمایش بنر"
              placeholder="انتخاب جایگاه..."
              required
            />

            <CommonSelectInput
              v-model="form.device"
              :options="deviceOptions"
              label="دستگاه‌های هدف"
              placeholder="انتخاب دستگاه..."
            />

            <CommonSelectInput
              v-model="form.status"
              :options="statusOptions"
              label="وضعیت انتشار"
              placeholder="انتخاب وضعیت..."
            />

            <CommonSelectInput
              v-model="form.linkTarget"
              :options="linkTargetOptions"
              label="نحوه باز شدن لینک"
              placeholder="انتخاب..."
            />

            <div class="pt-2">
              <label class="text-xs font-semibold text-gray-700 block mb-1">
                ترتیب نمایش (اولویت):
              </label>
              <input
                v-model.number="form.sortOrder"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="0"
              />
            </div>
          </CommonComponentCard>
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { BannerDevice, BannerStatus, LinkTarget, type CreateBannerPayload } from '@nimoura/shared-types';
import { createSlug } from '@nimoura/utils';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    bannerId?: number | string;
  }>(),
  {
    mode: 'create',
  },
);

const {
  getBannerById,
  createBanner,
  updateBanner,
  fetchBannerPositions,
} = useAdminBanners();

const form = reactive({
  title: '',
  description: '',
  link: '',
  linkTarget: LinkTarget.SELF,
  positionId: null as number | null,
  device: BannerDevice.ALL,
  status: BannerStatus.ACTIVE,
  sortOrder: 0,
  imageUrl: null as string | null,
  mobileImageUrl: null as string | null,
});

const existingDesktopUrl = ref<string | null>(null);
const existingMobileUrl = ref<string | null>(null);

const positions = ref<any[]>([]);
const categoryOptions = ref<any[]>([]);
const brandOptions = ref<any[]>([]);

const selectedCategoryId = ref<number | null>(null);
const selectedBrandId = ref<number | null>(null);

const fallbackPositions = [
  { id: 1, name: 'اسلایدر اصلی بالای صفحه (MAIN_PAGE_TOP)' },
  { id: 2, name: 'بنرهای میانی صفحه اصلی (MAIN_PAGE_MIDDLE)' },
  { id: 3, name: 'سایدبار دسته‌بندی‌ها (CATEGORY_SIDEBAR)' },
  { id: 4, name: 'پایین صفحه محصول (PRODUCT_PAGE_BOTTOM)' },
];

const formattedPositionOptions = computed(() => {
  if (positions.value.length) {
    return positions.value.map((p) => ({
      id: p.id,
      name: `${p.name} (${p.key})`,
    }));
  }
  return fallbackPositions;
});

const deviceOptions = [
  { id: BannerDevice.ALL, name: 'تمام دستگاه‌ها (All)' },
  { id: BannerDevice.DESKTOP, name: 'فقط دسکتاپ (Desktop)' },
  { id: BannerDevice.MOBILE, name: 'فقط موبایل (Mobile)' },
  { id: BannerDevice.TABLET, name: 'فقط تبلت (Tablet)' },
];

const statusOptions = [
  { id: BannerStatus.ACTIVE, name: 'فعال در سایت' },
  { id: BannerStatus.INACTIVE, name: 'غیرفعال' },
  { id: BannerStatus.DRAFT, name: 'پیش‌نویس' },
  { id: BannerStatus.SCHEDULED, name: 'زمان‌بندی‌شده' },
];

const linkTargetOptions = [
  { id: LinkTarget.SELF, name: 'در همان تب (_self)' },
  { id: LinkTarget.BLANK, name: 'در تب جدید (_blank)' },
];

onMounted(async () => {
  const [pos, catRes, brandRes] = await Promise.all([
    fetchBannerPositions(),
    $fetch<any>('/api/category/list', { query: { limit: 100 } }).catch(() => null),
    $fetch<any>('/api/product/brand/list', { query: { limit: 100 } }).catch(() => null),
  ]);

  if (pos.length) {
    positions.value = pos;
  }
  categoryOptions.value = catRes?.data?.categories || catRes?.items || [];
  brandOptions.value = brandRes?.data?.brands || brandRes?.items || [];

  if (props.mode === 'create' && !form.positionId) {
    form.positionId = formattedPositionOptions.value[0]?.id || 1;
  }

  if (props.mode === 'update' && props.bannerId) {
    const existing = await getBannerById(props.bannerId);
    if (existing) {
      form.title = existing.title || '';
      form.description = existing.description || '';
      form.link = existing.link || '';
      form.linkTarget = existing.linkTarget || LinkTarget.SELF;
      form.positionId = existing.positionId || existing.position?.id || 1;
      form.device = existing.device || BannerDevice.ALL;
      form.status = existing.status || BannerStatus.ACTIVE;
      form.sortOrder = existing.sortOrder || 0;
      form.imageUrl = existing.imageUrl || null;
      form.mobileImageUrl = existing.mobileImageUrl || null;

      if (existing.imageUrl) {
        existingDesktopUrl.value = existing.imageUrl;
      }
      if (existing.mobileImageUrl) {
        existingMobileUrl.value = existing.mobileImageUrl;
      }
    }
  }
});

function onSelectCategory(catId: any) {
  if (!catId) return;
  const cat = categoryOptions.value.find((c) => c.id === catId);
  if (cat) {
    form.link = `/categories/${cat.slug || createSlug(cat.name)}`;
    selectedBrandId.value = null;
  }
}

function onSelectBrand(brandId: any) {
  if (!brandId) return;
  const b = brandOptions.value.find((x) => x.id === brandId);
  if (b) {
    form.link = `/brand/${createSlug(b.name)}?id=${b.id}`;
    selectedCategoryId.value = null;
  }
}

function onRemoveOldDesktop() {
  existingDesktopUrl.value = null;
  form.imageUrl = null;
}

function onRemoveOldMobile() {
  existingMobileUrl.value = null;
  form.mobileImageUrl = null;
}

async function submitForm() {
  if (!form.title?.trim()) {
    alert('عنوان بنر الزامی است');
    return;
  }

  const finalImageUrl = form.imageUrl || existingDesktopUrl.value;
  if (!finalImageUrl) {
    alert('لطفاً تصویر دسکتاپ بنر را آپلود کنید');
    return;
  }

  const payload: CreateBannerPayload = {
    title: form.title.trim(),
    description: form.description?.trim() || undefined,
    link: form.link?.trim() || undefined,
    linkTarget: form.linkTarget,
    positionId: Number(form.positionId) || 1,
    device: form.device,
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    imageUrl: finalImageUrl,
    mobileImageUrl: form.mobileImageUrl || existingMobileUrl.value || undefined,
  };

  let success = false;
  if (props.mode === 'create') {
    success = await createBanner(payload);
  } else if (props.mode === 'update' && props.bannerId) {
    success = await updateBanner(props.bannerId, payload);
  }

  if (success) {
    await navigateTo('/banners');
  }
}
</script>

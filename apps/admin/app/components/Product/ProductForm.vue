<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '/product' },
        { label: mode === 'create' ? 'افزودن محصول' : 'ویرایش محصول', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد محصول جدید' : 'ویرایش محصول'"
      :subtitle="mode === 'create' ? 'افزودن محصول جدید به فروشگاه نیمورا' : 'تغییر اطلاعات و مشخصات محصول'"
      :publish-label="mode === 'create' ? 'انتشار محصول' : 'ذخیره تغییرات'"
      discard-label="انصراف"
      form="product-form"
      @discard="() => navigateTo('/product')"
    />

    <form @submit.prevent="submitForm" class="space-y-8" id="product-form">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Column (Left) -->
        <main class="flex flex-col basis-full lg:basis-7/12 space-y-6">
          <CommonCustomInput
            v-model="form.title"
            label="نام / عنوان محصول (فارسی)"
            placeholder="مثال: کرم مرطوب کننده و آبرسان"
            required
          />

          <CommonCustomInput
            v-model="form.englishTitle"
            label="نام / عنوان انگلیسی محصول"
            placeholder="e.g. Moisturizing & Hydrating Cream"
          />

          <CommonTextArea
            v-model="form.shortDescription"
            label="توضیحات کوتاه محصول"
            placeholder="خلاصه‌ای از ویژگی‌ها و مشخصات کلیدی این کالا..."
            :rows="4"
          />

          <UtilsTagEditor
            v-if="tagTypes?.data"
            v-model="form.tags"
            :types="tagTypes.data"
            :typeLabels="tagTypesLabels?.data || []"
            api-base="/api/tags"
            label="تگ‌های محصول"
          />

          <!-- ادیتورهای متن غنی -->
          <ProductRichTextEditor
            v-model="form.introduce"
            label="معرفی و نقد و بررسی محصول"
          />

          <ProductRichTextEditor
            v-model="form.howToUse"
            label="راهنمای نحوه استفاده و مصرف"
          />

          <!-- مشخصات فنی -->
          <UtilsSpecificationsInputs
            v-model="form.specifications"
          />

          <!-- تصویر شاخص -->
          <UtilsFileUploader
            label="تصویر شاخص محصول"
            name="thumbnail"
            :multiple="false"
            ownerType="product_thumbnail"
            v-model="form.thumbnail"
            :existing="existingThumbnailUrl ? [{ url: existingThumbnailUrl }] : []"
            @remove-existing="onRemoveOldThumbnail"
          />

          <!-- گالری تصاویر -->
          <UtilsFileUploader
            label="تصاویر گالری محصول"
            name="images"
            :multiple="true"
            ownerType="product_gallery"
            v-model="form.images"
            :existing="existingImages"
            @remove-existing="onRemoveExistingImage"
          />
        </main>

        <!-- Sidebar Column (Right) -->
        <aside class="flex flex-col gap-5 basis-full lg:basis-5/12">
          <!-- دسته‌بندی و برند -->
          <CommonComponentCard title="دسته‌بندی و برند کالا">
            <CommonSelectInput
              v-model="form.categoryId"
              :options="categoryOptions"
              label="دسته‌بندی محصول"
              placeholder="انتخاب دسته‌بندی..."
              :show-create="{
                label: 'ایجاد دسته‌بندی جدید',
                href: '/category/create',
              }"
            />

            <CommonSelectInput
              v-model="form.brandId"
              :options="brandOptions"
              label="برند سازنده"
              placeholder="انتخاب برند..."
              :show-create="{
                label: 'ایجاد برند جدید',
                href: '/brand/create',
              }"
            />

            <CommonSelectInput
              v-if="subBrandOptions.length"
              v-model="form.subBrandId"
              :options="subBrandOptions"
              label="زیربرند (اختیاری)"
              placeholder="انتخاب زیربرند..."
            />
          </CommonComponentCard>

          <!-- قیمت و موجودی انبار -->
          <CommonComponentCard title="قیمت و موجودی">
            <CommonFormattedNumberInput
              v-model="form.price"
              label="قیمت اصلی (تومان)"
              placeholder="150,000"
              required
            />

            <CommonFormattedNumberInput
              v-model="form.priceDiscount"
              label="قیمت پس از تخفیف (تومان)"
              placeholder="120,000"
            />

            <div
              v-if="calculatedDiscountPercent > 0"
              class="flex items-center justify-between px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold"
            >
              <span>میزان تخفیف اعمال‌شده:</span>
              <span>{{ calculatedDiscountPercent }}٪ تخفیف</span>
            </div>

            <CommonFormattedNumberInput
              v-model="form.stock"
              label="موجودی انبار (تعداد)"
              placeholder="50"
              :disabled="form.type === 'variant'"
            />
          </CommonComponentCard>

          <!-- شناسه انبارداری و وضعیت شگفت‌انگیز -->
          <CommonComponentCard title="انبارداری و شگفت‌انگیز">
            <CommonCustomInput
              v-model="form.sku"
              label="شناسه SKU (کد انبارداری)"
              placeholder="NMR-PRD-001"
              required
            />

            <div class="space-y-3 pt-2">
              <CommonCheckboxInput
                :modelValue="form.isAmazingOffer"
                @update:modelValue="form.isAmazingOffer = !form.isAmazingOffer"
                label="قرارگیری در لیست تخفیف‌های شگفت‌انگیز"
              />

              <CommonCheckboxInput
                :modelValue="form.isAvailable"
                @update:modelValue="form.isAvailable = !form.isAvailable"
                label="محصول فعال و در دسترس خرید در سایت"
              />
            </div>
          </CommonComponentCard>

          <!-- مدیریت تنوع (واریانت‌ها) -->
          <CommonComponentCard title="تنوع کالا (رنگ یا سایز)">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <span class="text-sm font-medium text-gray-700">این محصول دارای تنوع رنگ است</span>
              <CommonToggleSwitch
                v-model="isVariantMode"
                label=""
                id="variants-toggle"
              />
            </div>

            <div v-if="isVariantMode" class="space-y-4 pt-3">
              <div class="space-y-2">
                <label class="text-xs font-semibold text-gray-700">انتخاب رنگ و نام فارسی:</label>
                <div class="flex items-center gap-3">
                  <ClientOnly>
                    <CommonColorPicker v-model="variantColorHex" />
                  </ClientOnly>
                  <span class="text-sm font-medium text-gray-700">
                    {{ detectedColorName || 'رنگ انتخابی' }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="variantStockInput"
                  type="number"
                  placeholder="موجودی این تنوع"
                  min="0"
                  class="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  v-model.number="variantPriceInput"
                  type="number"
                  placeholder="قیمت این تنوع (تومان)"
                  min="0"
                  class="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="button"
                @click="addVariant"
                class="w-full py-2 bg-brand-500 text-white rounded-lg text-xs font-medium hover:bg-brand-600 transition"
              >
                + افزودن این تنوع به لیست
              </button>

              <!-- جدول واریانت‌ها -->
              <div v-if="form.variants.length" class="overflow-x-auto border border-gray-200 rounded-lg">
                <table class="w-full text-xs text-right divide-y divide-gray-200">
                  <thead class="bg-gray-50 text-gray-600">
                    <tr>
                      <th class="p-2">رنگ</th>
                      <th class="p-2">نام رنگ</th>
                      <th class="p-2">موجودی</th>
                      <th class="p-2">قیمت</th>
                      <th class="p-2 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 bg-white">
                    <tr v-for="(v, idx) in form.variants" :key="idx">
                      <td class="p-2">
                        <span
                          class="inline-block w-5 h-5 rounded-full border border-gray-300 shadow-xs"
                          :style="{ backgroundColor: v.value || v.colorHex }"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          v-model="v.alt"
                          type="text"
                          class="w-24 px-1.5 py-1 border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          v-model.number="v.stock"
                          type="number"
                          class="w-16 px-1.5 py-1 border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          v-model.number="v.price"
                          type="number"
                          class="w-20 px-1.5 py-1 border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td class="p-2 text-center">
                        <button
                          type="button"
                          @click="removeVariant(idx)"
                          class="text-rose-500 hover:text-rose-700 p-1"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CommonComponentCard>
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { calculateDiscountPercentage, nearestPersianColorName } from '@nimoura/utils';
import type { CreateProductPayload } from '@nimoura/shared-types';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    productId?: number | string;
  }>(),
  {
    mode: 'create',
  },
);

const {
  getProductById,
  createProduct,
  updateProduct,
  fetchCategoryOptions,
  fetchBrandOptions,
} = useAdminProducts();

const form = reactive({
  title: '',
  englishTitle: '',
  introduce: '',
  howToUse: '',
  shortDescription: '',
  sku: '',
  type: 'simple' as 'simple' | 'variant',
  price: '0',
  priceDiscount: '0',
  stock: '1',
  categoryId: null as number | null,
  brandId: null as number | null,
  subBrandId: null as number | null,
  isAmazingOffer: false,
  isAvailable: true,
  thumbnail: null as string | null,
  images: [] as string[],
  specifications: [{ key: '', value: '' }],
  tags: [] as any[],
  variants: [] as any[],
});

const isVariantMode = computed({
  get: () => form.type === 'variant',
  set: (val: boolean) => {
    form.type = val ? 'variant' : 'simple';
  },
});

const existingThumbnailUrl = ref<string | null>(null);
const existingImages = ref<Array<{ id?: string | number; url: string }>>([]);
const imagesToDelete = ref<Array<string | number>>([]);
const removeOldThumbnail = ref(false);

const variantColorHex = ref('#B76E79');
const variantStockInput = ref(10);
const variantPriceInput = ref(0);

const detectedColorName = computed(() => {
  if (!variantColorHex.value) return '';
  return nearestPersianColorName(variantColorHex.value).name;
});

const calculatedDiscountPercent = computed(() => {
  const p = Number(form.price) || 0;
  const d = Number(form.priceDiscount) || 0;
  return calculateDiscountPercentage(p, d);
});

// گزینه‌های دسته‌بندی و برند
const categoryOptions = ref<any[]>([]);
const brandOptions = ref<any[]>([]);

const subBrandOptions = computed(() => {
  if (!form.brandId) return [];
  const selectedBrand = brandOptions.value.find((b: any) => b.id === form.brandId);
  return selectedBrand?.subBrands || [];
});

const { data: tagTypes } = await useFetch<any>('/api/tags/types');
const { data: tagTypesLabels } = await useFetch<any>('/api/tags/types-label');

onMounted(async () => {
  const [cats, brands] = await Promise.all([
    fetchCategoryOptions(),
    fetchBrandOptions(),
  ]);
  categoryOptions.value = cats;
  brandOptions.value = brands;

  if (props.mode === 'update' && props.productId) {
    const existing = await getProductById(props.productId);
    if (existing) {
      form.title = existing.title || '';
      form.englishTitle = existing.englishTitle || '';
      form.shortDescription = existing.shortDescription || '';
      form.introduce = existing.introduce || '';
      form.howToUse = existing.howToUse || '';
      form.sku = existing.sku || '';
      form.type = existing.variants?.length ? 'variant' : (existing.type as any) || 'simple';
      form.price = String(existing.price || 0);
      form.priceDiscount = String(existing.priceDiscount || 0);
      form.stock = String(existing.stock ?? 1);
      form.categoryId = existing.categoryId || existing.category?.id || null;
      form.brandId = existing.brandId || existing.brand?.id || null;
      form.subBrandId = existing.subBrandId || existing.subBrand?.id || null;
      form.isAmazingOffer = !!existing.isAmazingOffer;
      form.isAvailable = existing.isAvailable !== false;
      form.specifications = existing.specifications?.length
        ? existing.specifications
        : [{ key: '', value: '' }];
      form.tags = (existing.tags || []).map((t: any) => ({ name: t.name, type: t.type }));

      if (existing.thumbnail) {
        existingThumbnailUrl.value = existing.thumbnail;
      }
      if (existing.images?.length) {
        existingImages.value = existing.images.map((img: any) => ({
          id: img.id,
          url: img.url,
        }));
      }

      if (existing.variants?.length) {
        form.variants = existing.variants.map((v: any) => ({
          value: v.colorHex || v.value || '#000000',
          colorHex: v.colorHex || v.value || '#000000',
          colorName: v.colorName || v.alt || '',
          alt: v.alt || v.colorName || v.title || '',
          stock: v.stock || 0,
          price: v.price || Number(existing.price),
        }));
      }
    }
  }
});

function onRemoveOldThumbnail() {
  removeOldThumbnail.value = true;
  existingThumbnailUrl.value = null;
  form.thumbnail = null;
}

function onRemoveExistingImage(imageItem: { id?: string | number; url: string }) {
  if (imageItem.id) {
    imagesToDelete.value.push(imageItem.id);
  }
  existingImages.value = existingImages.value.filter((img) => img.url !== imageItem.url);
}

function addVariant() {
  if (!variantColorHex.value) return;

  const colorName = detectedColorName.value;
  const price = variantPriceInput.value > 0 ? variantPriceInput.value : Number(form.priceDiscount || form.price || 0);

  form.variants.push({
    value: variantColorHex.value,
    colorHex: variantColorHex.value,
    colorName,
    alt: colorName,
    stock: Number(variantStockInput.value) || 0,
    price,
  });
}

function removeVariant(index: number) {
  form.variants.splice(index, 1);
}

async function submitForm() {
  const payload: CreateProductPayload = {
    title: form.title.trim(),
    englishTitle: form.englishTitle?.trim() || undefined,
    shortDescription: form.shortDescription?.trim() || undefined,
    introduce: form.introduce || undefined,
    howToUse: form.howToUse || undefined,
    sku: form.sku.trim(),
    type: form.type,
    price: Number(form.price) || 0,
    priceDiscount: Number(form.priceDiscount) || 0,
    stock: form.type === 'variant' ? 0 : Number(form.stock) || 0,
    isAmazingOffer: form.isAmazingOffer,
    isAvailable: form.isAvailable,
    categoryId: Number(form.categoryId),
    brandId: Number(form.brandId),
    subBrandId: form.subBrandId ? Number(form.subBrandId) : null,
    thumbnail: form.thumbnail || undefined,
    images: form.images.length ? form.images : undefined,
    specifications: form.specifications.filter((s) => s.key && s.key.trim()),
    tags: form.tags,
    variants: form.type === 'variant' ? form.variants : [],
  };

  let success = false;
  if (props.mode === 'create') {
    success = await createProduct(payload);
  } else if (props.mode === 'update' && props.productId) {
    success = await updateProduct(props.productId, {
      ...payload,
      imagesToDelete: imagesToDelete.value,
      removeOldThumbnail: removeOldThumbnail.value,
    });
  }

  if (success) {
    await navigateTo('/product');
  }
}
</script>

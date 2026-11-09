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

    <div
      v-if="showErrors && formErrors.length"
      ref="errorBox"
      role="alert"
      class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
    >
      <p class="mb-2 font-bold">قبل از ذخیره، موارد زیر را اصلاح کنید:</p>
      <ul class="list-disc space-y-1 ps-5">
        <li v-for="error in formErrors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <form @submit.prevent="submitForm" class="space-y-8" id="product-form">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Column (Left) -->
        <main class="flex flex-col basis-full lg:basis-7/12 space-y-6 min-w-0">
          <ProductTypeSelector v-model="form.type" />

          <ProductVariantsEditor
            v-if="form.type === 'variant'"
            :kind="form.variantKind"
            :variants="form.variants"
            :summary="variantSummary"
            :show-errors="showErrors"
            :validate-variant="validateVariant"
            @update:kind="setVariantKind"
            @add="addVariant"
            @remove="removeVariant"
          />

          <ProductBundleEditor
            v-if="form.type === 'bundle'"
            :items="form.bundleItems"
            :bundle-price="Number(form.priceDiscount) > 0 ? Number(form.priceDiscount) : Number(form.price) || 0"
            :components-total="bundleComponentsTotal"
            :product-id="productId"
            :show-errors="showErrors"
            @add="addBundleItem"
            @remove="removeBundleItem"
          />

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
            required
          />

          <CommonTextArea
            v-model="form.shortDescription"
            label="توضیحات کوتاه محصول"
            placeholder="خلاصه‌ای از ویژگی‌ها و مشخصات کلیدی این کالا..."
            :rows="4"
          />

          <ProductTagSelector v-model="form.tagIds" />

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

          <!-- قیمت و موجودی -->
          <CommonComponentCard :title="form.type === 'bundle' ? 'قیمت و موجودی پک' : 'قیمت و موجودی'">
            <div
              v-if="form.type === 'variant'"
              class="space-y-2 rounded-xl bg-brand-50/60 p-3.5 text-xs leading-6 text-gray-700"
            >
              <p class="font-semibold text-brand-700">قیمت و موجودی از روی تنوع‌ها محاسبه می‌شود</p>
              <div class="flex items-center justify-between">
                <span>کمترین قیمت</span>
                <span class="font-bold">{{ variantSummary.min ? formatPrice(variantSummary.min) : '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>مجموع موجودی</span>
                <span class="font-bold">{{ toPersianDigits(variantSummary.stock) }}</span>
              </div>
            </div>

            <template v-else>
              <CommonFormattedNumberInput
                v-model="form.price"
                :label="form.type === 'bundle' ? 'قیمت اصلی پک (تومان)' : 'قیمت اصلی (تومان)'"
                placeholder="150,000"
                required
              />

              <CommonFormattedNumberInput
                v-model="form.priceDiscount"
                label="قیمت پس از تخفیف (تومان)"
                placeholder="120,000"
              />

              <div
                v-if="discountPercent > 0"
                class="flex items-center justify-between px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold"
              >
                <span>میزان تخفیف اعمال‌شده:</span>
                <span>{{ toPersianDigits(discountPercent) }}٪ تخفیف</span>
              </div>

              <CommonFormattedNumberInput
                v-model="form.stock"
                :label="form.type === 'bundle' ? 'موجودی پک (تعداد)' : 'موجودی انبار (تعداد)'"
                placeholder="50"
              />
            </template>

            <div class="space-y-1.5">
              <CommonFormattedNumberInput
                v-model="form.lowStockThreshold"
                label="آستانه هشدار کم‌موجودی"
                placeholder="5"
              />
              <p class="text-xs leading-5 text-gray-500">
                وقتی موجودی به این عدد یا کمتر برسد، روی محصول «تنها N عدد در انبار باقی مانده» نمایش داده می‌شود
                (۰ = غیرفعال).
              </p>
            </div>
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
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { formatPrice, toPersianDigits } from '@nimoura/utils';

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

const {
  form,
  discountPercent,
  variantSummary,
  bundleComponentsTotal,
  addVariant,
  removeVariant,
  setVariantKind,
  addBundleItem,
  removeBundleItem,
  validateVariant,
  validate,
  loadFromProduct,
  buildPayload,
} = useProductForm();

const showErrors = ref(false);
const formErrors = ref<string[]>([]);
const errorBox = ref<HTMLElement | null>(null);

const existingThumbnailUrl = ref<string | null>(null);
const existingImages = ref<Array<{ id?: string | number; url: string }>>([]);
const imagesToDelete = ref<Array<string | number>>([]);
const removeOldThumbnail = ref(false);

// گزینه‌های دسته‌بندی و برند
const categoryOptions = ref<any[]>([]);
const brandOptions = ref<any[]>([]);

const subBrandOptions = computed(() => {
  if (!form.brandId) return [];
  const selectedBrand = brandOptions.value.find((b: any) => b.id === form.brandId);
  return selectedBrand?.subBrands || [];
});


onMounted(async () => {
  const [cats, brands] = await Promise.all([fetchCategoryOptions(), fetchBrandOptions()]);
  categoryOptions.value = cats;
  brandOptions.value = brands;

  if (props.mode === 'update' && props.productId) {
    const existing = await getProductById(props.productId);
    if (!existing) return;

    loadFromProduct(existing);

    if (existing.thumbnail) existingThumbnailUrl.value = existing.thumbnail;
    if (existing.images?.length) {
      existingImages.value = existing.images.map((img: any) => ({ id: img.id, url: img.url }));
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

async function submitForm() {
  formErrors.value = validate();
  showErrors.value = true;

  if (formErrors.value.length) {
    await nextTick();
    errorBox.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = buildPayload();

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

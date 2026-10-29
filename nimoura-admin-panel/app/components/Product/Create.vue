<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '/products' },
        { label: 'افزودن محصول', href: '' },
      ]"
      title="ایجاد محصول جدید"
      subtitle="افزودن محصول جدید به فروشگاه"
      publish-label="انتشار محصول"
      discard-label="انصراف"
      form="create-product"
      @discard="() => navigateTo('/product')"
    />

    <form @submit.prevent="submitForm" class="space-y-8" id="create-product">
      <div class="flex gap-5">
        <!-- main -->
        <main class="flex flex-col basis-4/6">
          <main class="space-y-8">
            <CommonCustomInput
              v-model="createProductInputs.title"
              label="نام / عنوان محصول"
              placeholder="رژ لب این لی"
            />

            <CommonCustomInput
              v-model="createProductInputs.englishTitle"
              label="نام / عنوان انگلیسی محصول"
              placeholder="in lay rozh"
            />

            <CommonTextArea
              v-model="createProductInputs.shortDescription"
              label="توضیحات کوتاه محصول"
              placeholder="توضیحاتی کوتاه درباره این محصول وارد کنید..."
              :rows="5"
            />

            <UtilsTagEditor
              v-model="createProductInputs.tags"
              :types="tagTypes.data"
              :typeLabels="tagTypesLabels.data"
              api-base="/api/tags"
              label="تگ‌های محصول"
            />

            <!-- <ProductRichTextEditor
              v-model="createProductInputs.introduce"
              label="معرفی محصول"
            />
            <ProductRichTextEditor
              v-model="createProductInputs.howToUse"
              label="نحوه مصرف"
            /> -->

            <UtilsSpecificationsInputs
              v-model="createProductInputs.specifications"
            />

            <!-- تصویر شاخص -->
            <UtilsFileUploader
              label="تصویر شاخص"
              name="thumbnail"
              :multiple="false"
              ownerType="product_thumbnail"
              v-model="createProductInputs.thumbnail"
            />

            <!-- گالری تصاویر -->
            <UtilsFileUploader
              label="تصاویر گالری محصول"
              name="images"
              :multiple="true"
              ownerType="product_gallery"
              v-model="createProductInputs.images"
            />
          </main>
        </main>

        <!-- details -->
        <div class="flex flex-col gap-5 basis-4/12">
          <CommonComponentCard title="انتخاب دسته بندی و برند">
            <CommonSelectInput
              v-model="createProductInputs.categoryId"
              :options="categories.data.categories"
              label="دسته‌بندی محصول"
              placeholder="جستجو در دسته‌بندی‌ها..."
              :show-create="{
                label: 'ایجاد دسته بندی',
                href: '/category/create',
              }"
            />

            <CommonSelectInput
              v-model="createProductInputs.brandId"
              :options="brands.data.brands"
              label="انتخاب برند"
              placeholder="جستجو در برندها..."
              :show-create="{
                label: 'ایجاد برند',
                href: '/brand/create',
              }"
            />

            <CommonSelectInput
              v-model="createProductInputs.subBrandId"
              :options="subBrands"
              v-if="createProductInputs.brandId"
              label="انتخاب زیر برند"
              placeholder="جستجو در زیر برندها..."
            />
          </CommonComponentCard>

          <CommonComponentCard title="قیمت و تخفیف و تعداد">
            <CommonFormattedNumberInput
              v-model="createProductInputs.price"
              label="قیمت محصول"
              placeholder="150000"
            />
            <CommonFormattedNumberInput
              v-model="createProductInputs.priceDiscount"
              label="قیمت تخفیف خورده"
              placeholder="100000"
            />
            <CommonFormattedNumberInput
              v-model="createProductInputs.stock"
              label="تعداد موجودی"
              placeholder="200"
            />
          </CommonComponentCard>

          <CommonComponentCard title="SKU And Amazing">
            <CommonCustomInput
              v-model="createProductInputs.sku"
              label="SKU (Stock Keeping Unit)"
              placeholder="NMR-CRM-WH-001"
            />

            <CommonCheckboxInput
              :modelValue="createProductInputs.isAmazingOffer"
              @update:modelValue="
                () =>
                  (createProductInputs.isAmazingOffer =
                    !createProductInputs.isAmazingOffer)
              "
              label="افزودن این محصول به محصولات شگفت انگیز"
            />
          </CommonComponentCard>

          <CommonComponentCard title="محصول با تنوع مختلف است؟">
            <CommonSelectInput
              v-model="selectedId"
              :options="variants"
              label="نوع تنوع"
              placeholder="جستجو در زیر تنوع ها..."
              :disabled="!createProductInputs.type"
            />

            <ClientOnly>
              <CommonColorPicker
                v-model="selectedColor"
                :disabled="!createProductInputs.type"
              />
            </ClientOnly>

            <CommonToggleSwitch
              class="absolute left-2 top-5"
              v-model="createProductInputs.type"
              label=""
              id="variants"
              :disabled="false"
            />
          </CommonComponentCard>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const toast = useToast();
const { isLoading } = useLoading();

const createProductInputs = reactive({
  title: "",
  englishTitle: "",
  introduce: "",
  sku: "",
  howToUse: "",
  shortDescription: "",
  price: "0",
  stock: "1",
  priceDiscount: "0",
  categoryId: null as any,
  brandId: null as any,
  subBrandId: null as any,
  type: false,
  specifications: [{ key: "", value: "" }] as any,
  tags: [] as any,
  variants: [] as any,
  thumbnail: null as string | null, // نگهداری URL تصویر شاخص
  images: [] as string[], // نگهداری URLهای گالری
  isAmazingOffer: false as any,
});

const selectedColor = ref("#ff0000");
const selectedId = ref(1);

const variants = [{ id: 1, name: "رنگ" }];

const { data: categories }: any = await useFetch("/api/category/list", {
  query: {
    limit: 100,
  },
});
const { data: brands }: any = await useFetch("/api/product/brand/list", {
  query: {
    limit: 100,
  },
});

const subBrands = computed(() => {
  const brandList = brands.value?.data?.brands || [];
  const brand = brandList.find(
    (b: any) => b.id === createProductInputs.brandId,
  );

  return brand?.subBrands || [];
});

async function submitForm() {
  isLoading.value = true;

  try {
    // ساخت پی‌لود JSON خالص بدون نیاز به FormData
    const payload = {
      isAmazingOffer: !!createProductInputs.isAmazingOffer,
      title: createProductInputs.title || "",
      englishTitle: createProductInputs.englishTitle || "",
      introduce: createProductInputs.introduce || "",
      shortDescription: createProductInputs.shortDescription || "",
      sku: createProductInputs.sku || "",
      type: createProductInputs.type ? "variant" : "simple",
      specifications: createProductInputs.specifications || [],
      tags: createProductInputs.tags || [],
      categoryId: createProductInputs.categoryId
        ? Number(createProductInputs.categoryId)
        : null,
      brandId: createProductInputs.brandId
        ? Number(createProductInputs.brandId)
        : null,
      subBrandId: createProductInputs.subBrandId
        ? Number(createProductInputs.subBrandId)
        : null,
      price: Number(createProductInputs.price || 0),
      priceDiscount: Number(createProductInputs.priceDiscount || 0),
      stock: Number(createProductInputs.stock || 1),
      howToUse: createProductInputs.howToUse || "",
      variants: createProductInputs.type
        ? createProductInputs.variants || []
        : [],

      // ارسال لینک‌های تصویر شاخص و گالری که قبلاً از آپلودر مجزا دریافت شده‌اند
      thumbnail: createProductInputs.thumbnail,
      images: createProductInputs.images,
    };

    // ارسال به روت سرور Nuxt (یا مسیر دلخواه ادمین)
    const data: any = await $fetch("/api/products/create", {
      method: "POST",
      body: payload,
    });

    toast.add({
      severity: "success",
      summary: "موفقیت",
      detail: data?.message || "محصول با موفقیت ایجاد شد",
      life: 3000,
    });

    navigateTo("/products");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "خطا",
      detail:
        error?.data?.message ||
        error?.statusMessage ||
        "مشکلی در ایجاد محصول رخ داده است!",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}

const { data: tagTypes }: any = await useFetch("/api/tags/types");
const { data: tagTypesLabels }: any = await useFetch("/api/tags/types-label");
</script>

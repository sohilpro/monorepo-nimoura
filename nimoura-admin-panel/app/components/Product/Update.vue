<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '/products' },
        { label: 'ویرایش محصول', href: '' },
      ]"
      title="ویرایش محصول"
      subtitle="تغییر مقادیر محصول"
      publish-label="انتشار محصول"
      discard-label="انصراف"
      form="update-product"
      @discard="() => navigateTo('/product')"
    />

    <form @submit.prevent="submitForm" class="space-y-8" id="update-product">
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
              :types="tagTypes?.data || []"
              :typeLabels="tagTypesLabels?.data || []"
              api-base="/api/tags"
              label="تگ‌های محصول"
            />

            <ProductRichTextEditor
              v-model="createProductInputs.introduce"
              label="معرفی محصول"
            />

            <ProductRichTextEditor
              v-model="createProductInputs.howToUse"
              label="نحوه مصرف"
            />

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
              :existing="
                existingThumbnailUrl ? [{ url: existingThumbnailUrl }] : []
              "
              @remove-existing="onRemoveOldThumbnail"
            />

            <!-- تصاویر گالری محصول -->
            <UtilsFileUploader
              label="تصاویر محصول"
              name="images"
              :multiple="true"
              ownerType="product_gallery"
              v-model="createProductInputs.images"
              :existing="existingImages"
              @remove-existing="onRemoveExistingImage"
            />
          </main>
        </main>

        <!-- details -->
        <div class="flex flex-col gap-5 basis-4/12">
          <CommonComponentCard title="انتخاب دسته بندی و برند">
            <CommonSelectInput
              v-model="createProductInputs.categoryId"
              :options="categories?.data?.categories || []"
              label="دسته‌بندی محصول"
              placeholder="جستجو در دسته‌بندی‌ها..."
              :show-create="{
                label: 'ایجاد دسته بندی',
                href: '/category/create',
              }"
            />

            <CommonSelectInput
              v-model="createProductInputs.brandId"
              :options="brands?.data?.brands || []"
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

          <CommonComponentCard title="SKU and Amazing">
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
            <!-- انتخاب نوع تنوع -->
            <CommonSelectInput
              v-model="selectedId"
              :options="variantsOptions"
              label="نوع تنوع"
              placeholder="جستجو در زیر تنوع ها..."
              :disabled="!createProductInputs.type"
            />

            <!-- انتخاب رنگ -->
            <ClientOnly>
              <CommonColorPicker
                v-model="selectedColor"
                :disabled="!createProductInputs.type"
              />
            </ClientOnly>

            <!-- سوییچ برای انتخاب حالت ساده/واریانت -->
            <CommonToggleSwitch
              class="absolute left-2 top-5"
              v-model="createProductInputs.type"
              label=""
              id="variants"
              :disabled="false"
            />

            <!-- دکمه افزودن تنوع -->
            <button
              v-if="createProductInputs.type"
              @click="addVariant"
              class="bg-blue-500 text-white rounded px-4 py-2 mt-4"
              type="button"
            >
              افزودن تنوع
            </button>

            <!-- جدول نمایش تنوع‌ها -->
            <table
              v-if="
                createProductInputs.variants.length && createProductInputs.type
              "
              class="w-full border mt-4 text-sm"
            >
              <thead>
                <tr>
                  <th class="border px-2 py-1">ردیف</th>
                  <th class="border px-2 py-1">رنگ</th>
                  <th class="border px-2 py-1">alt</th>
                  <th class="border px-2 py-1">موجودی</th>
                  <th class="border px-2 py-1">عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(v, idx) in createProductInputs.variants" :key="idx">
                  <td class="border px-2 py-1">{{ idx + 1 }}</td>
                  <td class="border px-2 py-1">
                    <span
                      class="inline-block w-6 h-6 rounded-full border"
                      :style="{ background: v.value }"
                    />
                  </td>
                  <td class="border px-2 py-1">
                    <input
                      v-model="v.alt"
                      type="text"
                      class="border px-2 py-1 w-20"
                    />
                  </td>
                  <td class="border px-2 py-1">
                    <input
                      v-model.number="v.stock"
                      type="number"
                      class="border px-2 py-1 w-20"
                    />
                  </td>
                  <td class="border px-2 py-1">
                    <button @click="removeVariant(idx)" class="text-red-500">
                      حذف
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CommonComponentCard>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

const route = useRoute();
const toast = useToast();
const { isLoading } = useLoading();

const productId = route.params.slug;

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
  variants: [] as {
    value: string;
    price: number;
    stock: number;
    alt: string;
  }[],
  thumbnail: null as string | null,
  images: [] as string[],
  isAmazingOffer: false as any,
});

const existingThumbnailUrl = ref<string | null>(null);
const existingImages = ref<{ id?: string | number; url: string }[]>([]);

const imagesToDelete = ref<(string | number)[]>([]);
const removeOldThumbnail = ref(false);

// دریافت اطلاعات محصول جهت ویرایش
onMounted(async () => {
  try {
    const productResponse: any = await $fetch(
      `/api/products/${productId}`,
    );

    if (productResponse?.success && productResponse.data) {
      const p = productResponse.data;

      createProductInputs.title = p.title || "";
      createProductInputs.englishTitle = p.englishTitle || "";
      createProductInputs.introduce = p.introduce || "";
      createProductInputs.sku = p.sku || "";
      createProductInputs.howToUse = p.howToUse || "";
      createProductInputs.shortDescription = p.shortDescription || "";
      createProductInputs.isAmazingOffer = p.isAmazingOffer || false;
      createProductInputs.price = String(p.price ?? "0");
      createProductInputs.stock = String(p.stock ?? "1");
      createProductInputs.priceDiscount = String(p.priceDiscount ?? "0");
      createProductInputs.categoryId = p.category?.id ?? null;
      createProductInputs.brandId = p.brand?.id ?? null;
      createProductInputs.subBrandId = p.subBrand?.id ?? null;
      createProductInputs.type = p.type !== "simple";
      createProductInputs.specifications = p.specifications?.length
        ? p.specifications
        : [{ key: "", value: "" }];
      createProductInputs.tags = p.tags ?? [];
      createProductInputs.variants = p.variants ?? [];

      existingThumbnailUrl.value = p.thumbnail ?? null;
      existingImages.value = Array.isArray(p.images)
        ? p.images.map((img: any) => ({ id: img.id, url: img.url }))
        : [];

      createProductInputs.thumbnail = p.thumbnail ?? null;
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "خطا",
      detail: "دریافت اطلاعات محصول با خطا مواجه شد",
      life: 4000,
    });
  }
});

function onRemoveOldThumbnail() {
  removeOldThumbnail.value = true;
  existingThumbnailUrl.value = null;
  createProductInputs.thumbnail = null;
}

function onRemoveExistingImage(item: { id?: string | number; url: string }) {
  if (item.id) {
    imagesToDelete.value.push(item.id);
  }
  existingImages.value = existingImages.value.filter((i) => i.url !== item.url);
}

const selectedColor = ref("#ff0000");
const selectedId = ref<any>(1);
const variantsOptions = [{ id: 1, name: "رنگ" }];

const { data: categories }: any = await useFetch("/api/category/list", {
  query: { limit: 100 },
});
const { data: brands }: any = await useFetch("/api/product/brand/list", {
  query: { limit: 100 },
});

const subBrands = computed(() => {
  const brandList = brands.value?.data?.brands || [];
  const brand = brandList.find(
    (b: any) => b.id === createProductInputs.brandId,
  );
  return brand?.subBrands || [];
});

function addVariant() {
  if (!selectedColor.value) return;

  createProductInputs.variants.push({
    value: selectedColor.value,
    price: Number(createProductInputs.priceDiscount || 0),
    stock: 0,
    alt: createProductInputs.title || "",
  });

  selectedColor.value = "#ff0000";
}

function removeVariant(idx: number) {
  createProductInputs.variants.splice(idx, 1);
}

// ارسال فرم ویرایش به صورت JSON خالص
async function submitForm() {
  isLoading.value = true;

  try {
    const payload = {
      isAmazingOffer: !!createProductInputs.isAmazingOffer,
      title: createProductInputs.title || "",
      englishTitle: createProductInputs.englishTitle || "",
      introduce: createProductInputs.introduce || "",
      shortDescription: createProductInputs.shortDescription || "",
      sku: createProductInputs.sku || "",
      type: createProductInputs.type ? "variant" : "simple",
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
      specifications: createProductInputs.specifications ?? [],
      tags: createProductInputs.tags ?? [],
      variants: createProductInputs.type
        ? (createProductInputs.variants ?? [])
        : [],

      imagesToDelete: imagesToDelete.value ?? [],
      removeOldThumbnail: removeOldThumbnail.value,
      thumbnail: createProductInputs.thumbnail,
      images: createProductInputs.images,
    };

    const data: any = await $fetch(`/api/products/${productId}`, {
      method: "PUT",
      body: payload,
    });

    toast.add({
      severity: "success",
      summary: "موفقیت",
      detail: data?.message ?? "محصول با موفقیت ویرایش شد.",
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
        "مشکلی در ویرایش محصول رخ داده است!",
      life: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}

const { data: tagTypes }: any = await useFetch("/api/tags/types");
const { data: tagTypesLabels }: any = await useFetch("/api/tags/types-label");
</script>
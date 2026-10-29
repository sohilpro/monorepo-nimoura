<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'بنرها', href: '/banners' },
        { label: 'ویرایش بنر', href: '' },
      ]"
      title="ویرایش بنر"
      subtitle="تغییر مقادیر بنر"
      publish-label="ذخیره بنر"
      discard-label="انصراف"
      form="update-banner"
      @discard="() => navigateTo('/banners')"
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
              :types="tagTypes.data"
              :typeLabels="tagTypesLabels.data"
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

            <UtilsFileUploader
              label="تصویر شاخص"
              name="thumbnail"
              :multiple="false"
              :accept="['image/png', 'image/jpeg']"
              v-model="newThumbnailFile"
              :existing="
                existingThumbnailUrl ? [{ url: existingThumbnailUrl }] : []
              "
              @remove-existing="onRemoveOldThumbnail"
            />

            <!-- Gallery (چند‌فایل) -->
            <UtilsFileUploader
              label="تصاویر محصول"
              name="images"
              :multiple="true"
              :accept="['image/*']"
              v-model="newImageFiles"
              :existing="existingImages"
              @remove-existing="onRemoveExistingImage"
            />
            <!-- <UtilsFileUploader
              label="تصویر شاخص"
              name="thumbnail"
              :multiple="false"
              :accept="['image/png', 'image/jpeg']"
              v-model="createProductInputs.thumbnail"
            />

            <UtilsFileUploader
              label="تصاویر محصول"
              name="images"
              :multiple="true"
              v-model="createProductInputs.images"
            /> -->
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
            <CommonSelectInput
              v-model="selectedId"
              :options="variants"
              label="نوع تنوع"
              placeholder="جستجو در زیر تنوع ها..."
              :disabled="createProductInputs.type"
            />

            <ClientOnly>
              <CommonColorPicker
                :disabled="createProductInputs.type"
                v-model="selectedColor"
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
const route = useRoute();

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
  thumbnail: null as File | null,
  images: [] as File[],
  isAmazingOffer: false as any,
});

const existingThumbnailUrl = ref<string | null>(null); // از بک‌اند
const existingImages = ref<{ id?: string | number; url: string }[]>([]); // از بک‌اند

const newThumbnailFile = ref<File | null>(null); // آپلود جدید
const newImageFiles = ref<File[]>([]); // آپلودهای جدید

const imagesToDelete = ref<(string | number)[]>([]); // IDهای تصاویری که کاربر حذف می‌کند
const removeOldThumbnail = ref(false);

onMounted(async () => {
  const { data: productResponse }: any = await useFetch("/api/product/getOne", {
    query: { id: route.params.slug },
  });

  // چون داده داخل productResponse.value.data هست
  if (productResponse.value?.success && productResponse.value.data) {
    const p = productResponse.value.data.data;

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
    createProductInputs.categoryId = p.category.id ?? null;
    createProductInputs.brandId = p.brand.id ?? null;
    createProductInputs.subBrandId = p.subBrand.id ?? null;
    createProductInputs.type = p.type == "simple" ? false : true;
    createProductInputs.specifications = p.specifications?.length
      ? p.specifications
      : [{ key: "", value: "" }];
    createProductInputs.tags = p.tags ?? [];
    createProductInputs.variants = p.variants ?? [];
    // اینجا thumbnail و images رو از بک‌اند می‌گیریم ولی چون فایل نیستند باید برای آپدیت از URL استفاده کنیم
    createProductInputs.thumbnail = null;
    createProductInputs.images = [];

    // تصاویر:
    existingThumbnailUrl.value = p.thumbnail ?? null;
    // اگر بک‌اند ID برای هر تصویر می‌دهد، بهتره نگه‌داریم تا حذف دقیق باشد

    existingImages.value = Array.isArray(p.images)
      ? p.images.map((img: any) => ({ id: img.id, url: img.url }))
      : [];
  }
});

function onRemoveOldThumbnail() {
  removeOldThumbnail.value = true;
  existingThumbnailUrl.value = null;
}

function onRemoveExistingImage(item: { id?: string | number; url: string }) {
  imagesToDelete.value.push(item.id ?? item.url);
  existingImages.value = existingImages.value.filter((i) => i !== item);
}

const selectedColor = ref("#ff0000");
const selectedId = ref(null);
const { isLoading } = useLoading();

const variants = [{ id: 1, title: "رنگ" }];

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
  const brand = brands.value.data.brands.find(
    (b: any) => b.id === createProductInputs.brandId
  );

  return brand?.subBrands || [];
});

async function submitForm() {
  const fd = new FormData();

  // متنی ساده (با گارد و String)
  fd.append("isAmazingOffer", createProductInputs.isAmazingOffer ? "1" : "0");

  if (createProductInputs.title) fd.append("title", createProductInputs.title);
  if (createProductInputs.englishTitle)
    fd.append("englishTitle", createProductInputs.englishTitle);
  if (createProductInputs.introduce)
    fd.append("introduce", createProductInputs.introduce);
  if (createProductInputs.shortDescription)
    fd.append("shortDescription", createProductInputs.shortDescription);
  if (createProductInputs.sku) fd.append("sku", createProductInputs.sku);
  fd.append("type", createProductInputs.type ? "variant" : "simple");

  if (createProductInputs.categoryId != null)
    fd.append("categoryId", String(createProductInputs.categoryId));
  if (createProductInputs.brandId != null)
    fd.append("brandId", String(createProductInputs.brandId));
  if (createProductInputs.subBrandId != null)
    fd.append("subBrandId", String(createProductInputs.subBrandId));

  if (createProductInputs.price != null)
    fd.append("price", String(createProductInputs.price));
  if (createProductInputs.priceDiscount != null)
    fd.append("priceDiscount", String(createProductInputs.priceDiscount));
  if (createProductInputs.stock != null)
    fd.append("stock", String(createProductInputs.stock));
  if (createProductInputs.howToUse)
    fd.append("howToUse", createProductInputs.howToUse);

  // JSON fields
  fd.append(
    "specifications",
    JSON.stringify(createProductInputs.specifications ?? [])
  );
  fd.append("tags", JSON.stringify(createProductInputs.tags ?? []));
  if (createProductInputs.type) {
    fd.append("variants", JSON.stringify(createProductInputs.variants ?? []));
  }

  // حذف‌ها و فلگ‌ها (مختص آپدیت)
  fd.append("imagesToDelete", JSON.stringify(imagesToDelete.value ?? []));
  if (removeOldThumbnail.value) {
    fd.append("removeOldThumbnail", "true");
  }

  // فایل‌ها
  if (newThumbnailFile.value) fd.append("thumbnail", newThumbnailFile.value);
  for (const f of newImageFiles.value) fd.append("images", f);

  isLoading.value = true;
  try {
    // توجه: مسیر آپدیت‌ پروکسیِ خودت
    const data: any = await $fetch(
      `/api/product/update?id=${route.params.slug}`,
      {
        method: "PUT",
        body: fd,
      }
    );

    useToast().success({ message: data?.message ?? "به‌روزرسانی انجام شد." });
    navigateTo("/product");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "مشکلی رخ داده!",
    });
  } finally {
    isLoading.value = false;
  }
}

const { data: tagTypes }: any = await useFetch("/api/tags/types");
const { data: tagTypesLabels }: any = await useFetch("/api/tags/types-label");
</script>

<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'بنرها', href: '/banners' },
        { label: 'افزودن بنر', href: '' },
      ]"
      title="ایجاد بنر جدید"
      subtitle="افزودن بنر جدید به فروشگاه"
      publish-label="انتشار بنر"
      discard-label="انصراف"
      form="create-banner"
      @discard="() => navigateTo('/banners')"
    />

    <form @submit.prevent="submitForm" class="space-y-8" id="create-banner">
      <div class="flex gap-5">
        <!-- main -->
        <main class="flex flex-col basis-4/6">
          <main class="space-y-8">
            <CommonCustomInput
              v-model="createBannerInputs.title"
              label="نام / عنوان محصول"
              placeholder="رژ لب این لی"
            />

            <UtilsFileUploader
              label="بنر دسکتاپ"
              name="b-desktop"
              :multiple="false"
              :accept="['image/png', 'image/jpeg']"
              v-model="createBannerInputs.desktop"
            />

            <UtilsFileUploader
              label="بنر موبایل"
              name="b-mobile"
              :multiple="false"
              :accept="['image/png', 'image/jpeg']"
              v-model="createBannerInputs.mobile"
            />
            <UtilsFileUploader
              label="بنر تبلت (اختیاری)"
              name="b-tablet"
              :multiple="false"
              :accept="['image/png', 'image/jpeg']"
              v-model="createBannerInputs.tablet"
            />
          </main>
        </main>

        <!-- details -->
        <div class="flex flex-col gap-5 basis-4/12">
          <CommonComponentCard title="انتخاب دسته بندی و برند">
            <CommonToggleSwitch
              class="flex-row-reverse justify-between"
              v-model="createBannerInputs.categorOrBrand"
              :label="toggleLabel"
              id="variants"
              :disabled="false"
            />

            <CommonSelectInput
              v-if="createBannerInputs.categorOrBrand"
              v-model="createBannerInputs.categoryId"
              :options="categories.data.categories"
              label="دسته‌بندی محصول"
              placeholder="جستجو در دسته‌بندی‌ها..."
              :show-create="{
                label: 'ایجاد دسته بندی',
                href: '/category/create',
              }"
            />

            <CommonSelectInput
              v-else
              v-model="createBannerInputs.brandId"
              :options="brands.data.brands"
              label="انتخاب برند"
              placeholder="جستجو در برندها..."
              :show-create="{
                label: 'ایجاد برند',
                href: '/brand/create',
              }"
            />
            <CommonSelectInput
              v-model="createBannerInputs.position"
              :options="positionItem"
              label="انتخاب موقعیت بنر"
              placeholder="جستجو در پوزیشن ها..."
            />

            <pre>
            {{ createBannerInputs }}
           </pre
            >
          </CommonComponentCard>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const positionItem = ref([
  { id: "MAIN_PAGE_TOP", name: "MAIN_PAGE_TOP" },
  { id: "MAIN_PAGE_MIDDLE", name: "MAIN_PAGE_MIDDLE" },
  { id: "CATEGORY_SIDEBAR", name: "CATEGORY_SIDEBAR" },
  { id: "PRODUCT_PAGE_BOTTOM", name: "PRODUCT_PAGE_BOTTOM" },
]);

const createBannerInputs = reactive({
  title: "",
  categoryId: null as any,
  brandId: null as any,
  desktop: [] as File[] | any,
  mobile: null as File[] | any,
  tablet: null as File[] | any,
  position: "",
  categorOrBrand: false,
  isActive: true,
});

const toggleLabel = computed(() => {
  return createBannerInputs.categorOrBrand ? "براساس دسته‌بندی" : "براساس برند";
});

const { isLoading } = useLoading();

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

async function submitForm() {
  const formData = new FormData();

  formData.append("title", createBannerInputs.title);

  formData.append("position", createBannerInputs.position);

  if (createBannerInputs.categoryId) {
    formData.append("categoryId", createBannerInputs.categoryId);
  }
  if (createBannerInputs.brandId) {
    formData.append("brandId", createBannerInputs.brandId);
  }
  if (createBannerInputs.desktop) {
    formData.append("desktop", createBannerInputs.desktop);
  }
  if (createBannerInputs.mobile) {
    formData.append("mobile", createBannerInputs.mobile);
  }
  if (createBannerInputs.tablet) {
    formData.append("tablet", createBannerInputs.tablet);
  }

  isLoading.value = true;

  try {
    const data: any = await $fetch("/api/banner/create", {
      method: "POST",
      body: formData,
    });

    useToast().success({
      message: data.data.message,
    });
    navigateTo("/banners");
  } catch (error: any) {
    useToast().error({
      message: error?.data?.data?.message || "مشکلی رخ داده!",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

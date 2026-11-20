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

const toast = useAppToast();
const { data: categories } = useAdminCategoriesList();
const { data: authors } = useAdminAuthorsList();
const { data: tags } = useAdminTagsList();

const statusOptions = [
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشرشده", value: "published" },
  { label: "بایگانی", value: "archived" },
];

const form = reactive<ArticleFormPayload & { faqs: Array<{ question: string; answer: string }> }>({
  title: props.initial?.title ?? "",
  summary: props.initial?.summary ?? "",
  content: props.initial?.content ?? "",
  coverImage: props.initial?.coverImage ?? "",
  coverImageAlt: props.initial?.coverImageAlt ?? "",
  status: (props.initial?.status as ArticleStatus) ?? "draft",
  isFeatured: props.initial?.isFeatured ?? false,
  authorId: (props.initial?.author as any)?.id ?? null,
  categoryId: (props.initial?.category as any)?.id ?? null,
  tagIds: props.initial?.tags?.map((t: any) => t.id) ?? [],
  relatedProductIds: (props.initial?.relatedProductIds ?? []).map(String),
  faqs: (props.initial as any)?.faqs
    ? JSON.parse(JSON.stringify((props.initial as any).faqs))
    : [],
  metaTitle: props.initial?.metaTitle ?? "",
  metaDescription: props.initial?.metaDescription ?? "",
  metaKeywords: props.initial?.metaKeywords ?? "",
});

const errors = reactive<Record<string, string>>({});

// ---------- مدیریت سوالات متداول (FAQ) ----------
function addFaq() {
  form.faqs.push({ question: "", answer: "" });
}

function removeFaq(index: number) {
  form.faqs.splice(index, 1);
}

// ---------- مدیریت محصولات مرتبط / اسلایدر ----------
const productSearchQuery = ref("");
const searchingProducts = ref(false);
const searchedProducts = ref<any[]>([]);
const selectedProductDetails = ref<any[]>([]);

let productSearchTimer: ReturnType<typeof setTimeout>;
function onSearchProductInput() {
  clearTimeout(productSearchTimer);
  if (!productSearchQuery.value.trim()) {
    searchedProducts.value = [];
    return;
  }
  productSearchTimer = setTimeout(async () => {
    searchingProducts.value = true;
    try {
      const res: any = await $fetch("/api/product", {
        query: { search: productSearchQuery.value.trim(), limit: 8 },
      });
      const data = res?.data ?? res;
      searchedProducts.value = data?.items ?? data?.products ?? [];
    } catch {
      searchedProducts.value = [];
    } finally {
      searchingProducts.value = false;
    }
  }, 350);
}

function addRelatedProduct(product: any) {
  const pid = String(product.id);
  const currentIds = form.relatedProductIds ?? [];
  if (!currentIds.includes(pid)) {
    form.relatedProductIds = [...currentIds, pid];
    if (!selectedProductDetails.value.some((p) => String(p.id) === pid)) {
      selectedProductDetails.value.push(product);
    }
    toast.add({ severity: "success", summary: "محصول اضافه شد", life: 1500 });
  }
  productSearchQuery.value = "";
  searchedProducts.value = [];
}

function removeRelatedProduct(pid: string) {
  form.relatedProductIds = (form.relatedProductIds ?? []).filter((id) => id !== pid);
  selectedProductDetails.value = selectedProductDetails.value.filter(
    (p) => String(p.id) !== pid
  );
}

// اگر مقاله از قبل محصول داشت، اطلاعات آنها را لود می‌کنیم
onMounted(async () => {
  if (form.relatedProductIds && form.relatedProductIds.length > 0) {
    try {
      const res: any = await $fetch("/api/product", {
        query: { ids: form.relatedProductIds.join(","), limit: 20 },
      });
      const data = res?.data ?? res;
      selectedProductDetails.value = data?.items ?? data?.products ?? [];
    } catch {
      // نادیده گرفتن خطا
    }
  }
});

function insertSliderIntoContent() {
  const ids = form.relatedProductIds ?? [];
  if (ids.length === 0) {
    toast.add({
      severity: "warn",
      summary: "ابتدا حداقل یک محصول انتخاب کنید",
      life: 2500,
    });
    return;
  }
  const cleanIds = ids.join(",");
  const sliderSnippet = `<div class="nimoura-product-slider my-8 p-4 rounded-2xl bg-nimoura-base/60 border border-nimoura-border/40" data-ids="${cleanIds}" data-title="محصولات پیشنهادی این بخش"><p class="text-sm font-bold text-nimoura-velvet mb-2">🛍️ محصولات پیشنهادی (شناسه‌ها: ${cleanIds})</p></div><p></p>`;
  form.content = (form.content || "") + sliderSnippet;
  toast.add({
    severity: "success",
    summary: "کد اسلایدر به انتهای متن اضافه شد",
    life: 2000,
  });
}

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
  // تمیزکاری سوالات متداول خالی
  const cleanFaqs = (form.faqs || []).filter(
    (f) => f.question.trim() && f.answer.trim()
  );
  emit("submit", {
    ...form,
    faqs: cleanFaqs,
  });
}

function onRemoveCover() {
  form.coverImage = "";
}

const summaryLength = computed(() => form.summary.length);
const categoriesList = computed(() => {
  const raw = categories.value;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
});

const authorsList = computed(() => {
  const raw = authors.value;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
});
</script>

<template>
  <form
    class="grid grid-cols-1 gap-6 lg:grid-cols-3"
    @submit.prevent="handleSubmit"
  >
    <!-- ستون اصلی (محتوا، تیتر، جدول، محصولات، سوالات متداول) -->
    <div class="space-y-6 lg:col-span-2">
      <!-- عنوان مقاله -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <label class="mb-1.5 block text-sm font-bold text-gray-700">عنوان مقاله</label>
        <InputText
          v-model="form.title"
          class="w-full text-base font-medium"
          placeholder="مثلا: فرق تینت لب و شیدینگ لب چیست؟ کدام بهتر است؟"
        />
        <p v-if="errors.title" class="mt-1 text-xs text-red-500">
          {{ errors.title }}
        </p>
      </div>

      <!-- خلاصه مقاله -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div class="mb-1.5 flex items-center justify-between">
          <label class="block text-sm font-bold text-gray-700">خلاصه مقاله</label>
          <span class="text-xs text-gray-400">{{ summaryLength }} / 500</span>
        </div>
        <Textarea
          v-model="form.summary"
          class="w-full text-sm leading-relaxed"
          rows="3"
          placeholder="یک یا دو جمله کوتاه و جذاب برای کارت مقاله و متا دیسکریپشن گوگل..."
        />
        <p v-if="errors.summary" class="mt-1 text-xs text-red-500">
          {{ errors.summary }}
        </p>
      </div>

      <!-- ویرایشگر متن پیشرفته (شامل جدول، عکس، هدینگ، اسلایدر) -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-bold text-gray-700">متن کامل مقاله</label>
          <span class="text-xs text-gray-400">پشتیبانی از جدول‌بندی، آپلود عکس، فهرست مطالب خودکار و اسلایدر محصول</span>
        </div>
        <MagazineTipTapEditor v-model="form.content" />
        <p v-if="errors.content" class="mt-1 text-xs text-red-500">
          {{ errors.content }}
        </p>
      </div>

      <!-- محصولات مرتبط و اسلایدر درون متن -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
              <i class="pi pi-shopping-bag text-nimoura-500" />
              محصولات مرتبط با مقاله (اسلایدر محصولات)
            </h3>
            <p class="mt-1 text-xs text-gray-500">
              محصولات انتخاب‌شده در اسلایدر پایین مقاله و در نقاط تعیین‌شده درون متن نمایش داده می‌شوند.
            </p>
          </div>
          <Button
            v-if="(form.relatedProductIds?.length ?? 0) > 0"
            type="button"
            label="درج اسلایدر در متن"
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            class="!text-xs"
            @click="insertSliderIntoContent"
          />
        </div>

        <!-- جستجو برای افزودن محصول -->
        <div class="relative mb-4">
          <IconField class="w-full">
            <InputIcon :class="searchingProducts ? 'pi pi-spin pi-spinner' : 'pi pi-search'" />
            <InputText
              v-model="productSearchQuery"
              placeholder="جستجوی نام محصول برای افزودن به مقاله..."
              class="w-full text-sm"
              @input="onSearchProductInput"
            />
          </IconField>

          <!-- لیست نتایج جستجو -->
          <div
            v-if="searchedProducts.length > 0"
            class="absolute right-0 left-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg p-2 space-y-1"
          >
            <div
              v-for="p in searchedProducts"
              :key="p.id"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              @click="addRelatedProduct(p)"
            >
              <div class="flex items-center gap-2.5">
                <img
                  v-if="p.thumbnailImage || p.images?.[0]?.url"
                  :src="p.thumbnailImage || p.images?.[0]?.url"
                  class="h-8 w-8 rounded-md object-cover border"
                />
                <div>
                  <p class="text-xs font-bold text-gray-800 line-clamp-1">{{ p.title }}</p>
                  <span class="text-[11px] text-gray-400">شناسه: {{ p.id }}</span>
                </div>
              </div>
              <Button icon="pi pi-plus" size="small" text rounded severity="success" />
            </div>
          </div>
        </div>

        <!-- لیست محصولات انتخاب‌شده -->
        <div v-if="(form.relatedProductIds?.length ?? 0) > 0" class="flex flex-wrap gap-2.5">
          <div
            v-for="pid in form.relatedProductIds"
            :key="pid"
            class="flex items-center gap-2 rounded-xl border border-nimoura-200 bg-nimoura-50/40 px-3 py-1.5 text-xs text-gray-700"
          >
            <span class="font-bold">شناسه {{ pid }}</span>
            <span v-if="selectedProductDetails.find((p) => String(p.id) === pid)?.title" class="line-clamp-1 max-w-[160px] text-gray-500">
              ({{ selectedProductDetails.find((p) => String(p.id) === pid)?.title }})
            </span>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 transition"
              title="حذف محصول"
              @click="removeRelatedProduct(pid)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 py-1">هنوز محصولی انتخاب نشده است.</p>
      </div>

      <!-- سوالات متداول انتهای مقاله (FAQ) -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
              <i class="pi pi-question-circle text-nimoura-500" />
              سوالات متداول مقاله (FAQ)
            </h3>
            <p class="mt-1 text-xs text-gray-500">
              سوالات متداول به عنوان آکاردئون در انتهای مقاله و جهت سئوی ریچ‌اسنیپت گوگل (FAQ Schema) ثبت می‌شوند.
            </p>
          </div>
          <Button
            type="button"
            label="افزودن سوال"
            icon="pi pi-plus"
            size="small"
            severity="secondary"
            class="!text-xs"
            @click="addFaq"
          />
        </div>

        <div v-if="form.faqs.length > 0" class="space-y-4">
          <div
            v-for="(faq, idx) in form.faqs"
            :key="idx"
            class="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2.5 relative"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-600">سوال شماره {{ idx + 1 }}</span>
              <button
                type="button"
                class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                @click="removeFaq(idx)"
              >
                <i class="pi pi-trash text-xs" />
                حذف
              </button>
            </div>
            <div>
              <InputText
                v-model="faq.question"
                placeholder="متن پرسش (مثلاً: آیا شیدینگ لب درد دارد؟)"
                class="w-full text-xs font-medium"
              />
            </div>
            <div>
              <Textarea
                v-model="faq.answer"
                rows="2"
                placeholder="پاسخ کامل و شفاف به این پرسش..."
                class="w-full text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 py-1">هیچ سوال متداولی اضافه نشده است.</p>
      </div>

      <!-- تنظیمات سئو -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">تنظیمات سئو (SEO)</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">عنوان متا (Meta Title)</label>
            <InputText v-model="form.metaTitle" class="w-full text-sm" placeholder="تایپ کنید..." />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">توضیحات متا (Meta Description)</label>
            <Textarea v-model="form.metaDescription" class="w-full text-sm" rows="2" placeholder="توضیحات کوتاه برای نمایش در موتورهای جستجو..." />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">کلمات کلیدی (با کاما جدا کنید)</label>
            <InputText v-model="form.metaKeywords" class="w-full text-sm" placeholder="تینت لب، شیدینگ لب، مقایسه آرایش لب" />
          </div>
        </div>
      </div>
    </div>

    <!-- ستون کناری (وضعیت، کاور، دسته‌بندی، نویسنده، برچسب‌ها) -->
    <div class="space-y-6">
      <!-- انتشار -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">انتشار و وضعیت</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">وضعیت انتشار</label>
            <Select
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              v-model="form.isFeatured"
              type="checkbox"
              class="h-4 w-4 rounded accent-nimoura-500"
            />
            مقاله ویژه (نمایش در بنر هیرو مجله)
          </label>
          <Button
            type="submit"
            :label="submitting ? 'در حال ذخیره...' : initial ? 'ذخیره تغییرات' : 'ایجاد و انتشار مقاله'"
            :disabled="submitting"
            class="w-full !bg-nimoura-500 !border-nimoura-500 font-bold"
          />
        </div>
      </div>

      <!-- تصویر کاور مقاله -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <UtilsFileUploader
          label="تصویر کاور مقاله"
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
          <label class="mb-1 block text-xs text-gray-500">متن جایگزین تصویر کاور (Alt)</label>
          <InputText v-model="form.coverImageAlt" class="w-full text-xs" placeholder="توضیح کوتاه تصویر برای سئو" />
        </div>
      </div>

      <!-- دسته‌بندی و نویسنده -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">دسته‌بندی و نویسنده</h3>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">دسته‌بندی مجله</label>
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
            <label class="mb-1 block text-xs text-gray-500">نویسنده مقاله</label>
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

      <!-- برچسب‌ها (Tags) -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
        <h3 class="mb-3 text-sm font-bold text-gray-700">برچسب‌های مقاله</h3>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tag in tags?.data ?? []"
            :key="tag.id"
            class="cursor-pointer rounded-full border px-3 py-1 text-xs transition"
            :class="
              form.tagIds?.includes(tag.id)
                ? 'border-nimoura-500 bg-nimoura-500 text-white shadow-xs'
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

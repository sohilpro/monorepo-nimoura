<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'ویترینها', href: '/showcases' },
        { label: isNew ? 'ویترین جدید' : form.name, href: route.fullPath },
      ]"
      :title="isNew ? 'ایجاد ویترین جدید' : `ویرایش: ${form.name}`"
      subtitle="تنظیم متنها، چیدمان و دستهبندیهای ویترین"
    />

    <form class="grid gap-5 lg:grid-cols-2" @submit.prevent="save">
      <!-- ══ تنظیمات عمومی ══ -->
      <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 class="font-semibold text-gray-800">تنظیمات عمومی</h2>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">نام داخلی</span>
          <input v-model="form.name" required class="admin-input" placeholder="مثلاً روتینهای محبوب" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">کلید (برای استفاده در سایت)</span>
          <input v-model="form.key" required class="admin-input" dir="ltr" placeholder="home-circle" />
          <span class="mt-1 block text-[11px] text-gray-400"
            >همان کلیدی که در کامپوننت CategoriesShowcase با config-key استفاده میشود</span
          >
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">عنوان</span>
          <input v-model="form.title" class="admin-input" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">بخش برجسته عنوان</span>
          <input v-model="form.highlight" class="admin-input" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">توضیحات</span>
          <textarea v-model="form.subtitle" rows="3" class="admin-input" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">متن نشان</span>
          <input v-model="form.badgeText" class="admin-input" />
        </label>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">لینک «مشاهده همه»</span>
          <input v-model="form.allLink" class="admin-input" dir="ltr" placeholder="/products" />
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm">
            <span class="mb-1 block text-gray-600">چیدمان</span>
            <select v-model="form.variant" class="admin-input">
              <option value="grid">شبکهای</option>
              <option value="scroll">اسکرولی</option>
              <option value="circle">دایرهای ساده</option>
              <option value="radial">دایرهای (مرکز + حلقه)</option>
              <option value="hero-cards">کارتهای هیرو</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="mb-1 block text-gray-600">حداکثر تعداد</span>
            <input v-model.number="form.limit" type="number" min="1" max="24" class="admin-input" />
          </label>
        </div>

        <label class="block text-sm">
          <span class="mb-1 block text-gray-600">ترتیب ویترین</span>
          <input v-model.number="form.sortOrder" type="number" class="admin-input" />
        </label>

        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.isActive" type="checkbox" class="size-4" />
            فعال
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.showHeader" type="checkbox" class="size-4" />
            نمایش هدر
          </label>
        </div>
      </div>

      <!-- ══ آیتمها ══ -->
      <div class="space-y-5">
        <!-- مرکز دایره -->
        <div class="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          <h2 class="font-semibold text-gray-800">آیتم مرکز دایره</h2>
          <p class="text-xs text-gray-500">فقط در چیدمان «دایرهای (مرکز + حلقه)» نمایش میدهد.</p>

          <label class="block text-sm">
            <span class="mb-1 block text-gray-600">دستهبندی</span>
            <select v-model="form.centerItem.categoryId" class="admin-input">
              <option :value="null">بدون دستهبندی (سفارشی)</option>
              <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="block text-sm">
              <span class="mb-1 block text-gray-600">نام سفارشی</span>
              <input v-model="form.centerItem.name" class="admin-input" />
            </label>
            <label class="block text-sm">
              <span class="mb-1 block text-gray-600">اسلاگ سفارشی</span>
              <input v-model="form.centerItem.slug" class="admin-input" dir="ltr" />
            </label>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <label class="block text-sm">
              <span class="mb-1 block text-gray-600">تصویر سفارشی</span>
              <input v-model="form.centerItem.image" class="admin-input" dir="ltr" placeholder="/uploads/..." />
            </label>
            <label class="block text-sm">
              <span class="mb-1 block text-gray-600">نشان سفارشی</span>
              <input v-model="form.centerItem.badge" class="admin-input" />
            </label>
          </div>
        </div>

        <!-- حلقه / شبکه -->
        <div class="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-gray-800">آیتمهای ویترین</h2>
              <p class="text-xs text-gray-500">ترتیب و جزئیات هر آیتم قابل تغییر است.</p>
            </div>
            <button
              type="button"
              class="rounded-lg border border-brand-300 px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-50"
              @click="addItem"
            >
              + آیتم
            </button>
          </div>

          <div
            v-for="(item, i) in form.items"
            :key="item.uid"
            class="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-gray-600">آیتم {{ i + 1 }}</span>
              <button
                type="button"
                class="text-xs text-rose-600 hover:underline"
                @click="form.items.splice(i, 1)"
              >
                حذف
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">دستهبندی</span>
                <select v-model="item.categoryId" class="admin-input">
                  <option :value="null">سفارشی</option>
                  <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </label>
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">ترتیب</span>
                <input v-model.number="item.sortOrder" type="number" class="admin-input" />
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">نام سفارشی</span>
                <input v-model="item.name" class="admin-input" />
              </label>
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">اسلاگ سفارشی</span>
                <input v-model="item.slug" class="admin-input" dir="ltr" />
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">تصویر سفارشی</span>
                <input v-model="item.image" class="admin-input" dir="ltr" />
              </label>
              <label class="block text-sm">
                <span class="mb-1 block text-gray-600">لینک سفارشی</span>
                <input v-model="item.link" class="admin-input" dir="ltr" />
              </label>
            </div>

            <label class="block text-sm">
              <span class="mb-1 block text-gray-600">نشان سفارشی</span>
              <input v-model="item.badge" class="admin-input" />
            </label>
          </div>

          <p v-if="!form.items.length" class="py-4 text-center text-xs text-gray-400">
            هنوز آیتمی اضافه نشده است.
          </p>
        </div>
      </div>

      <div class="lg:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          :disabled="isLoading"
          class="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {{ isLoading ? 'در حال ذخیره…' : 'ذخیره ویترین' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          @click="navigateTo('/showcases')"
        >
          بازگشت
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const id = String(route.params.id || '');
const isNew = id === 'new';
const { isLoading, fetchShowcase, fetchCategories, createShowcase, updateShowcase } =
  useAdminShowcases();

function blankItem(role: 'center' | 'ring' = 'ring') {
  return {
    uid: `${Date.now()}-${Math.random()}`,
    role,
    categoryId: null as number | null,
    sortOrder: 0,
    name: '',
    slug: '',
    image: '',
    badge: '',
    keywords: '',
    link: '',
  };
}

const form = reactive({
  key: '',
  name: '',
  title: '',
  highlight: '',
  subtitle: '',
  badgeText: '',
  allLink: '',
  variant: 'radial',
  limit: 6,
  showHeader: true,
  isActive: true,
  sortOrder: 0,
  centerItem: blankItem('center'),
  items: [] as ReturnType<typeof blankItem>[],
});

const categoryOptions = ref<any[]>([]);
categoryOptions.value = await fetchCategories();

if (!isNew) {
  const config = await fetchShowcase(id);
  if (config) {
    Object.assign(form, {
      key: config.key,
      name: config.name,
      title: config.title || '',
      highlight: config.highlight || '',
      subtitle: config.subtitle || '',
      badgeText: config.badgeText || '',
      allLink: config.allLink || '',
      variant: config.variant || 'grid',
      limit: Number(config.limit) || 6,
      showHeader: config.showHeader !== false,
      isActive: config.isActive !== false,
      sortOrder: Number(config.sortOrder) || 0,
    });
    const center = config.centerItem || null;
    form.centerItem = {
      ...blankItem('center'),
      uid: 'center',
      categoryId: center?.categoryId ? Number(center.categoryId) : null,
      name: center?.name || '',
      slug: center?.slug || '',
      image: center?.image || '',
      badge: center?.badge || '',
      keywords: center?.keywords || '',
      link: center?.link || '',
    };
    form.items = (config.items || []).map((item: any) => ({
      ...blankItem('ring'),
      uid: `${Date.now()}-${Math.random()}`,
      categoryId: item.categoryId ? Number(item.categoryId) : null,
      sortOrder: Number(item.sortOrder) || 0,
      name: item.name || '',
      slug: item.slug || '',
      image: item.image || '',
      badge: item.badge || '',
      keywords: item.keywords || '',
      link: item.link || '',
    }));
  }
}

function addItem() {
  form.items.push(blankItem('ring'));
}

async function save() {
  const payload = {
    key: form.key.trim(),
    name: form.name.trim(),
    title: form.title,
    highlight: form.highlight,
    subtitle: form.subtitle,
    badgeText: form.badgeText,
    allLink: form.allLink,
    variant: form.variant,
    limit: Number(form.limit) || 6,
    showHeader: form.showHeader,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
    centerItem: form.centerItem.categoryId
      ? {
          role: 'center',
          categoryId: Number(form.centerItem.categoryId),
          sortOrder: 0,
          name: form.centerItem.name || undefined,
          slug: form.centerItem.slug || undefined,
          image: form.centerItem.image || undefined,
          badge: form.centerItem.badge || undefined,
          link: form.centerItem.link || undefined,
        }
      : null,
    items: form.items.map((item, index) => ({
      role: 'ring',
      categoryId: item.categoryId ? Number(item.categoryId) : null,
      sortOrder: Number(item.sortOrder ?? index),
      name: item.name || undefined,
      slug: item.slug || undefined,
      image: item.image || undefined,
      badge: item.badge || undefined,
      keywords: item.keywords || undefined,
      link: item.link || undefined,
    })),
  };

  const ok = isNew
    ? await createShowcase(payload as any)
    : await updateShowcase(id, payload as any);
  if (ok) await navigateTo('/showcases');
}
</script>

<style scoped>
.admin-input {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.admin-input:focus {
  border-color: #b76e79;
  box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.12);
}
</style>

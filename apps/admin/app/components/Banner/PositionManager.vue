<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-800">جایگاههای بنر</h1>
        <p class="mt-1 text-sm text-gray-500">
          جایگاهها مشخص میکنند هر بنر در کجای فروشگاه نمایش داده شود. کلید جایگاه
          باید همان کلیدی باشد که در صفحات فروشگاه استفاده میشود.
        </p>
      </div>
      <NuxtLink
        to="/banners"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        بازگشت به بنرها
      </NuxtLink>
    </div>

    <!-- جایگاههای استاندارد فروشگاه -->
    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <h2 class="mb-3 text-sm font-bold text-gray-700">
        جایگاههای استاندارد فروشگاه
      </h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in missingSuggestions"
          :key="suggestion.key"
          type="button"
          class="rounded-lg border border-dashed border-brand-300 bg-brand-50 px-3 py-2 text-xs text-brand-700 hover:bg-brand-100"
          @click="createSuggested(suggestion)"
        >
          + {{ suggestion.name }} ({{ suggestion.key }})
        </button>
        <span v-if="!missingSuggestions.length" class="text-xs text-emerald-600">
          تمام جایگاههای استاندارد تعریف شدهاند.
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <!-- فرم ایجاد / ویرایش -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
        <h2 class="mb-4 text-sm font-bold text-gray-700">
          {{ editingId ? 'ویرایش جایگاه' : 'جایگاه جدید' }}
        </h2>
        <form class="space-y-3" @submit.prevent="savePosition">
          <label class="block text-xs font-semibold text-gray-700">
            کلید جایگاه (انگلیسی، یکتا)
            <input
              v-model="form.key"
              type="text"
              required
              maxlength="100"
              pattern="[a-z0-9-]+"
              placeholder="مثال: hero-home"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label class="block text-xs font-semibold text-gray-700">
            نام جایگاه
            <input
              v-model="form.name"
              type="text"
              required
              maxlength="150"
              placeholder="مثال: اسلایدر اصلی صفحه اصلی"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label class="block text-xs font-semibold text-gray-700">
            توضیحات (اختیاری)
            <textarea
              v-model="form.description"
              rows="2"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block text-xs font-semibold text-gray-700">
              عرض پیشنهادی
              <input v-model.number="form.recommendedWidth" type="number" min="0" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label class="block text-xs font-semibold text-gray-700">
              ارتفاع پیشنهادی
              <input v-model.number="form.recommendedHeight" type="number" min="0" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
          </div>
          <label class="block text-xs font-semibold text-gray-700">
            حداکثر تعداد بنر (۰ = نامحدود)
            <input v-model.number="form.maxItems" type="number" min="0" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label class="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <input v-model="form.isActive" type="checkbox" class="size-4 accent-brand-500" />
            جایگاه فعال باشد
          </label>

          <div class="flex gap-2 pt-2">
            <button
              type="submit"
              class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              {{ editingId ? 'ذخیره تغییرات' : 'ایجاد جایگاه' }}
            </button>
            <button
              v-if="editingId"
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600"
              @click="resetForm"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>

      <!-- لیست جایگاهها -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white lg:col-span-3">
        <table class="w-full text-right text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th class="p-3">نام / کلید</th>
              <th class="p-3">اندازه پیشنهادی</th>
              <th class="p-3">وضعیت</th>
              <th class="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="position in positions" :key="position.id">
              <td class="p-3">
                <div class="font-semibold text-gray-800">{{ position.name }}</div>
                <div dir="ltr" class="text-left font-mono text-xs text-gray-500">
                  {{ position.key }}
                </div>
              </td>
              <td class="p-3 text-xs text-gray-500">
                {{ position.recommendedWidth || '—' }} ×
                {{ position.recommendedHeight || '—' }}
              </td>
              <td class="p-3">
                <span
                  class="rounded-full px-2 py-1 text-[11px]"
                  :class="position.isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'"
                >
                  {{ position.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="text-xs text-blue-600 hover:underline"
                    @click="editPosition(position)"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    class="text-xs text-rose-600 hover:underline"
                    @click="removePosition(position)"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!positions.length">
              <td colspan="4" class="p-6 text-center text-sm text-gray-500">
                هنوز جایگاهی تعریف نشده است.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  BANNER_POSITIONS,
  type BannerPosition,
  type CreateBannerPositionPayload,
} from '@nimoura/shared-types';

const {
  fetchBannerPositions,
  createBannerPosition,
  updateBannerPosition,
  deleteBannerPosition,
} = useAdminBanners();

const positions = ref<BannerPosition[]>([]);
const editingId = ref<number | null>(null);

const form = reactive<CreateBannerPositionPayload>({
  key: '',
  name: '',
  description: '',
  recommendedWidth: undefined,
  recommendedHeight: undefined,
  maxItems: 0,
  isActive: true,
});

const missingSuggestions = computed(() =>
  BANNER_POSITIONS.filter(
    (suggestion) =>
      !positions.value.some((position) => position.key === suggestion.key),
  ),
);

async function load() {
  positions.value = await fetchBannerPositions();
}

onMounted(load);

function resetForm() {
  editingId.value = null;
  form.key = '';
  form.name = '';
  form.description = '';
  form.recommendedWidth = undefined;
  form.recommendedHeight = undefined;
  form.maxItems = 0;
  form.isActive = true;
}

function editPosition(position: BannerPosition) {
  editingId.value = position.id;
  form.key = position.key;
  form.name = position.name;
  form.description = position.description || '';
  form.recommendedWidth = position.recommendedWidth;
  form.recommendedHeight = position.recommendedHeight;
  form.maxItems = position.maxItems ?? 0;
  form.isActive = position.isActive;
}

async function createSuggested(suggestion: (typeof BANNER_POSITIONS)[number]) {
  const created = await createBannerPosition({
    key: suggestion.key,
    name: suggestion.name,
    description: suggestion.description,
    recommendedWidth: suggestion.recommendedWidth,
    recommendedHeight: suggestion.recommendedHeight,
    maxItems: suggestion.maxItems ?? 0,
    isActive: true,
  });
  if (created) await load();
}

async function savePosition() {
  const payload: CreateBannerPositionPayload = {
    key: form.key.trim().toLowerCase(),
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    recommendedWidth: Number(form.recommendedWidth) || undefined,
    recommendedHeight: Number(form.recommendedHeight) || undefined,
    maxItems: Number(form.maxItems) || 0,
    isActive: form.isActive,
  };

  const ok = editingId.value
    ? await updateBannerPosition(editingId.value, payload)
    : Boolean(await createBannerPosition(payload));

  if (ok) {
    resetForm();
    await load();
  }
}

async function removePosition(position: BannerPosition) {
  if (!window.confirm(`جایگاه "${position.name}" حذف شود؟`)) return;
  if (await deleteBannerPosition(position.id)) await load();
}
</script>

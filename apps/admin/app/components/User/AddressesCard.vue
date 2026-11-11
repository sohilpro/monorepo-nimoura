<template>
  <CommonComponentCard title="آدرس‌های ثبت‌شده مشتری" desc="مشاهده، افزودن و ویرایش نشانی‌های ارسال کاربر">
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs text-gray-500">
        {{ toPersianDigits(addresses.length) }} آدرس ثبت شده
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
        @click="openNewAddress"
      >
        <i class="pi pi-plus text-[11px]" />
        افزودن آدرس
      </button>
    </div>

    <div v-if="loading" class="space-y-2.5">
      <div class="h-20 animate-pulse rounded-xl bg-gray-100" />
      <div class="h-20 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <div
      v-else-if="!addresses.length"
      class="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center text-xs text-gray-500"
    >
      هنوز آدرسی برای این کاربر ثبت نشده است.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="addr in addresses"
        :key="addr.id"
        class="rounded-xl border border-gray-200 bg-gray-50/40 p-3.5 transition hover:border-brand-200"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <i class="pi pi-map-marker text-xs" />
            </span>
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ addr.title }}</p>
              <p class="text-xs text-gray-500">{{ addr.state }}، {{ addr.city }}</p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-brand-600"
              title="ویرایش آدرس"
              aria-label="ویرایش آدرس"
              @click="openEditAddress(addr)"
            >
              <i class="pi pi-pencil text-xs" />
            </button>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-500 transition hover:bg-error-50 hover:text-error-600"
              title="حذف آدرس"
              aria-label="حذف آدرس"
              @click="removeAddress(addr)"
            >
              <i class="pi pi-trash text-xs" />
            </button>
          </div>
        </div>

        <p class="mt-2.5 text-xs leading-6 text-gray-700">{{ addr.address }}</p>
        <p class="mt-1.5 text-[11px] text-gray-500">
          کد پستی:
          <span class="font-medium tabular-nums text-gray-700" dir="ltr">
            {{ addr.postal_code }}
          </span>
        </p>
      </li>
    </ul>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingAddress ? 'ویرایش آدرس' : 'ثبت آدرس جدید'"
      class="w-[95vw] max-w-lg"
    >
      <form id="user-address-form" class="space-y-4" @submit.prevent="saveAddress">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">عنوان آدرس *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="مثلاً: خانه یا محل کار"
              class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">کد پستی (۱۰ رقم) *</label>
            <input
              v-model="form.postal_code"
              type="text"
              dir="ltr"
              maxlength="10"
              placeholder="1234567890"
              class="h-10 w-full rounded-lg border border-gray-300 px-3 text-start text-sm tabular-nums outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">استان *</label>
            <input
              v-model="form.state"
              type="text"
              placeholder="تهران"
              class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-700">شهر *</label>
            <input
              v-model="form.city"
              type="text"
              placeholder="تهران"
              class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">نشانی کامل *</label>
          <textarea
            v-model="form.address"
            rows="3"
            placeholder="خیابان، کوچه، پلاک، واحد..."
            class="w-full rounded-lg border border-gray-300 p-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
          />
        </div>

        <p v-if="formError" class="rounded-lg bg-error-50 px-3 py-2 text-xs text-error-700">
          {{ formError }}
        </p>
      </form>

      <template #footer>
        <Button label="انصراف" text severity="secondary" @click="dialogOpen = false" />
        <Button
          type="submit"
          form="user-address-form"
          :label="saving ? 'در حال ذخیره...' : 'ذخیره آدرس'"
          :disabled="saving"
        />
      </template>
    </Dialog>
  </CommonComponentCard>
</template>

<script setup lang="ts">
import type { UserAddressItem } from '@nimoura/shared-types';
import { toEnglishDigits, toPersianDigits } from '@nimoura/utils';

const props = defineProps<{
  userId: number | string;
}>();

const { getUserAddresses, createUserAddress, updateUserAddress, deleteUserAddress } =
  useAdminUsers();

const addresses = ref<UserAddressItem[]>([]);
const loading = ref(true);
const dialogOpen = ref(false);
const saving = ref(false);
const editingAddress = ref<UserAddressItem | null>(null);
const formError = ref('');

const form = reactive({
  title: '',
  postal_code: '',
  state: '',
  city: '',
  address: '',
});

async function load() {
  loading.value = true;
  addresses.value = await getUserAddresses(props.userId);
  loading.value = false;
}

function openNewAddress() {
  editingAddress.value = null;
  formError.value = '';
  form.title = '';
  form.postal_code = '';
  form.state = '';
  form.city = '';
  form.address = '';
  dialogOpen.value = true;
}

function openEditAddress(addr: UserAddressItem) {
  editingAddress.value = addr;
  formError.value = '';
  form.title = addr.title;
  form.postal_code = addr.postal_code;
  form.state = addr.state;
  form.city = addr.city;
  form.address = addr.address;
  dialogOpen.value = true;
}

async function saveAddress() {
  const postal = toEnglishDigits(form.postal_code).trim();
  if (form.title.trim().length < 2) {
    formError.value = 'عنوان آدرس باید حداقل ۲ کاراکتر باشد.';
    return;
  }
  if (!/^\d{10}$/.test(postal)) {
    formError.value = 'کد پستی باید دقیقاً ۱۰ رقم باشد.';
    return;
  }
  if (form.state.trim().length < 2 || form.city.trim().length < 2) {
    formError.value = 'نام استان و شهر الزامی است.';
    return;
  }
  if (form.address.trim().length < 5) {
    formError.value = 'نشانی کامل باید حداقل ۵ کاراکتر باشد.';
    return;
  }

  formError.value = '';
  saving.value = true;
  const payload = {
    title: form.title.trim(),
    postal_code: postal,
    state: form.state.trim(),
    city: form.city.trim(),
    address: form.address.trim(),
  };

  const ok = editingAddress.value
    ? await updateUserAddress(editingAddress.value.id, payload)
    : await createUserAddress(props.userId, payload);

  saving.value = false;
  if (!ok) return;

  dialogOpen.value = false;
  await load();
}

async function removeAddress(addr: UserAddressItem) {
  if (await deleteUserAddress(addr.id)) {
    await load();
  }
}

onMounted(load);
</script>

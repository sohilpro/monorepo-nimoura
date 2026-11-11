<template>
  <section class="space-y-6">
    <ConfirmDialog />

    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مشتریان و کاربران', href: '/customers' },
        { label: mode === 'create' ? 'افزودن کاربر' : 'ویرایش کاربر', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد مشتری / کاربر جدید' : 'پروفایل و ویرایش کاربر'"
      :subtitle="
        mode === 'create'
          ? 'ثبت مستقیم حساب کاربری جدید بر اساس مشخصات و سطح دسترسی'
          : 'مدیریت اطلاعات هویتی، وضعیت تأیید، نقش دسترسی و آدرس‌های کاربر'
      "
      :publish-label="mode === 'create' ? 'ثبت کاربر' : 'ذخیره تغییرات'"
      discard-label="بازگشت"
      form="customer-form"
      @discard="() => navigateTo('/customers')"
    />

    <div v-if="loadingPage" class="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div class="space-y-4 lg:col-span-7">
        <div class="h-88 animate-pulse rounded-2xl bg-gray-100" />
      </div>
      <div class="space-y-4 lg:col-span-5">
        <div class="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>

    <form v-else id="customer-form" class="space-y-6" @submit.prevent="submitForm">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <main class="space-y-6 lg:col-span-7">
          <CommonComponentCard title="اطلاعات هویتی و تماس">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CommonCustomInput
                v-model="form.first_name"
                label="نام"
                placeholder="مثال: سارا"
              />
              <CommonCustomInput
                v-model="form.last_name"
                label="نام خانوادگی"
                placeholder="مثال: رادمنش"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  شماره موبایل <span class="text-error-500">*</span>
                </label>
                <input
                  v-model="form.mobile"
                  type="tel"
                  dir="ltr"
                  maxlength="11"
                  placeholder="09123456789"
                  class="h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-start text-sm tabular-nums text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                  :class="errors.mobile ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
                />
                <p v-if="errors.mobile" class="mt-1 text-xs text-error-600">{{ errors.mobile }}</p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">کد ملی (۱۰ رقم)</label>
                <input
                  v-model="form.identity_card"
                  type="text"
                  dir="ltr"
                  maxlength="10"
                  placeholder="1234567890"
                  class="h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-start text-sm tabular-nums text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                  :class="errors.identity_card ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
                />
                <p v-if="errors.identity_card" class="mt-1 text-xs text-error-600">{{ errors.identity_card }}</p>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">آدرس ایمیل</label>
              <input
                v-model="form.email"
                type="email"
                dir="ltr"
                placeholder="user@example.com"
                class="h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-start text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                :class="errors.email ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-error-600">{{ errors.email }}</p>
            </div>
          </CommonComponentCard>

          <UserAddressesCard v-if="mode === 'update' && userId" :user-id="userId" />
        </main>

        <aside class="space-y-6 lg:col-span-5">
          <CommonComponentCard title="سطح دسترسی، تأیید و امنیت">
            <UserRoleSelector v-model="form.role" />

            <div class="space-y-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <p class="text-xs font-semibold text-gray-600">وضعیت تأیید اطلاعات تماس</p>
              <CommonToggleSwitch
                id="form-verify-mobile"
                v-model="form.verify_mobile"
                label="شماره موبایل تأیید شده است"
              />
              <CommonToggleSwitch
                id="form-verify-email"
                v-model="form.verify_email"
                :disabled="!form.email.trim()"
                label="آدرس ایمیل تأیید شده است"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">
                {{ mode === 'create' ? 'رمز عبور (اختیاری)' : 'رمز عبور جدید (اختیاری)' }}
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  dir="ltr"
                  :placeholder="mode === 'create' ? 'حداقل ۶ کاراکتر' : 'در صورت خالی بودن تغییر نمی‌کند'"
                  class="h-11 w-full rounded-lg border bg-white ps-4 pe-11 text-start text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                  :class="errors.password ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 end-0 flex items-center px-3.5 text-gray-400 hover:text-gray-700"
                  :aria-label="showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-error-600">{{ errors.password }}</p>
              <p class="text-xs leading-relaxed text-gray-500">
                مشتریان عادی می‌توانند بدون رمز عبور و از طریق کد یکبار مصرف (OTP) وارد سایت شوند.
              </p>
            </div>
          </CommonComponentCard>

          <UserSummaryCard
            v-if="mode === 'update' && loadedUser"
            :user="loadedUser"
            :stats="userStats"
            @delete="confirmDelete"
          />
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { UserRole, type UserProfile } from '@nimoura/shared-types';
import type { UserStatsResponse } from '~/composables/useAdminUsers';
import { toEnglishDigits } from '@nimoura/utils';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    userId?: number | string;
  }>(),
  { mode: 'create' },
);

const confirm = useConfirm();
const { getUserById, getUserStats, createUser, updateUser, deleteUser, getDisplayName } =
  useAdminUsers();

const loadingPage = ref(false);
const showPassword = ref(false);
const loadedUser = ref<UserProfile | null>(null);
const userStats = ref<UserStatsResponse | null>(null);
const errors = ref<Record<string, string>>({});

const form = reactive({
  first_name: '',
  last_name: '',
  mobile: '',
  email: '',
  password: '',
  role: UserRole.USER,
  identity_card: '',
  verify_mobile: true,
  verify_email: false,
});

watch(
  () => form.email,
  (val) => {
    if (!val.trim()) form.verify_email = false;
  },
);

onMounted(async () => {
  if (props.mode !== 'update' || !props.userId) return;
  loadingPage.value = true;
  const [existing, stats] = await Promise.all([
    getUserById(props.userId),
    getUserStats(props.userId),
  ]);
  loadingPage.value = false;
  if (!existing) return;

  loadedUser.value = existing;
  userStats.value = stats;
  form.first_name = existing.first_name || '';
  form.last_name = existing.last_name || '';
  form.mobile = existing.mobile || '';
  form.email = existing.email || '';
  form.role = existing.role || UserRole.USER;
  form.identity_card = existing.identity_card || '';
  form.verify_mobile = Boolean(existing.verify_mobile);
  form.verify_email = Boolean(existing.verify_email);
});

function validate(): boolean {
  const next: Record<string, string> = {};
  const mobile = toEnglishDigits(form.mobile).trim();
  const idCard = toEnglishDigits(form.identity_card).trim();
  const email = form.email.trim();
  const password = form.password.trim();

  if (!/^09\d{9}$/.test(mobile)) {
    next.mobile = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
  }
  if (idCard && !/^\d{10}$/.test(idCard)) {
    next.identity_card = 'کد ملی باید دقیقاً ۱۰ رقم باشد.';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    next.email = 'فرمت ایمیل معتبر نیست.';
  }
  if (password && (password.length < 6 || password.length > 32)) {
    next.password = 'رمز عبور باید بین ۶ تا ۳۲ کاراکتر باشد.';
  }

  errors.value = next;
  return Object.keys(next).length === 0;
}

async function submitForm() {
  if (!validate()) return;

  const mobile = toEnglishDigits(form.mobile).trim();
  const identityCard = toEnglishDigits(form.identity_card).trim();
  const email = form.email.trim();
  const password = form.password.trim();

  const saved =
    props.mode === 'create'
      ? await createUser({
          mobile,
          first_name: form.first_name.trim() || undefined,
          last_name: form.last_name.trim() || undefined,
          email: email || undefined,
          password: password || undefined,
          role: form.role,
          identity_card: identityCard || undefined,
          verify_mobile: form.verify_mobile,
          verify_email: email ? form.verify_email : false,
        })
      : props.userId
        ? await updateUser(props.userId, {
            mobile,
            first_name: form.first_name.trim() || null,
            last_name: form.last_name.trim() || null,
            email: email || null,
            identity_card: identityCard || null,
            role: form.role,
            verify_mobile: form.verify_mobile,
            verify_email: email ? form.verify_email : false,
            ...(password ? { password } : {}),
          })
        : null;

  if (saved) await navigateTo('/customers');
}

function confirmDelete() {
  if (!loadedUser.value) return;
  const target = loadedUser.value;
  confirm.require({
    header: 'حذف کاربر',
    message: `حساب «${getDisplayName(target)}» حذف شود؟ (در صورت وجود سفارش، به‌صورت امن بایگانی می‌شود)`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (await deleteUser(target.id)) {
        await navigateTo('/customers');
      }
    },
  });
}
</script>

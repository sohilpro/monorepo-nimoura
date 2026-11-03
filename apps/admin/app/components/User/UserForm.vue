<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مشتریان و کاربران', href: '/customers' },
        { label: mode === 'create' ? 'افزودن مشتری' : 'ویرایش مشتری', href: '' },
      ]"
      :title="mode === 'create' ? 'ایجاد مشتری / کاربر جدید' : 'ویرایش مشخصات مشتری'"
      :subtitle="
        mode === 'create'
          ? 'ثبت‌نام مستقیم کاربر در پایگاه داده فروشگاه نیمورا'
          : 'تغییر نام، شماره تماس، ایمیل یا نقش دسترسی کاربر'
      "
      :publish-label="mode === 'create' ? 'ثبت کاربر' : 'ذخیره تغییرات'"
      discard-label="انصراف"
      form="customer-form"
      @discard="() => navigateTo('/customers')"
    />

    <form @submit.prevent="submitForm" id="customer-form" class="space-y-6">
      <div class="flex flex-col lg:flex-row gap-5">
        <!-- Main Form Column (Left) -->
        <main class="flex flex-col basis-full lg:basis-7/12 space-y-6">
          <CommonComponentCard title="اطلاعات هویتی و فردی">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <CommonCustomInput
              v-model="form.mobile"
              label="شماره موبایل (الزامی)"
              placeholder="09123456789"
              required
            />

            <CommonCustomInput
              v-model="form.email"
              label="آدرس ایمیل"
              placeholder="user@example.com"
              type="email"
            />

            <CommonCustomInput
              v-model="form.identity_card"
              label="کد ملی (۱۰ رقم)"
              placeholder="1234567890"
              maxlength="10"
            />
          </CommonComponentCard>
        </main>

        <!-- Sidebar Column (Right) -->
        <aside class="flex flex-col gap-5 basis-full lg:basis-5/12">
          <CommonComponentCard title="سطح دسترسی و امنیت">
            <CommonSelectInput
              v-model="form.role"
              :options="roleOptions"
              label="نقش دسترسی کاربر"
              placeholder="انتخاب نقش..."
              required
            />

            <div class="space-y-2 pt-2">
              <CommonCustomInput
                v-model="form.password"
                :label="mode === 'create' ? 'رمز عبور (اختیاری)' : 'رمز عبور جدید (اختیاری)'"
                :placeholder="mode === 'create' ? 'حداقل ۶ کاراکتر' : 'تنها در صورت نیاز به تغییر وارد کنید'"
                type="password"
              />
              <p class="text-xs text-gray-500 leading-relaxed">
                کاربران عادی می‌توانند با کد یکبار مصرف پیامکی (OTP) بدون رمز وارد شوند.
              </p>
            </div>
          </CommonComponentCard>
        </aside>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { UserRole, type CreateUserPayload, type UpdateUserPayload } from '@nimoura/shared-types';

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'update';
    userId?: number | string;
  }>(),
  {
    mode: 'create',
  },
);

const { getUserById, createUser, updateUser } = useAdminUsers();

const form = reactive({
  first_name: '',
  last_name: '',
  mobile: '',
  email: '',
  password: '',
  role: UserRole.USER,
  identity_card: '',
});

const roleOptions = [
  { id: UserRole.USER, name: 'مشتری عادی (کاربر)' },
  { id: UserRole.ADMIN, name: 'مدیر ارشد (ادمین)' },
  { id: UserRole.OWNER, name: 'مالک فروشگاه' },
];

onMounted(async () => {
  if (props.mode === 'update' && props.userId) {
    const existing = await getUserById(props.userId);
    if (existing) {
      form.first_name = existing.first_name || '';
      form.last_name = existing.last_name || '';
      form.mobile = existing.mobile || '';
      form.email = existing.email || '';
      form.role = existing.role || UserRole.USER;
      form.identity_card = existing.identity_card || '';
    }
  }
});

async function submitForm() {
  const cleanMobile = form.mobile?.trim() || '';
  if (!cleanMobile) {
    alert('شماره موبایل الزامی است');
    return;
  }
  if (!/^0\d{10}$/.test(cleanMobile)) {
    alert('شماره موبایل باید ۱۱ رقم بوده و با ۰ شروع شود');
    return;
  }

  const payload: CreateUserPayload = {
    mobile: cleanMobile,
    first_name: form.first_name?.trim() || undefined,
    last_name: form.last_name?.trim() || undefined,
    email: form.email?.trim() || undefined,
    password: form.password?.trim() || undefined,
    role: form.role,
    identity_card: form.identity_card?.trim() || undefined,
  };

  let success = false;
  if (props.mode === 'create') {
    success = await createUser(payload);
  } else if (props.mode === 'update' && props.userId) {
    success = await updateUser(props.userId, payload as UpdateUserPayload);
  }

  if (success) {
    await navigateTo('/customers');
  }
}
</script>

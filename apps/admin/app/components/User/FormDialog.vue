<template>
  <Dialog
    :visible="visible"
    modal
    :header="isEdit ? 'ویرایش سریع اطلاعات کاربر' : 'افزودن مشتری / کاربر جدید'"
    class="w-[95vw] max-w-2xl"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="loadingUser" class="space-y-3 py-4">
      <div class="h-11 animate-pulse rounded-xl bg-gray-100" />
      <div class="h-11 animate-pulse rounded-xl bg-gray-100" />
      <div class="h-20 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <form v-else id="quick-user-form" class="space-y-5 pt-1" @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">نام</label>
          <input
            v-model="form.first_name"
            type="text"
            placeholder="مثال: سارا"
            class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">نام خانوادگی</label>
          <input
            v-model="form.last_name"
            type="text"
            placeholder="مثال: رادمنش"
            class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">
            شماره موبایل <span class="text-error-500">*</span>
          </label>
          <input
            v-model="form.mobile"
            type="tel"
            dir="ltr"
            maxlength="11"
            placeholder="09123456789"
            class="h-10 w-full rounded-lg border px-3 text-start text-sm tabular-nums outline-hidden focus:ring-3 focus:ring-brand-500/10"
            :class="errors.mobile ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
          />
          <p v-if="errors.mobile" class="mt-1 text-[11px] text-error-600">{{ errors.mobile }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">کد ملی (۱۰ رقم)</label>
          <input
            v-model="form.identity_card"
            type="text"
            dir="ltr"
            maxlength="10"
            placeholder="1234567890"
            class="h-10 w-full rounded-lg border px-3 text-start text-sm tabular-nums outline-hidden focus:ring-3 focus:ring-brand-500/10"
            :class="errors.identity_card ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
          />
          <p v-if="errors.identity_card" class="mt-1 text-[11px] text-error-600">{{ errors.identity_card }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">آدرس ایمیل</label>
          <input
            v-model="form.email"
            type="email"
            dir="ltr"
            placeholder="user@example.com"
            class="h-10 w-full rounded-lg border px-3 text-start text-sm outline-hidden focus:ring-3 focus:ring-brand-500/10"
            :class="errors.email ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
          />
          <p v-if="errors.email" class="mt-1 text-[11px] text-error-600">{{ errors.email }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-700">
            {{ isEdit ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور (اختیاری)' }}
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              dir="ltr"
              :placeholder="isEdit ? 'خالی = بدون تغییر' : 'حداقل ۶ کاراکتر'"
              class="h-10 w-full rounded-lg border ps-3 pe-10 text-start text-sm outline-hidden focus:ring-3 focus:ring-brand-500/10"
              :class="errors.password ? 'border-error-400 focus:border-error-400' : 'border-gray-300 focus:border-brand-300'"
            />
            <button
              type="button"
              class="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
              :aria-label="showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-[11px] text-error-600">{{ errors.password }}</p>
        </div>
      </div>

      <UserRoleSelector v-model="form.role" />

      <div class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 sm:grid-cols-2">
        <CommonToggleSwitch
          id="dialog-verify-mobile"
          v-model="form.verify_mobile"
          label="شماره موبایل تأیید شده است"
        />
        <CommonToggleSwitch
          id="dialog-verify-email"
          v-model="form.verify_email"
          :disabled="!form.email.trim()"
          label="ایمیل تأیید شده است"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex w-full items-center justify-between gap-2">
        <NuxtLink
          v-if="isEdit && userId"
          :to="`/customers/${userId}`"
          class="text-xs font-medium text-brand-600 hover:underline"
        >
          مشاهده پروفایل کامل و آدرس‌ها
        </NuxtLink>
        <span v-else />

        <div class="flex gap-2">
          <Button label="انصراف" text severity="secondary" @click="emit('update:visible', false)" />
          <Button
            type="submit"
            form="quick-user-form"
            :label="saving ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'ایجاد کاربر'"
            :disabled="saving || loadingUser"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { UserRole } from '@nimoura/shared-types';
import { toEnglishDigits } from '@nimoura/utils';

const props = defineProps<{
  visible: boolean;
  userId?: number | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  saved: [];
}>();

const { getUserById, createUser, updateUser } = useAdminUsers();

const isEdit = computed(() => !!props.userId);
const loadingUser = ref(false);
const saving = ref(false);
const showPassword = ref(false);
const errors = ref<Record<string, string>>({});

const form = reactive({
  first_name: '',
  last_name: '',
  mobile: '',
  email: '',
  identity_card: '',
  password: '',
  role: UserRole.USER,
  verify_mobile: true,
  verify_email: false,
});

watch(
  () => form.email,
  (val) => {
    if (!val.trim()) form.verify_email = false;
  },
);

function resetForm() {
  form.first_name = '';
  form.last_name = '';
  form.mobile = '';
  form.email = '';
  form.identity_card = '';
  form.password = '';
  form.role = UserRole.USER;
  form.verify_mobile = true;
  form.verify_email = false;
  errors.value = {};
  showPassword.value = false;
}

watch(
  () => [props.visible, props.userId] as const,
  async ([visible, id]) => {
    if (!visible) return;
    resetForm();
    if (!id) return;

    loadingUser.value = true;
    const user = await getUserById(id);
    loadingUser.value = false;
    if (!user) return;

    form.first_name = user.first_name ?? '';
    form.last_name = user.last_name ?? '';
    form.mobile = user.mobile ?? '';
    form.email = user.email ?? '';
    form.identity_card = user.identity_card ?? '';
    form.role = user.role ?? UserRole.USER;
    form.verify_mobile = Boolean(user.verify_mobile);
    form.verify_email = Boolean(user.verify_email);
  },
);

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

async function submit() {
  if (!validate()) return;
  saving.value = true;

  const mobile = toEnglishDigits(form.mobile).trim();
  const identityCard = toEnglishDigits(form.identity_card).trim();
  const email = form.email.trim();
  const password = form.password.trim();

  const ok =
    isEdit.value && props.userId
      ? await updateUser(props.userId, {
          first_name: form.first_name.trim() || null,
          last_name: form.last_name.trim() || null,
          mobile,
          email: email || null,
          identity_card: identityCard || null,
          role: form.role,
          verify_mobile: form.verify_mobile,
          verify_email: email ? form.verify_email : false,
          ...(password ? { password } : {}),
        })
      : await createUser({
          first_name: form.first_name.trim() || undefined,
          last_name: form.last_name.trim() || undefined,
          mobile,
          email: email || undefined,
          identity_card: identityCard || undefined,
          role: form.role,
          verify_mobile: form.verify_mobile,
          verify_email: email ? form.verify_email : false,
          ...(password ? { password } : {}),
        });

  saving.value = false;
  if (!ok) return;

  emit('update:visible', false);
  emit('saved');
}
</script>

<template>
  <section
    class="relative flex min-h-screen w-full items-center justify-center"
  >
    <div
      class="pointer-events-none absolute inset-0 flex w-screen items-center justify-center overflow-hidden [mask-image:radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_85%)]"
    >
      <IconsLoginGround />
    </div>

    <div
      class="relative mx-5 flex w-[27rem] flex-col justify-center rounded-2xl bg-white px-4 py-8 shadow-lg md:px-8"
    >
      <NuxtLink to="/" class="flex flex-col items-center text-center">
        <span
          class="font-modam flex items-center text-4xl font-semibold text-primary-600"
        >
          نیمورا
        </span>
      </NuxtLink>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <p class="font-vazir mb-2 text-lg font-medium text-surface-800">
          کد تایید را وارد کنید
        </p>
        <p class="mb-6 text-sm text-surface-500">
          کد تأیید به
          <span class="font-modam font-bold text-surface-700">{{
            identity
          }}</span>
          ارسال شد.
        </p>

        <form
          class="flex flex-col items-center gap-6"
          @submit.prevent="onSubmit(otpCode)"
        >
          <InputOtp
            ref="otpRef"
            v-model="otpCode"
            :length="otpLength"
            dir="ltr"
            integerOnly
            variant="filled"
            size="large"
            class="font-modam"
            :pt="{
              pcInputText: {
                root: ' focus:ring-nimoura-primary! focus:border-nimoura-primary!',
              },
            }"
            @complete="onSubmit(otpCode)"
          />

          <Button
            type="submit"
            :label="isSyncingCart ? 'در حال هماهنگ‌سازی سبد خرید...' : 'ادامه'"
            :loading="isLoading"
            :disabled="submitDisabled"
            class="w-full! bg-nimoura-primary! border-none!"
            size="large"
          />
        </form>

        <div class="mt-5 text-center">
          <AuthResendOtp :duration="30" @resend="sendOtpAgain" />
        </div>
      </div>

      <button
        type="button"
        class="mt-4 self-center text-sm font-medium text-nimoura-text-500 hover:underline"
        @click="emit('edit')"
      >
        ویرایش اطلاعات
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const otpRef = ref();

const { identity } = defineProps<{
  identity: string;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
}>();

const route = useRoute();
const { syncCart } = useCartActions();
const toast = useAppToast();

const otpLength = 5;
const otpCode = ref("");
const isLoading = ref(false);
const isSyncingCart = ref(false);

const submitDisabled = computed(
  () => otpCode.value.length !== otpLength || isLoading.value,
);

// جلوگیری از Open Redirect: فقط مسیرهای داخلی (با یک اسلش، نه //) قابل قبولن
function safeRedirect(): string {
  const raw = route.query.redirect;
  const target = typeof raw === "string" ? raw : "/profile";

  if (target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/profile";
}

async function onSubmit(code: string) {
  if (code.length !== otpLength || isLoading.value) return;

  isLoading.value = true;

  try {
    const data: any = await $fetch("/api/auth/check-otp", {
      method: "POST",
      body: { username: identity, code },
    });

    const auth = useAuth();
    auth.value = data.data.user;

    toast.success(data.data.message);

    // سینک سبد مهمان با سبد بک‌اند (اگه سبدی برای سینک وجود داشته باشه)
    // خطای این مرحله عمداً کاربر رو بلاک نمی‌کنه؛ فقط سایلنت لاگ می‌شه
    isSyncingCart.value = true;
    await syncCart();
    isSyncingCart.value = false;

    await navigateTo(safeRedirect());
  } catch (err: any) {
    toast.error(err?.data?.message || "خطا در احراز هویت");
  } finally {
    isLoading.value = false;
    isSyncingCart.value = false;
  }
}

function sendOtpAgain() {
  $fetch("/api/auth/send-otp", {
    method: "POST",
    body: { username: identity },
  }).catch(() => {
    toast.error("ارسال مجدد کد با خطا مواجه شد");
  });
}

onMounted(() => {
  nextTick(() => {
    const firstInput = otpRef.value?.$el?.querySelector("input");
    firstInput?.focus();
  });
});

watch(otpCode, (val) => {
  if (val.length === otpLength && !isLoading.value) {
    onSubmit(val);
  }
});
</script>

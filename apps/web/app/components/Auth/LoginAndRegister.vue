<template>
  <section class="relative flex min-h-screen w-full items-center justify-center">
    <!-- BACKGROUND -->
   
      <IconsLoginGround />
   

    <!-- CARD -->
    <div class="relative mx-5 flex w-[27rem] flex-col justify-center rounded-2xl bg-white px-4 py-10 shadow-lg md:px-8">
      <NuxtLink to="/" class="flex flex-col items-center text-center">
        <span class="font-modam flex items-center text-4xl font-semibold text-nimoura-primary">
          نیمورا
        </span>
      </NuxtLink>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <p class="font-vazir mb-6 text-lg font-medium text-surface-800">ورود | ثبت‌نام</p>

        <!-- نمایش وضعیت کد معرف (در صورت ورود از طریق لینک دعوت) -->
        <div
          v-if="activeReferralCode"
          class="mb-5 flex items-center justify-between rounded-xl border border-primary-200/90 bg-primary-50/70 p-3 text-xs"
        >
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-nimoura-primary text-xs text-white">
              🎁
            </span>
            <div class="text-right">
              <div class="text-[11px] text-surface-600">دعوت‌شده با کد معرف</div>
              <div class="font-mono font-bold text-primary-700 tracking-wider">{{ activeReferralCode }}</div>
            </div>
          </div>
          <span class="rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
            هدیه خرید اول فعال است
          </span>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label for="identity" class="mb-2 block text-sm font-medium text-surface-700">
              لطفا شماره موبایل خود را وارد کنید
            </label>

            <InputText
              id="identity"
              v-model="identity"
              type="text"
              inputmode="tel"
              placeholder="09xxxxxxxxx"
              class="font-modam! w-full! focus:border-nimoura-primary!"
              :invalid="!!error"
              size="large"
              autofocus
            />

            <Transition name="fade-slide">
              <Message v-if="error" severity="error" size="small" variant="simple" class="mt-2">
                {{ error }}
              </Message>
            </Transition>
          </div>

          <!-- فیلد اختیاری درج کد معرف برای کاربرانی که دستی مایلند وارد کنند -->
          <div v-if="!activeReferralCode" class="pt-1">
            <button
              type="button"
              class="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              @click="showManualReferral = !showManualReferral"
            >
              <span>کد معرف دارید؟</span>
              <i :class="showManualReferral ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-[10px]" />
            </button>

            <div v-if="showManualReferral" class="mt-2 flex gap-2">
              <InputText
                v-model="manualReferralCode"
                placeholder="مثال: REF-8CD34F"
                class="font-mono uppercase text-xs w-full"
                size="small"
                @blur="saveManualReferral"
              />
              <Button
                type="button"
                label="ثبت"
                size="small"
                class="shrink-0 text-xs px-3 bg-surface-800 border-none text-white hover:bg-surface-900"
                @click="saveManualReferral"
              />
            </div>
          </div>

          <Button
            type="submit"
            label="ورود"
            :loading="isLoading"
            class="w-full! border-none! bg-nimoura-primary!"
            size="large"
          />
        </form>

        <p class="mt-6 text-center text-sm leading-6 text-surface-600">
          ورود شما به معنای پذیرش
          <NuxtLink to="/rules" class="text-primary-600 hover:underline">قوانین سایت</NuxtLink>
          است
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  (e: "success", identity: string): void;
}>();

const toast = useAppToast();
const route = useRoute();

// مدیریت و ردیابی کد معرف
const cookieRef = useCookie<string | null>("nimoura_ref", {
  maxAge: 60 * 60 * 24 * 30, // 30 روز
  path: "/",
  sameSite: "lax",
});

// در صورت وجود در query، مقدار کوکی را همگام کن
const queryRef = typeof route.query.ref === "string" ? route.query.ref.trim().toUpperCase() : "";
if (queryRef) {
  cookieRef.value = queryRef;
  if (import.meta.client) {
    try {
      localStorage.setItem("nimoura_ref", queryRef);
    } catch {}
  }
}

const activeReferralCode = computed(() => {
  return queryRef || cookieRef.value || "";
});

const showManualReferral = ref(false);
const manualReferralCode = ref("");

function saveManualReferral() {
  const val = manualReferralCode.value.trim().toUpperCase();
  if (val) {
    cookieRef.value = val;
    if (import.meta.client) {
      try {
        localStorage.setItem("nimoura_ref", val);
      } catch {}
    }
    toast.success("کد معرف با موفقیت اعمال شد");
  }
}

const identity = ref("");
const error = ref("");
const isLoading = ref(false);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^09\d{9}$/;

const isEmail = (val: string) => EMAIL_REGEX.test(val);
const isPhone = (val: string) => PHONE_REGEX.test(val);

async function onSubmit() {
  const value = identity.value.trim();
  let type: "email" | "sms" | null = null;

  if (value.includes("@")) {
    if (!isEmail(value)) return (error.value = "ایمیل معتبر نیست");
    type = "email";
  } else if (value.startsWith("09") || value.startsWith("+98")) {
    if (!isPhone(value)) return (error.value = "شماره موبایل معتبر نیست");
    type = "sms";
  } else {
    return (error.value = "شماره موبایل معتبر نیست.");
  }

  isLoading.value = true;

  try {
    const data: any = await $fetch("/api/auth/send-otp", {
      method: "POST",
      body: { username: value },
    });

    toast.info(data.data.message);
    error.value = "";
    emit("success", value);
  } catch (err: any) {
    error.value = err?.data?.data?.message || "ارسال کد با خطا مواجه شد";
  } finally {
    isLoading.value = false;
  }
}

watch(identity, () => {
  if (error.value) error.value = "";
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
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
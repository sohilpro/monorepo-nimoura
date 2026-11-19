<script setup lang="ts">
const contact = ref('');
const submitted = ref(false);
const loading = ref(false);
const toast = useAppToast();

async function subscribe() {
  const val = contact.value.trim();
  if (!val) {
    toast.add({
      severity: 'warn',
      summary: 'ورودی الزامی است',
      detail: 'لطفاً شماره موبایل یا ایمیل خود را وارد نمایید.',
      life: 3000,
    });
    return;
  }

  const isPhone = /^(?:0|\+?98)?(9\d{9})$/.test(val);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  if (!isPhone && !isEmail) {
    toast.add({
      severity: 'error',
      summary: 'فرمت نامعتبر',
      detail: 'لطفاً یک شماره موبایل معتبر یا یک ایمیل صحیح وارد کنید.',
      life: 4000,
    });
    return;
  }

  loading.value = true;
  try {
    const res: any = await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { contact: val, source: 'magazine' },
    });
    submitted.value = true;
    toast.add({
      severity: 'success',
      summary: 'عضویت در خبرنامه',
      detail: res?.data?.message || res?.message || 'عضویت شما با موفقیت ثبت شد!',
      life: 4000,
    });
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: err?.data?.message || err?.message || 'خطایی در ثبت عضویت رخ داد.',
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-nimoura-velvet px-8 py-14 text-center sm:px-16" dir="rtl">
    <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-nimoura-primary/25 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-nimoura-accent/25 blur-3xl" />

    <div class="relative mx-auto max-w-lg">
      <div class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-nimoura-accent mb-2">
        <i class="pi pi-sparkles text-xs" />
        <span>مجله تخصصی و خبرنامه نیمورا</span>
      </div>
      <h2 class="mt-2 font-display text-3xl font-bold text-white sm:text-4xl font-vazir">
        تخفیف‌های اختصاصی و تازه‌های زیبایی
      </h2>
      <p class="mt-3 text-sm leading-7 text-white/70 font-vazir">
        جشنواره‌های ویژه، کدهای تخفیف هدیه و جدیدترین مقالات مراقبت پوست؛ مستقیم در پیامک یا ایمیل‌تان.
      </p>

      <form v-if="!submitted" class="mt-7 flex flex-col gap-3 sm:flex-row" @submit.prevent="subscribe">
        <PInputText
          v-model="contact"
          type="text"
          dir="ltr"
          required
          placeholder="شماره موبایل یا ایمیل شما"
          class="!bg-white/10 !border-white/20 !text-white flex-1 placeholder:!text-white/40 placeholder:!text-right"
        />
        <PButton
          type="submit"
          :label="loading ? 'در حال ثبت...' : 'عضویت در خبرنامه'"
          :disabled="loading || !contact.trim()"
          class="!bg-nimoura-accent !border-nimoura-accent !text-nimoura-velvet !font-bold sm:w-40"
        />
      </form>
      <div v-else class="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-300 bg-white/10 py-3 rounded-2xl">
        <i class="pi pi-check-circle text-lg" />
        <span>عضویت شما با موفقیت ثبت شد! منتظر شگفتانه‌های ما باشید.</span>
      </div>
    </div>
  </section>
</template>

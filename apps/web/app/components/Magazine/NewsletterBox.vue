<script setup lang="ts">
const email = ref('');
const submitted = ref(false);
const loading = ref(false);

async function subscribe() {
  if (!email.value) return;
  loading.value = true;
  try {
    // مسیر واقعی خبرنامه پروژه را جایگزین کنید (مثلا /api/newsletter/subscribe)
    await $fetch('/api/newsletter/subscribe', { method: 'POST', body: { email: email.value } }).catch(() => {});
    submitted.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-nimoura-velvet px-8 py-14 text-center sm:px-16">
    <div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-nimoura-primary/25 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-nimoura-accent/25 blur-3xl" />

    <div class="relative mx-auto max-w-lg">
      <p class="text-sm text-nimoura-accent">مجله زیبایی نیمورا</p>
      <h2 class="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        هر هفته یک نکته تازه برای پوست و آرایش‌تان
      </h2>
      <p class="mt-3 text-sm leading-7 text-white/60">
        بدون تبلیغ و فقط چیزی که واقعا به کارتان می‌آید؛ مستقیم توی ایمیل‌تان.
      </p>

      <form v-if="!submitted" class="mt-7 flex flex-col gap-3 sm:flex-row" @submit.prevent="subscribe">
        <PInputText
          v-model="email"
          type="email"
          required
          placeholder="ایمیل شما"
          class="!bg-white/10 !border-white/20 !text-white flex-1 placeholder:!text-white/40"
        />
        <PButton
          type="submit"
          :label="loading ? 'در حال ثبت...' : 'عضویت'"
          :disabled="loading"
          class="!bg-nimoura-accent !border-nimoura-accent !text-nimoura-velvet !font-bold sm:w-32"
        />
      </form>
      <p v-else class="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-nimoura-success">
        <i class="pi pi-check-circle" />
        عضویت شما با موفقیت ثبت شد
      </p>
    </div>
  </section>
</template>

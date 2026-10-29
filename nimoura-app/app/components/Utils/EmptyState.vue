<template>
  <Card
    :class="['w-full rounded-2xl bg-gray-50 border border-gray-200/70 shadow-none text-center', wrapperClass]"
    :pt="{
      body: { class: 'flex flex-col items-center justify-center gap-4 p-6 sm:p-8' },
      header: { class: 'flex items-center justify-center pt-6 sm:pt-8 pb-0' },
      title: { class: 'font-bold text-gray-800 text-lg sm:text-xl m-0' },
      content: { class: 'text-gray-600 text-sm sm:text-base leading-relaxed p-0 space-y-1 w-full' },
      footer: { class: 'flex flex-wrap items-center justify-center gap-3 w-full p-0 mt-2' }
    }"
  >
    <!-- آیکن/تصویر -->
    <template #header v-if="illustrationUrl || icon || emoji">
      <div v-if="illustrationUrl" v-html="illustrationUrl" />
      <div
        v-else
        class="grid place-items-center rounded-full bg-white size-16 sm:size-20 shadow"
      >
        <!-- پشتیبانی همزمان از آیکن‌های پرایم‌ویو (pi) و SVG های کاستوم شما -->
        <i v-if="icon && icon.startsWith('pi')" :class="[icon, 'text-3xl! text-gray-500']"></i>
      </div>
    </template>

    <!-- عنوان -->
    <template #title v-if="title">
      {{ title }}
    </template>

    <!-- توضیح و محتوای اضافی -->
    <template #content>
      <p v-if="description">
        {{ description }}
      </p>
      <slot name="extra" />
    </template>

    <!-- اکشن‌ها -->
    <template #footer v-if="primary || secondary">
      <!-- دکمه اصلی -->
      <Button
        v-if="primary"
        :label="primary.label || 'اقدام'"
        :as="primary.to ? NuxtLink : 'button'"
        :to="primary.to"
        @click="!primary.to ? $emit('primary') : undefined"
        rounded
        class="min-w-[120px] bg-nimoura-primary! border-none!"
      />

      <!-- دکمه دوم (فرعی) -->
      <Button
        v-if="secondary"
        :label="secondary.label || 'بعداً'"
        severity="secondary"
        variant="outlined"
        outlined
        rounded
        @click="$emit('secondary')"
        class="min-w-[120px]"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

// توجه: نیازی به ایمپورت دستی Card و Button نیست (Nuxt PrimeVue خودش هندل میکنه)

defineProps<{
  title?: string;
  description?: string;
  icon?: string; // می‌تواند id مربوط به SVG باشد یا کلاس آیکن پرایم‌ویو (مثل 'pi pi-shopping-bag')
  emoji?: string;
  illustrationUrl?: string;
  primary?: { label: string; to?: string } | null;
  secondary?: { label: string } | null;
  wrapperClass?: string;
}>();

defineEmits<{
  (e: "primary"): void;
  (e: "secondary"): void;
}>();
</script>
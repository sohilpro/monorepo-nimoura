<template>
  <section class="mt-8 flex w-full items-center justify-center px-4 sm:mt-14">
    <div class="relative w-full max-w-md">
      <!-- ICON BADGE -->
      <div class="absolute -top-9 left-1/2 z-10 -translate-x-1/2">
        <div
          class="flex size-[4.5rem] items-center justify-center rounded-full shadow-lg ring-[6px] ring-nimoura-base"
          :class="badgeClass"
        >
          <ProgressSpinner
            v-if="result.status === 'loading'"
            style="width: 28px; height: 28px"
            stroke-width="5"
            fill="transparent"
            animation-duration=".9s"
          />
          <i v-else-if="result.status === 'success'" class="pi pi-check text-2xl text-white" />
          <i v-else class="pi pi-times text-2xl text-white" />
        </div>
      </div>

      <div class="rounded-2xl border border-nimoura-text-100 bg-white pb-6 pt-12 shadow-[0_20px_45px_-25px_rgba(58,49,49,0.25)]">
        <!-- HEADER -->
        <div class="px-6 text-center">
          <h2 class="text-lg font-bold" :class="titleClass">{{ title }}</h2>
          <p class="mt-1.5 text-sm leading-6 text-nimoura-text-500">{{ result.message }}</p>
        </div>

        <div class="mt-6 px-6">
          <Divider class="!my-0" />
        </div>

        <!-- DETAILS -->
        <div class="px-6 pt-5">
          <div v-if="result.status === 'loading'" class="space-y-4">
            <Skeleton v-for="i in 4" :key="i" height="1.1rem" border-radius="6px" />
          </div>

          <ul v-else class="flex flex-col gap-y-4 text-sm">
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-nimoura-text-500">
                <i class="pi pi-shield text-nimoura-text-300" />
                درگاه پرداخت
              </span>
              <span class="font-medium text-nimoura-text-700">{{ gatewayLabel }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-nimoura-text-500">
                <i class="pi pi-calendar text-nimoura-text-300" />
                تاریخ تراکنش
              </span>
              <span class="font-modam font-medium text-nimoura-text-700">{{ formattedDate }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-nimoura-text-500">
                <i class="pi pi-hashtag text-nimoura-text-300" />
                شماره پیگیری
              </span>
              <span class="font-modam font-medium text-nimoura-text-700">{{ result.refId || "—" }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-nimoura-text-500">
                <i class="pi pi-info-circle text-nimoura-text-300" />
                وضعیت
              </span>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  result.status === 'success'
                    ? 'bg-nimoura-primary/10 text-nimoura-primary'
                    : 'bg-nimoura-deep/10 text-nimoura-deep'
                "
              >
                {{ result.status === "success" ? "پرداخت موفق" : "پرداخت ناموفق" }}
              </span>
            </li>
          </ul>
        </div>

        <!-- ACTIONS -->
        <div v-if="result.status !== 'loading'" class="mt-6 flex items-center gap-x-2 px-6">
          <NuxtLink to="/" class="flex-1">
            <Button label="بازگشت به خانه" outlined class="!w-full !border-nimoura-text-200 !text-nimoura-text-600" />
          </NuxtLink>

          <NuxtLink v-if="result.status === 'success'" to="/profile" class="flex-1">
            <Button label="پیگیری سفارش" class="!w-full !bg-nimoura-primary !border-nimoura-primary" />
          </NuxtLink>
          <NuxtLink v-else to="/checkout/payment" class="flex-1">
            <Button label="تلاش مجدد" class="!w-full !bg-nimoura-primary !border-nimoura-primary" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  result: PaymentResult;
}>();

const title = computed(() => {
  if (props.result.status === "loading") return "در حال تایید تراکنش";
  return props.result.status === "success" ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود";
});

const titleClass = computed(() =>
  props.result.status === "loading"
    ? "text-nimoura-text-700"
    : props.result.status === "success"
    ? "text-nimoura-primary"
    : "text-nimoura-deep"
);

const badgeClass = computed(() =>
  props.result.status === "loading"
    ? "bg-gradient-to-br from-nimoura-text-300 to-nimoura-text-400"
    : props.result.status === "success"
    ? "bg-gradient-to-br from-nimoura-primary to-nimoura-gold"
    : "bg-gradient-to-br from-nimoura-deep to-nimoura-primary"
);

const gatewayLabel = computed(() => (props.result.gateway === "torobpay" ? "ترب‌پی" : "زرین‌پال"));
const formattedDate = computed(() => formatDate(props.result.date));
</script>

<style scoped>
:deep(.p-progress-spinner-circle) {
  stroke: #ffffff !important;
}
</style>
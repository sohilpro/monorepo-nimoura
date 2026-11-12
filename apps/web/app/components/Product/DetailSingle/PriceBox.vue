<template>
  <!-- ══ DESKTOP PRICE BOX ══ -->
  <aside
    class="hidden w-full shrink-0 flex-col gap-5 rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] lg:sticky lg:top-6 lg:flex lg:w-[290px] xl:w-[320px]"
    aria-label="اطلاعات قیمت و خرید"
  >
    <div
      class="flex items-center justify-between gap-2 border-b border-nimoura-text-100/80 pb-3.5"
    >
      <span
        class="inline-flex items-center gap-1.5 text-xs font-medium"
        :class="stockBadge.textClass"
      >
        <span class="size-2 rounded-full" :class="stockBadge.dotClass" />
        {{ stockBadge.label }}
      </span>

      <span
        v-if="isVariantProduct && selectedVariant"
        class="inline-flex max-w-[145px] items-center gap-1.5 rounded-full border border-nimoura-text-100 bg-nimoura-base/60 px-2.5 py-1 text-[11px] font-medium text-nimoura-text-700"
      >
        <span
          v-if="selectedVariant.colorHex"
          class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
          :style="{ backgroundColor: selectedVariant.colorHex }"
        />
        <span class="truncate">{{ selectedVariant.alt }}</span>
      </span>
    </div>

    <div class="flex flex-col gap-1.5">
      <div v-if="hasDiscount" class="flex items-center justify-between gap-2">
        <span class="font-vazir text-sm text-nimoura-text-400 line-through">
          {{ numberFormat(basePrice) }}
          <span class="text-xs">تومان</span>
        </span>
        <span
          class="rounded-full bg-nimoura-primary/12 px-2.5 py-0.5 font-modam text-xs font-bold text-nimoura-primary"
        >
          {{ numberFormat(discountPercent) }}٪ تخفیف
        </span>
      </div>

      <div class="flex items-baseline justify-between gap-2">
        <span class="text-xs text-nimoura-text-400">قیمت نهایی</span>
        <div class="flex items-baseline gap-1.5">
          <span
            class="font-vazir text-2xl font-bold tracking-tight text-nimoura-text-900 xl:text-[26px]"
          >
            {{ numberFormat(finalPrice) }}
          </span>
          <span class="text-xs font-medium text-nimoura-text-500">تومان</span>
        </div>
      </div>
    </div>

    <div
      v-if="!isOutOfStock && finalPrice > 0"
      class="torobpay-widget-media torobpay-logo-light-sweep flex items-center gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-3 py-2.5"
    >
      <IconsTorobPay class="size-6 shrink-0 torobpay-widget-image" />
      <p class="text-xs leading-5 text-emerald-800">
        <span class="font-modam font-semibold">۴</span> قسط ماهانه
        <span class="font-modam font-semibold">{{
          numberFormat(installmentPrice)
        }}</span>
        تومانی با ترب‌پی
      </p>
    </div>

    <div class="flex flex-col gap-2.5">
      <p
        v-if="needsVariantSelection"
        class="text-center text-xs font-medium text-nimoura-primary"
      >
        لطفاً ابتدا گزینه مورد نظر را انتخاب کنید
      </p>

      <ClientOnly>
        <div
          v-if="cartQuantity > 0 && !isOutOfStock"
          class="flex items-center gap-2"
        >
          <div
            class="flex h-11 flex-1 items-center justify-between rounded-xl border border-nimoura-primary/30 bg-nimoura-base/60 px-2"
          >
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-nimoura-primary transition-colors hover:bg-white disabled:opacity-40"
              :disabled="busy || cartQuantity >= availableStock"
              aria-label="افزایش تعداد"
              @click="handleIncrease"
            >
              <i class="pi pi-plus text-xs!" />
            </button>
            <span class="font-modam text-sm font-bold text-nimoura-text-800">
              {{ numberFormat(cartQuantity) }}
            </span>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-lg text-nimoura-primary transition-colors hover:bg-white disabled:opacity-40"
              :disabled="busy"
              :aria-label="cartQuantity <= 1 ? 'حذف از سبد خرید' : 'کاهش تعداد'"
              @click="handleDecrease"
            >
              <i
                :class="
                  cartQuantity <= 1
                    ? 'pi pi-trash text-xs!'
                    : 'pi pi-minus text-xs!'
                "
              />
            </button>
          </div>

          <NuxtLink
            to="/cart"
            class="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-nimoura-primary px-3.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(183,110,121,0.25)] transition-all hover:bg-nimoura-primary/90"
          >
            <span>سبد خرید</span>
            <i class="pi pi-arrow-left text-[11px]!" />
          </NuxtLink>
        </div>

        <Button
          v-else
          :label="ctaLabel"
          :icon="isOutOfStock ? 'pi pi-ban' : 'pi pi-shopping-bag'"
          icon-pos="left"
          :loading="busy"
          :disabled="isOutOfStock"
          class="!w-full !rounded-xl !border-nimoura-primary !bg-nimoura-primary !py-3 !text-sm !font-semibold !shadow-[0_6px_18px_rgba(183,110,121,0.26)] transition-all hover:!bg-nimoura-primary/90 disabled:!opacity-55"
          @click="handleAddToCart"
        />

        <template #fallback>
          <Button
            :label="ctaLabel"
            :icon="isOutOfStock ? 'pi pi-ban' : 'pi pi-shopping-bag'"
            icon-pos="left"
            :disabled="isOutOfStock"
            class="!w-full !rounded-xl !border-nimoura-primary !bg-nimoura-primary !py-3 !text-sm !font-semibold !shadow-[0_6px_18px_rgba(183,110,121,0.26)] disabled:!opacity-55"
          />
        </template>
      </ClientOnly>
    </div>

    <ul
      class="flex flex-col gap-2.5 border-t border-nimoura-text-100/80 pt-3.5 text-xs text-nimoura-text-500"
    >
      <li class="flex items-center gap-2">
        <i
          class="pi pi-truck shrink-0 text-sm! text-nimoura-primary"
          aria-hidden="true"
        />
        <span>
          ارسال رایگان بالای
          <span class="font-modam font-semibold text-nimoura-text-700"
            >۴,۰۰۰,۰۰۰</span
          >
          تومان
        </span>
      </li>
      <li class="flex items-center gap-2">
        <i
          class="pi pi-verified shrink-0 text-sm! text-nimoura-primary"
          aria-hidden="true"
        />
        <span>تضمین اصالت و سلامت فیزیکی کالا</span>
      </li>
      <li class="flex items-center gap-2">
        <i
          class="pi pi-refresh shrink-0 text-sm! text-nimoura-primary"
          aria-hidden="true"
        />
        <span>۷ روز ضمانت بازگشت کالا</span>
      </li>
    </ul>
  </aside>

  <!-- ══ MOBILE STICKY BOTTOM PRICE BAR ══ -->
  <div
    class="fixed inset-x-0 bottom-0 z-70 rounded-t-2xl border-t border-nimoura-text-100/80 bg-white/95 px-3 pt-2.5 shadow-[0_-8px_24px_rgba(39,33,33,0.08)] backdrop-blur-md lg:hidden"
    :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }"
    role="region"
    aria-label="خرید سریع محصول"
  >
    <div class="mx-auto w-full max-w-screen-md">
      <ProductDetailSingleInstallmentBanner :price="finalPrice" class="mb-2" />

      <div class="flex items-center justify-between gap-3">
        <!-- ── اکشن‌ها (سمت راست در RTL) ── -->
        <div class="flex shrink-0 items-center gap-2">
          <ClientOnly>
            <template v-if="cartQuantity > 0 && !isOutOfStock">
              <div
                class="flex h-11 items-center rounded-xl border border-nimoura-primary/30 bg-nimoura-base/70 p-0.5"
              >
                <button
                  type="button"
                  class="flex size-9 items-center justify-center rounded-lg text-nimoura-primary transition active:scale-95 active:bg-white disabled:opacity-40"
                  :disabled="busy || cartQuantity >= availableStock"
                  aria-label="افزایش تعداد"
                  @click="handleIncrease"
                >
                  <i class="pi pi-plus text-xs!" />
                </button>
                <span
                  class="min-w-6 text-center font-modam text-sm font-bold text-nimoura-text-800"
                >
                  {{ numberFormat(cartQuantity) }}
                </span>
                <button
                  type="button"
                  class="flex size-9 items-center justify-center rounded-lg text-nimoura-primary transition active:scale-95 active:bg-white disabled:opacity-40"
                  :disabled="busy"
                  :aria-label="
                    cartQuantity <= 1 ? 'حذف از سبد خرید' : 'کاهش تعداد'
                  "
                  @click="handleDecrease"
                >
                  <i
                    :class="
                      cartQuantity <= 1
                        ? 'pi pi-trash text-xs!'
                        : 'pi pi-minus text-xs!'
                    "
                  />
                </button>
              </div>

              <NuxtLink
                to="/cart"
                class="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-nimoura-primary px-3 text-xs font-medium text-white shadow-[0_4px_12px_rgba(183,110,121,0.25)] transition active:scale-95 active:bg-nimoura-primary/90 min-[360px]:px-4"
                aria-label="مشاهده سبد خرید"
              >
                <i class="pi pi-shopping-bag text-sm!" />
                <span class="hidden min-[360px]:inline">سبد خرید</span>
              </NuxtLink>
            </template>

            <Button
              v-else
              :label="mobileCtaLabel"
              :icon="isOutOfStock ? 'pi pi-ban' : 'pi pi-shopping-bag'"
              icon-pos="left"
              :loading="busy"
              :disabled="isOutOfStock"
              class="!h-11 !min-w-[132px] !rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !text-[13px] !font-medium !shadow-[0_4px_12px_rgba(183,110,121,0.25)] active:!scale-95 disabled:!opacity-55"
              @click="handleAddToCart"
            />

            <template #fallback>
              <Button
                :label="mobileCtaLabel"
                :icon="isOutOfStock ? 'pi pi-ban' : 'pi pi-shopping-bag'"
                icon-pos="left"
                :disabled="isOutOfStock"
                class="!h-11 !min-w-[132px] !rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-4 !text-[13px] !font-medium !shadow-[0_4px_12px_rgba(183,110,121,0.25)] disabled:!opacity-55"
              />
            </template>
          </ClientOnly>
        </div>

        <!-- ── قیمت (سمت چپ در RTL) ── -->
        <div class="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-end">
          <div
            v-if="hasDiscount"
            class="flex items-center gap-1.5 leading-none"
          >
            <span
              class="font-vazir text-[11px] text-nimoura-text-400 line-through"
            >
              {{ numberFormat(basePrice) }}
            </span>
            <span
              class="rounded-md bg-nimoura-primary/10 px-1.5 py-1 font-modam text-[10px] font-bold text-nimoura-primary"
            >
              {{ numberFormat(discountPercent) }}٪
            </span>
          </div>

          <div class="flex items-baseline gap-1">
            <span
              class="font-vazir text-base font-extrabold leading-tight text-nimoura-text-900 min-[380px]:text-[17px]"
            >
              {{ numberFormat(finalPrice) }}
            </span>
            <span class="text-[10px] text-nimoura-text-500">تومان</span>
          </div>

          <span
            v-if="isVariantProduct && selectedVariant"
            class="inline-flex max-w-full items-center gap-1 text-[10px] leading-none text-nimoura-text-400"
          >
            <span
              v-if="selectedVariant.colorHex"
              class="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
              :style="{ backgroundColor: selectedVariant.colorHex }"
            />
            <span class="truncate">{{ selectedVariant.alt }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductVariantOption } from "~/composables/useProductPurchase";

const props = defineProps<{
  product: any;
  selectedVariant?: ProductVariantOption | null;
}>();

const {
  busy,
  isVariantProduct,
  needsVariantSelection,
  availableStock,
  isOutOfStock,
  basePrice,
  hasDiscount,
  finalPrice,
  discountPercent,
  installmentPrice,
  stockBadge,
  ctaLabel,
  cartQuantity,
  handleAddToCart,
  handleIncrease,
  handleDecrease,
} = useProductPurchase(
  () => props.product,
  () => props.selectedVariant,
);

const mobileCtaLabel = computed(() => {
  if (isOutOfStock.value) return "ناموجود";
  if (needsVariantSelection.value) return "انتخاب گزینه";
  return "افزودن به سبد";
});
</script>

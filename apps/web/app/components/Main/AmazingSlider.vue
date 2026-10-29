<script setup lang="ts">
import useEmblaCarousel from "embla-carousel-vue";

interface AmazingProduct {
  id: number | string;
  title: string;
  price: number;
  priceDiscount: number;
  discountPercent?: number;
}

const sectionRef = ref<HTMLElement | null>(null);
const amazingProducts = ref<AmazingProduct[]>([]);
const pending = ref(true);
const hasFetched = ref(false);

// -------------------- Embla --------------------
// نکته‌ی مهم: این div همیشه mount می‌مونه (نه پشت v-if/v-else-if)، دقیقاً
// مثل ProductSlider که درست کار می‌کنه. فقط محتوای داخلش (اسکلتون/کارت واقعی)
// عوض می‌شه. هم‌چنین از dir="rtl" روی DOM استفاده نمی‌کنیم، چون آپشن
// direction: "rtl" خودش کافیه و ست‌کردن هردو باعث خنثی‌شدن drag می‌شه.
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: false,
  align: "start",
  dragFree: true,
  direction: "rtl",
  containScroll: "trimSnaps",
});

// -------------------- Fetch --------------------
async function fetchAmazingProducts() {
  if (hasFetched.value) return;
  pending.value = true;

  try {
    const data: any = await $fetch("/api/products/amazing", {
      query: { limit: 8 },
    });
    amazingProducts.value = data?.data?.products ?? [];
  } catch {
    amazingProducts.value = [];
  } finally {
    pending.value = false;
    hasFetched.value = true;
    await nextTick();
    emblaApi.value?.reInit();
  }
}

// -------------------- Scroll-triggered fetch --------------------
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchAmazingProducts();
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: "200px 0px" },
  );

  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <section ref="sectionRef" class="mx-4 lg:container mt-20">
    <div class="w-full rounded-xl bg-nimoura-primary p-4 relative">
      <!-- هدر موبایل -->
      <div class="flex lg:hidden items-center justify-between mb-3">
        <div class="flex w-full items-center justify-between gap-2">
          <IconsAmazingsMobile class="w-28 h-7" />
          <ProductCountdownTimer :days="3" />
        </div>
        <!-- <NuxtLink
          to="/product/amazing"
          class="flex items-center gap-x-0.5 text-white"
        >
          <p>همه</p>
          <i class="pi pi-arrow-left text-xs!"></i>
        </NuxtLink> -->
      </div>

      <!-- ویوپورت Embla: همیشه mount هست -->
      <div ref="emblaRef" class="overflow-hidden rounded-xl">
        <div class="flex gap-x-2.5 touch-pan-y">
          <!-- تایمر - فقط دسکتاپ -->
          <div
            class="hidden lg:flex flex-none w-40 h-[220px] flex-col justify-center items-center gap-4"
          >
            <NuxtLink to="/product/amazing">
              <IconsAmazings class="w-28 h-28" />
            </NuxtLink>
            <ProductCountdownTimer :days="1" />
          </div>

          <!-- اسکلتون -->
          <template v-if="pending || !hasFetched">
            <div
              v-for="i in 8"
              :key="`skeleton-${i}`"
              class="flex-none w-[148px] h-[220px] bg-white border border-nimoura-border/30 rounded-2xl flex flex-col p-3"
            >
              <div class="flex justify-center items-center h-27 shrink-0">
                <Skeleton width="96px" height="96px" border-radius="0.5rem" />
              </div>
              <div class="flex-1 mt-1 space-y-1.5">
                <Skeleton width="100%" height="0.7rem" />
                <Skeleton width="60%" height="0.7rem" />
              </div>
              <div class="flex flex-col items-end mt-2 gap-1">
                <Skeleton width="3.5rem" height="0.65rem" />
                <Skeleton width="4.5rem" height="0.85rem" />
              </div>
            </div>
          </template>

          <!-- کارت‌های واقعی -->
          <template v-else>
            <ProductCard
              v-for="product in amazingProducts"
              :key="product.id"
              :product="product"
              class="flex-none"
            />

            <!-- مشاهده همه -->
            <div
              v-if="amazingProducts.length"
              class="flex-none flex flex-col justify-center items-center"
            >
              <NuxtLink
                to="/product/amazing"
                class="flex flex-col items-center gap-2 text-nimoura-primary bg-white px-3 h-[220px] justify-center rounded-2xl text-sm text-center"
              >
                <i class="pi pi-arrow-circle-left text-4xl!"></i>
                <p>مشاهده همه</p>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
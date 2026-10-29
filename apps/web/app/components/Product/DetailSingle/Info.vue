<template>
  <div class="w-full lg:w-3/4">
    <div
      class="flex flex-col md:flex-row justify-start gap-x-8 xl:gap-x-5 items-start"
    >
      <!-- IMAGE SLIDER -->
      <ProductDetailSingleImageSlider
        :images="[
          `${product.thumbnail}`,
          ...(product.images?.map((img: any) => `${img.url}`) ?? []),
        ]"
        :customer-reviews="customerReviews"
      />

      <!-- INFOS -->
      <div
        class="w-full gap-y-3 mt-3 lg:mt-0 md:w-3/4 flex flex-col lg:gap-y-7"
      >
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/brand/${createSlug(product.brand.name)}?id=${product.brand.id}`"
            class="font-vazir font-medium text-nimoura-text-400"
            >{{ product.brand.name }}
          </NuxtLink>
          /
          <NuxtLink
            :to="`/brand/${createSlug(product.brand.name)}/${createSlug(product.subBrand.name)}?id=${product.brand.id}&subBrandId=${product.subBrand.id}`"
            class="font-vazir font-medium text-nimoura-text-400"
            >{{ product.subBrand.name }}</NuxtLink
          >
        </div>

        <div class="flex flex-col gap-y-3">
          <h1
            class="text-nimoura-text-800 font-semibold text-xl md:text-2xl leading-tight"
          >
            {{ product.title }}
          </h1>
          <p class="text-sm text-nimoura-text-400">
            {{ product.englishTitle }}
          </p>
          <div class="flex items-center gap-x-2">
            <button
              type="button"
              class="left-2 top-2 z-10 flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors"
              :class="
                inWishlist
                  ? 'text-nimoura-primary'
                  : 'text-nimoura-text-300 hover:text-nimoura-primary'
              "
              @click.stop.prevent="handleToggle"
            >
              <i :class="inWishlist ? 'pi pi-heart-fill' : 'pi pi-heart'" />
            </button>

            <button
              type="button"
              class="flex size-7 items-center justify-center rounded-full text-nimoura-text-300 backdrop-blur-sm transition-colors hover:text-nimoura-primary"
              aria-label="اشتراک‌گذاری محصول"
              @click.stop.prevent="handleShare"
            >
              <i class="pi pi-share-alt text-sm" />
            </button>
            <span class="flex items-center gap-x-1 text-sm font-modam">
              <i class="pi pi-star text-amber-300 text-sm!"></i>
              {{ product.averageRating }} امتیاز
            </span>

            <UtilsBadge> دیدگاه 0 </UtilsBadge>

            <span v-if="product.isAvailable" class="text-green-600">موجود</span>
            <span v-else class="text-red-600">ناموجود</span>
          </div>
        </div>

        <p class="text-nimoura-text-600 text-sm leading-relaxed">
          {{ product.shortDescription }}
        </p>

<div v-if="product.type === 'variant'">
  <ClientOnly>
    <h4>رنگ: {{ selectedVariant?.alt ?? 'انتخاب نشده' }}</h4>

    <div class="flex gap-2">
      <div
        v-for="v in product?.variants"
        :key="v.value + v.alt"
        class="relative group"
      >
        <button
          @click="emit('update:selectedVariant', v)"
          :style="{ background: v.value }"
          class="w-8 h-8 rounded-md border-2 overflow-hidden relative"
          :class="
            selectedVariant?.value === v.value
              ? 'border-white ring-1 ring-nimoura-text-700'
              : 'border-gray-300'
          "
          :disabled="v.stock === 0"
        >
          <div
            v-if="v.stock === 0"
            class="absolute top-1/2 left-0 w-full h-[2px] bg-nimoura-text-700 -rotate-45 origin-center"
          ></div>
        </button>

        <div
          class="absolute whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          {{ v.alt }}
          <div
            class="absolute top-5 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45"
          ></div>
        </div>
      </div>
    </div>
  </ClientOnly>
</div>

        <!-- Features Box  -->
        <div class="w-full flex flex-col gap-y-4">
          <div
            class="flex font-vazir text-nimoura-text-700 items-center justify-between"
          >
            <h1 class="font-bold text-lg">مشخصات</h1>

            <button
              @click="handleGoToSpecifications"
              class="flex items-center text-sm md:hidden"
            >
              مشاهده همه

              <div class="flex mr-1">
                <i class="pi pi-chevron-left text-[10px]!"></i>
              </div>
            </button>
          </div>
          <div class="overflow-x-auto w-full no-scrollbar md:hidden">
            <div
              class="flex gap-2 *:p-2 *:h-16 *:bg-neutral-100 *:rounded-lg *:flex *:flex-col *:gap-y-1.5"
            >
              <div
                v-for="(specification, index) in product.specifications.slice(
                  0,
                  4,
                )"
                :key="index"
                class="min-w-[150px] shrink-0"
              >
                <p class="text-sm text-nimoura-text-500">
                  {{ specification.key }}:
                </p>
                <p
                  class="line-clamp-1 font-vazir font-bold text-sm text-nimoura-text-800"
                >
                  {{ specification.value }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="hidden md:grid grid-cols-12 gap-2 *:p-2 *:h-16 *:bg-neutral-100 *:rounded-lg *:flex *:flex-col *:gap-y-1.5"
          >
            <div
              v-for="(specification, index) in product.specifications.slice(
                0,
                6,
              )"
              :key="index"
              class="col-span-12 md:col-span-6 xl:col-span-4"
            >
              <p class="text-sm text-nimoura-text-500">
                {{ specification.key }}:
              </p>
              <p
                class="line-clamp-1 font-vazir font-bold text-sm text-nimoura-text-800"
              >
                {{ specification.value }}
              </p>
            </div>
          </div>

          <div class="md:flex hidden justify-center items-center gap-4 mt-4">
            <hr class="grow border-gray-200" />
            <button
              @click="handleGoToSpecifications"
              class="relative flex items-center border border-gray-200 px-5 py-2 text-nimoura-text-700 rounded-md"
            >
              <div class="flex items-center justify-center relative grow">
                مشاهده همه ویژگی‌ها
                <div class="flex mr-2">
                  <i class="pi pi-arrow-left text-xs!"></i>
                </div>
              </div>
            </button>
            <hr class="grow border-gray-200" />
          </div>
        </div>
      </div>
    </div>
    <!-- <div
          class="mt-10 lg:mr-2 grid grid-cols-12 child:col-span-6 xl:child:col-span-3 gap-x-1 gap-y-2 lg:gap-4 child:border child:text-gray-400  child:border-gray-200 child:rounded-lg child:h-12 child:p-2 child:flex child:items-center child:gap-x-1 lg:child:gap-x-2 child:text-sm lg:text-base"
        >
          <span>
            <svg class="w-4 h-4 lg:w-6 lg:h-6">
              <use href="#arrow-path-rounded-square"></use>
            </svg>
            <p>ضمانت بازگشت کالا</p>
          </span>
          <span>
            <svg class="w-4 h-4 lg:w-6 lg:h-6">
              <use href="#check-badge"></use>
            </svg>
            <p>تضمین اصالت کالا</p>
          </span>
          <span>
            <svg class="w-4 h-4 lg:w-6 lg:h-6">
              <use href="#calender-day"></use>
            </svg>
            <p>پشتیبانی کل هفته</p>
          </span>
          <span>
            <svg class="w-4 h-4 lg:w-6 lg:h-6">
              <use href="#truke"></use>
            </svg>
            <p>ارسال به سراسر ایران</p>
          </span>
        </div> -->
  </div>
</template>

<script setup lang="ts">
interface Variant {
  id: number;
  value: string;
  alt: string;
  stock: number;
  price?: number;
}

const props = defineProps<{
  product: any;
  Totalcomments?: number;
  selectedVariant?: Variant | null;
}>();

const emit = defineEmits<{
  (e: "update:selectedVariant", val: Variant | null): void;
}>();

const { isInWishlist, toggleWishlist } = useWishlist();
const { share } = useShare();

const inWishlist = computed(() => isInWishlist(props.product.id));

async function handleToggle() {
  await toggleWishlist(props.product.id);
}

function handleShare() {
  const url = `${window.location.origin}/product/${props.product.id}/${createSlug(props.product.title)}`;

  share({
    title: props.product.title,
    text: `محصول «${props.product.title}» رو توی نیمورا ببین`,
    url,
  });
}

// تمام بخش‌های مربوط به localSelected و watch روی آن حذف شدند!
const handleGoToSpecifications = () =>
  nextTick(() => {
    const el = document.querySelector("#specifications");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
</script>

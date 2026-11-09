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

<ProductVariantPicker
          v-if="product.type === 'variant'"
          :variants="product.variants"
          :selected-variant="selectedVariant"
          @update:selected-variant="emit('update:selectedVariant', $event)"
        />

        <!-- AUTOMATIC STATUS: only N left / out of stock -->
        <p
          v-if="stockNotice"
          class="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          :class="stockNotice.tone"
        >
          <i :class="stockNotice.icon" />
          {{ stockNotice.text }}
        </p>

        <!-- PRODUCT TAGS (skin type, hair type, benefits...) -->
        <div v-if="tagGroups.length" class="flex flex-col gap-2.5">
          <div v-for="group in tagGroups" :key="group.name" class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-nimoura-text-400">{{ group.name }}:</span>
            <NuxtLink
              v-for="tag in group.tags"
              :key="tag.id"
              :to="tagLink(tag.id)"
              class="rounded-full border border-nimoura-text-100 bg-nimoura-base/50 px-3 py-1 text-xs text-nimoura-text-700 transition-colors hover:border-nimoura-primary/40 hover:text-nimoura-primary"
            >
              {{ tag.name }}
            </NuxtLink>
          </div>
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

// ─── Tags and stock notice ────────────────────
const tagGroups = computed(() => {
  const groups = new Map<string, { name: string; tags: any[] }>();
  for (const tag of props.product?.tags ?? []) {
    const name = tag.group?.name ?? "ویژگی‌ها";
    if (!groups.has(name)) groups.set(name, { name, tags: [] });
    groups.get(name)!.tags.push(tag);
  }
  return [...groups.values()];
});

// clicking a tag opens the product's category filtered by that tag
const tagLink = (tagId: number) => {
  const category = props.product?.category;
  return category
    ? `/categories/${category.id}/${createSlug(category.name)}?tags=${tagId}`
    : "/";
};

const stockNotice = computed(() => {
  const threshold = props.product?.lowStockThreshold ?? 5;
  const stock =
    props.product?.type === "variant"
      ? props.selectedVariant?.stock
      : props.product?.stock;
  if (stock === undefined || stock === null) return null;
  if (stock <= 0)
    return { text: "ناموجود", icon: "pi pi-times-circle", tone: "bg-rose-50 text-rose-600" };
  if (threshold > 0 && stock <= threshold)
    return {
      text: `تنها ${numberFormat(stock)} عدد در انبار باقی مانده`,
      icon: "pi pi-exclamation-triangle",
      tone: "bg-amber-50 text-amber-700",
    };
  return null;
});

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

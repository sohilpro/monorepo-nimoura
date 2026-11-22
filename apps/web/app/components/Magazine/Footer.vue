<script setup lang="ts">
import type { Article, Category } from '~~/server/types/magazine';

// ── دادههای زنده برای فوتر ─────────────────────────────────────────
const { data: categoriesData } = useMagazineCategoriesTree();
const categories = computed<Category[]>(() => {
  const raw: any = categoriesData.value;
  const list = raw?.data ?? raw;
  return (Array.isArray(list) ? list : []).slice(0, 6);
});

const { data: popularData }: any = useFetch('/api/magazine/articles', {
  query: { sort: 'popular', limit: 4 },
  key: 'magazine-footer-popular',
});
const popular = computed<Article[]>(() => {
  const raw: any = popularData.value;
  const list = raw?.data?.items ?? raw?.items ?? [];
  return Array.isArray(list) ? list : [];
});

const year = computed(() =>
  new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
  }).format(new Date()),
);

const socials = [
  { icon: 'pi pi-instagram', href: 'https://www.instagram.com/nimoura.ir', label: 'اینستاگرام' },
  { icon: 'pi pi-telegram', href: 'https://t.me/nimoura_ir', label: 'تلگرام' },
  { icon: 'pi pi-whatsapp', href: 'https://wa.me/989036039314', label: 'واتساپ' },
];
</script>

<template>
  <footer class="relative mt-auto overflow-hidden bg-nimoura-velvet text-white">
    <div
      class="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-nimoura-primary/15 blur-3xl"
    />
    <div
      class="pointer-events-none absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-nimoura-accent/10 blur-3xl"
    />

    <!-- ── باند خبرنامه (کارت تیره روی باند روشن، هماهنگ با پالت مجله) ── -->
    <div class="relative bg-nimoura-base py-12 sm:py-14">
      <div
        class="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_420px]"
      >
        <div>
          <span
            class="inline-flex items-center gap-2 rounded-full bg-nimoura-velvet/5 px-3 py-1 text-[11px] font-bold text-nimoura-primary"
          >
            <i class="pi pi-envelope text-[10px]" />
            خبرنامه مجله نیمورا
          </span>
          <h2
            class="mt-3 font-modam text-2xl leading-snug font-black text-nimoura-velvet sm:text-3xl"
          >
            هر هفته، یک دوز الهام زیبایی
          </h2>
          <p class="mt-2 max-w-md text-sm leading-7 text-nimoura-text-600">
            تازهترین مقالات، راهنمای روتین پوستی و معرفی محصولات منتخب را مستقیم
            در ایمیل یا پیامک خود دریافت کنید.
          </p>
        </div>
        <MagazineNewsletterBox />
      </div>
    </div>

    <!-- ── ستونهای فوتر ── -->
    <div class="relative mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <!-- برند -->
        <div>
          <NuxtLink to="/magazine" class="inline-block">
            <span class="font-modam text-2xl font-black text-white">
              نیمورا<span class="text-nimoura-primary">مگ</span>
            </span>
          </NuxtLink>
          <p class="mt-3 text-xs leading-6 text-white/60">
            مرجعی تخصصی برای زیبایی آگاهانه؛ پر از راهنما، بررسی و تجربههای
            واقعی از دنیای مراقبت از پوست و آرایش.
          </p>
          <div class="mt-5 flex items-center gap-2">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm text-white/70 transition hover:border-nimoura-primary hover:bg-nimoura-primary hover:text-white"
            >
              <i :class="social.icon" />
            </a>
          </div>
        </div>

        <!-- دستهبندیها (از API) -->
        <div>
          <h3 class="mb-4 text-sm font-bold text-white">دستهبندیها</h3>
          <ul class="space-y-2.5 text-xs text-white/60">
            <li v-for="cat in categories" :key="cat.id">
              <NuxtLink
                :to="`/magazine?category=${cat.slug}`"
                class="inline-flex items-center gap-1.5 transition hover:text-nimoura-accent"
              >
                <i class="pi pi-angle-left text-[9px]" />
                {{ cat.name }}
              </NuxtLink>
            </li>
            <li v-if="!categories.length" class="text-white/40">
              در حال بارگذاری…
            </li>
          </ul>
        </div>

        <!-- محبوبترینها (از API) -->
        <div>
          <h3 class="mb-4 text-sm font-bold text-white">پربازدیدترینها</h3>
          <ul class="space-y-3">
            <li v-for="article in popular" :key="article.id">
              <NuxtLink
                :to="`/magazine/${article.slug}`"
                class="group flex items-center gap-2.5"
              >
                <span
                  class="size-10 shrink-0 overflow-hidden rounded-lg bg-white/10"
                >
                  <img
                    v-if="article.coverImage"
                    :src="formatImageUrl(article.coverImage)"
                    :alt="article.title"
                    class="size-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </span>
                <span
                  class="line-clamp-2 text-[11px] leading-5 text-white/65 transition group-hover:text-nimoura-accent"
                >
                  {{ article.title }}
                </span>
              </NuxtLink>
            </li>
            <li v-if="!popular.length" class="text-xs text-white/40">
              در حال بارگذاری…
            </li>
          </ul>
        </div>

        <!-- کاوش -->
        <div>
          <h3 class="mb-4 text-sm font-bold text-white">کاوش نیمورا</h3>
          <ul class="space-y-2.5 text-xs text-white/60">
            <li>
              <NuxtLink to="/" class="transition hover:text-nimoura-accent">
                فروشگاه نیمورا
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories" class="transition hover:text-nimoura-accent">
                دستهبندی محصولات
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/magazine" class="transition hover:text-nimoura-accent">
               همه مقالات مجله
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cart" class="transition hover:text-nimoura-accent">
                سبد خرید من
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ── نوار پایین ── -->
    <div class="relative border-t border-white/10">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <span>© {{ year }} مجله نیمورا — تمامی حقوق محفوظ است.</span>
        <span class="inline-flex items-center gap-1.5">
          ساخته شده با
          <i class="pi pi-heart-fill text-nimoura-primary text-[10px]" />
          برای علاقهمندان به زیبایی
        </span>
      </div>
    </div>
  </footer>
</template>

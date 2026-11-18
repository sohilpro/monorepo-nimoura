<template>
  <section
    class="mx-4 my-10 lg:container lg:my-16"
    aria-label="مزایای خرید از فروشگاه نیمورا"
  >
    <div
      class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      <div
        v-for="item in trustItems"
        :key="item.title"
        class="group flex flex-col items-center gap-2.5 rounded-2xl border border-nimoura-text-100/80 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-nimoura-primary/40 hover:shadow-sm sm:flex-row sm:items-center sm:text-start sm:p-5"
      >
        <div
          class="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nimoura-primary/15 to-nimoura-primary/5 text-nimoura-primary ring-1 ring-nimoura-primary/10 transition-transform duration-300 group-hover:scale-105"
        >
          <i :class="`pi ${item.icon} text-lg sm:text-xl`" aria-hidden="true" />
        </div>

        <div class="space-y-0.5 min-w-0">
          <h4 class="font-vazir text-xs font-bold text-nimoura-text-800 sm:text-sm">
            {{ item.title }}
          </h4>
          <p class="text-[11px] text-nimoura-text-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const trustItems = [
  {
    icon: 'pi-verified',
    title: 'تضمین ۱۰۰٪ اصالت کالا',
    desc: 'تمامی محصولات اصل با تاریخ انقضای معتبر',
  },
  {
    icon: 'pi-truck',
    title: 'ارسال سریع به سراسر کشور',
    desc: 'ارسال رایگان برای خریدهای بالای ۴ میلیون تومان',
  },
  {
    icon: 'pi-refresh',
    title: '۷ روز ضمانت بازگشت کالا',
    desc: 'امکان مرجوعی بدون قید و شرط در صورت مغایرت',
  },
  {
    icon: 'pi-headphones',
    title: 'مشاوره تخصصی زیبایی',
    desc: 'راهنمایی و انتخاب متناسب با روتین پوستی شما',
  },
];
</script>

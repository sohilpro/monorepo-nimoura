<template>
  <section
    id="specifications"
    class="w-full font-vazir"
    aria-labelledby="specifications-title"
  >
    <!-- Card -->
    <div
      class="overflow-hidden rounded-xl border border-nimoura-border/60 bg-white shadow-[0_6px_24px_rgba(78,69,69,0.05)] sm:rounded-2xl sm:shadow-[0_8px_30px_rgba(78,69,69,0.06)]"
    >
      <!-- Header -->
      <header
        class="flex items-center gap-2.5 border-b border-nimoura-border/60 px-3.5 py-3.5 sm:gap-3 sm:px-5 sm:py-4 md:px-6 md:py-5"
      >
        <!-- Icon -->
        <div
          class="flex-center size-9 shrink-0 rounded-lg bg-nimoura-base text-nimoura-primary sm:size-10 sm:rounded-xl"
          aria-hidden="true"
        >
          <i class="pi pi-list text-xs! sm:text-sm!" />
        </div>

        <!-- Title -->
        <div class="min-w-0">
          <h2
            id="specifications-title"
            class="m-0 text-sm font-bold leading-6 text-nimoura-text-800 sm:text-base sm:leading-7 md:text-lg"
          >
            مشخصات محصول
          </h2>
        </div>
      </header>

      <!-- Specifications -->
      <ul class="m-0 p-0">
        <li
          v-for="(spec, index) in specs"
          :key="`spec-${index}`"
          class="group flex min-w-0 items-stretch transition-colors duration-200"
          :class="
            index % 2 === 0
              ? 'bg-white hover:bg-nimoura-base/40'
              : 'bg-nimoura-base/35 hover:bg-nimoura-base/70'
          "
        >
          <!-- Label -->
          <div
            class="flex w-[38%] min-w-0 shrink-0 items-start gap-1.5 px-3 py-3 sm:w-[35%] sm:gap-2 sm:px-4 sm:py-3.5 md:w-1/3 md:items-center md:px-6 md:py-4 lg:py-4.5"
          >
            <!-- Accent -->
            <span
              class="mt-2 size-1 shrink-0 rounded-full bg-nimoura-primary/50 transition-all duration-200 group-hover:scale-125 group-hover:bg-nimoura-primary sm:size-1.5 md:mt-0"
              aria-hidden="true"
            />

            <span
              class="min-w-0 break-words text-[11px] font-normal leading-5 text-nimoura-text-500 sm:text-xs sm:leading-6 md:text-sm md:leading-6"
            >
              {{ spec.key }}
            </span>
          </div>

          <!-- Value -->
          <div
            class="flex min-w-0 flex-1 items-start px-3 py-3 sm:px-4 sm:py-3.5 md:items-center md:px-6 md:py-4 lg:py-4.5"
            :class="{
              'border-b border-nimoura-border/50':
                index !== specs.length - 1,
            }"
          >
            <component
              :is="spec.href ? 'a' : 'span'"
              :href="spec.href || undefined"
              :rel="
                spec.href
                  ? 'nofollow noopener noreferrer'
                  : undefined
              "
              class="min-w-0 break-words text-[11px] font-medium leading-5 text-nimoura-text-800 transition-colors duration-200 sm:text-xs sm:leading-6 md:text-sm md:leading-6 lg:text-[15px]"
              :class="{
                'hover:text-nimoura-primary': spec.href,
              }"
            >
              {{ spec.value }}
            </component>

            <!-- Link Arrow -->
            <i
              v-if="spec.href"
              class="pi pi-arrow-up-left mr-1.5 mt-1 shrink-0 text-[8px] text-nimoura-text-300 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:text-nimoura-primary sm:mr-2 sm:mt-0 sm:text-[9px]"
              aria-hidden="true"
            />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
defineProps({
  specs: {
    type: Array,
    required: true,
  },
});
</script>
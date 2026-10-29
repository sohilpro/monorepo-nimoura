<template>
  <div
    :class="['rounded-2xl border relative border-gray-200 bg-white', className]"
  >
    <!-- Card Header -->
    <div class="px-4 py-4 sm:px-6 sm:py-5">
      <h3 class="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
        {{ title }}
      </h3>

      <p
        v-if="desc"
        class="mt-1 text-xs sm:text-sm lg:text-base text-gray-500 leading-5 sm:leading-6"
      >
        {{ desc }}
      </p>
    </div>

    <!-- Card Body -->
    <div class="p-4 border-t border-gray-100 sm:p-6">
      <div class="space-y-4 sm:space-y-5">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  className?: string;
  desc?: string;
}

defineProps<Props>();
</script>

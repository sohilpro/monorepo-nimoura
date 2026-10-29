<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
    >
      <button
        v-if="visible"
        type="button"
        aria-label="بازگشت به بالای صفحه"
        class="fixed bottom-20 right-5 inset-inline-end-4 z-30 flex size-11 items-center justify-center rounded-full bg-nimoura-dark text-white shadow-lg lg:hidden"
        @click="scrollToTop"
      >
        <i class="pi pi-arrow-up text-base" />
      </button>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ threshold?: number }>(), {
  threshold: 480,
});

const { y } = useWindowScroll();
const visible = computed(() => y.value > props.threshold);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
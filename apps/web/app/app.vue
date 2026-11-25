<template>
  <Toast position="top-center" />
  <NuxtLayout>
    <NuxtLoadingIndicator color="#B76E79" :height="3" :throttle="0" />
    <NuxtPage />
  </NuxtLayout>

  <!-- اسکلتون سراسری هنگام رفرش و جابهجایی بین صفحات لیست محصولات.
       ClientOnly تضمین میکند سرور و هیدریشن با هم مطابقت داشته باشند. -->
  <ClientOnly>
    <Transition name="page-skeleton">
      <div
        v-if="isPageLoading"
        class="fixed inset-0 z-[300] overflow-hidden bg-nimoura-base/95 backdrop-blur-md"
        aria-busy="true"
        aria-label="در حال بارگذاری صفحه"
      >
        <div class="absolute inset-0 overflow-y-auto">
          <CategoriesUtilsPageSkeleton :page-size="9" />
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<script setup lang="ts">
const isPageLoading = ref(true);
const router = useRouter();
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const LIST_ROUTE_PREFIXES = ['/categories', '/products', '/brand', '/search'];
function isListRoute(path: string) {
  return LIST_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function hide() {
  clearTimeout(hideTimer);
  // تاخیر کوتاه باعث میشود اسکلتون به آرامی محو شود و پرش ناخوشایند نباشد
  hideTimer = setTimeout(() => {
    isPageLoading.value = false;
  }, 180);
}

router.beforeEach((to) => {
  if (isListRoute(to.path)) {
    clearTimeout(hideTimer);
    isPageLoading.value = true;
  }
  return true;
});

router.afterEach(() => {
  hide();
});

onMounted(() => {
  const nuxtApp = useNuxtApp();
  nuxtApp.hook('page:finish', hide);
  hide();
});

onBeforeUnmount(() => clearTimeout(hideTimer));
</script>

<style scoped>
.page-skeleton-enter-active,
.page-skeleton-leave-active {
  transition: opacity 0.28s ease;
}
.page-skeleton-enter-from,
.page-skeleton-leave-to {
  opacity: 0;
}
</style>

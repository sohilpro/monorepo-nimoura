<template>
  <header
    dir="rtl"
    class="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-100 bg-white/90 px-3 py-2.5 backdrop-blur-md transition-all sm:px-6 sm:py-3"
  >
    <!-- بخش راست (در حالت RTL: دکمه سایدبار، لوگوی موبایل و سرچ‌بار) -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- دکمه باز/بسته کردن سایدبار -->
      <button
        type="button"
        @click="handleToggle"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-hidden"
        :title="isExpanded ? 'جمع‌کردن منو' : 'بازکردن منو'"
      >
        <i
          class="pi text-base transition-transform duration-200"
          :class="isMobileOpen ? 'pi-times' : (isExpanded ? 'pi-bars' : 'pi-bars')"
        />
      </button>

      <!-- لوگوی موبایل -->
      <LayoutHeaderLogo />

      <!-- نوار جستجوی پیشرفته -->
      <LayoutHeaderSearchBar />
    </div>

    <!-- بخش چپ (اعلان‌ها و پروفایل کاربری) -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- منوی اعلان‌ها با اتصال زنده به دیتابیس -->
      <LayoutHeaderNotificationMenu />

      <!-- جداکننده بصری ملایم -->
      <div class="hidden h-6 w-px bg-gray-200 sm:block" />

      <!-- منوی پروفایل کاربر لاگین شده -->
      <LayoutHeaderUserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
const { toggleSidebar, toggleMobileSidebar, isMobileOpen, isExpanded } = useSidebar();

const handleToggle = () => {
  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
    toggleSidebar();
  } else {
    toggleMobileSidebar();
  }
};
</script>

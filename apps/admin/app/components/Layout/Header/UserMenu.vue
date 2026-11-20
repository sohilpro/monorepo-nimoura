<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      class="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors duration-200 hover:bg-gray-100/80 focus:outline-hidden"
      @click="toggleDropdown"
      :aria-expanded="dropdownOpen"
    >
      <!-- آواتار کاربر -->
      <div
        class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-rose-400 font-bold text-white shadow-xs"
      >
        <span>{{ userInitials }}</span>
        <span
          class="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
          title="آنلاین"
        />
      </div>

      <!-- نام و نقش کاربر (مخفی در سایزهای خیلی کوچک) -->
      <div class="hidden text-right leading-tight sm:flex sm:flex-col">
        <span class="max-w-[130px] truncate text-xs font-bold text-gray-800">
          {{ displayName }}
        </span>
        <span class="text-[10px] font-medium text-brand-600">
          {{ roleLabel }}
        </span>
      </div>

      <i
        class="pi pi-chevron-down text-xs text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180 text-brand-600': dropdownOpen }"
      />
    </button>

    <!-- منوی کشویی کاربر -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="dropdownOpen"
        dir="rtl"
        class="absolute left-0 top-full z-50 mt-2 w-72 origin-top-left rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xl shadow-gray-200/50"
      >
        <!-- کارت پروفایل بالا -->
        <div class="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 text-sm font-bold text-white shadow-xs"
          >
            {{ userInitials }}
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-bold text-gray-800">
              {{ displayName }}
            </span>
            <span class="truncate text-[11px] text-gray-500 font-mono" dir="ltr">
              {{ displayContact }}
            </span>
            <div class="mt-1">
              <span
                class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                :class="
                  isOwner
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-brand-50 text-brand-700'
                "
              >
                <i :class="isOwner ? 'pi pi-crown' : 'pi pi-shield'" class="text-[10px]" />
                {{ roleLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- لیست لینک‌های دسترسی سریع -->
        <div class="my-2 border-t border-gray-100 pt-2 space-y-0.5">
          <a
            href="/"
            target="_blank"
            class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            @click="closeDropdown"
          >
            <div class="flex items-center gap-2.5">
              <i class="pi pi-external-link text-gray-400" />
              <span>مشاهده فروشگاه</span>
            </div>
            <span class="text-[10px] text-gray-400">تب جدید</span>
          </a>

          <NuxtLink
            to="/tickets"
            class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            @click="closeDropdown"
          >
            <i class="pi pi-ticket text-gray-400" />
            <span>تیکت‌های پشتیبانی</span>
          </NuxtLink>

          <NuxtLink
            to="/comments"
            class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            @click="closeDropdown"
          >
            <i class="pi pi-comments text-gray-400" />
            <span>دیدگاه‌های کاربران</span>
          </NuxtLink>

          <NuxtLink
            to="/loyalty"
            class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            @click="closeDropdown"
          >
            <i class="pi pi-gift text-gray-400" />
            <span>باشگاه مشتریان و پاداش‌ها</span>
          </NuxtLink>
        </div>

        <!-- دکمه خروج -->
        <div class="border-t border-gray-100 pt-1.5">
          <button
            type="button"
            :disabled="loggingOut"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            @click="handleSignOut"
          >
            <i
              class="pi"
              :class="loggingOut ? 'pi-spin pi-spinner' : 'pi-sign-out'"
            />
            <span>{{ loggingOut ? 'در حال خروج...' : 'خروج از حساب کاربری' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from "@nimoura/shared-types";

const auth = useAuth();
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const loggingOut = ref(false);

const displayName = computed(() => {
  const first = auth.value?.first_name?.trim() || "";
  const last = auth.value?.last_name?.trim() || "";
  const full = `${first} ${last}`.trim();
  return full || "مدیر فروشگاه";
});

const displayContact = computed(() => {
  return auth.value?.mobile || auth.value?.email || "—";
});

const isOwner = computed(() => auth.value?.role === UserRole.OWNER);

const roleLabel = computed(() => {
  if (auth.value?.role === UserRole.OWNER) return "مالک فروشگاه";
  if (auth.value?.role === UserRole.ADMIN) return "مدیر سیستم";
  return "کارشناس";
});

const userInitials = computed(() => {
  const first = auth.value?.first_name?.trim() || "";
  const last = auth.value?.last_name?.trim() || "";
  if (first && last) {
    return `${first[0]}${last[0]}`;
  }
  if (first) return first.slice(0, 2);
  if (last) return last.slice(0, 2);
  return "ن";
});

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const handleSignOut = async () => {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Sign out error:", err);
  } finally {
    auth.value = null;
    closeDropdown();
    loggingOut.value = false;
    await navigateTo("/auth");
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="min-h-screen bg-nimoura-base pb-20" dir="rtl">
    <!-- ══ HEADER BAND ══ -->
    <header
      class="relative overflow-hidden bg-gradient-to-br from-nimoura-950 via-nimoura-800 to-nimoura-500 px-4 pb-8 pt-8 shadow-lg shadow-nimoura-900/10"
    >
      <!-- ambient glow -->
      <div
        class="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-nimoura-accent/20 blur-3xl"
      />

      <div class="relative z-10 mx-auto max-w-5xl">
        <!-- breadcrumb + logout -->
        <div class="mb-6 flex items-center justify-between gap-3">
          <nav
            class="flex items-center gap-1.5 text-xs text-white/50"
            aria-label="مسیر"
          >
            <NuxtLink
              to="/"
              class="no-underline transition-opacity hover:opacity-80"
              >خانه</NuxtLink
            >
            <i class="pi pi-angle-left text-[10px]" />
            <span class="text-white/85">ناحیه کاربری</span>
          </nav>

          <Button
            type="button"
            aria-label="خروج"
            class="!flex !items-center !gap-2 !rounded-full !border !border-white/20 !bg-white/10 !px-3.5 !py-2 !text-xs !font-semibold !text-white/90 !backdrop-blur-md transition-all hover:!border-rose-300/40 hover:!bg-rose-400/15 hover:!text-rose-100 active:!scale-95"
            @click="showConfirmLogOut = true"
          >
            <i class="pi pi-sign-out text-xs!" />
            <span class="hidden sm:inline">خروج</span>
          </Button>
        </div>

        <div
          class="flex flex-col items-start gap-5 sm:flex-row sm:items-center"
        >
          <!-- Avatar -->
          <div
            class="shrink-0 rounded-full bg-gradient-to-tr from-white/70 to-white/15 p-[3px] shadow-lg shadow-nimoura-950/20"
          >
            <div
              class="flex size-[72px] items-center justify-center rounded-full border-2 border-white/25 bg-gradient-to-br from-nimoura-300 to-nimoura-500"
            >
              <span class="text-2xl font-bold tracking-wider text-white">{{
                initials
              }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <h1 class="mb-1 truncate text-xl font-bold text-white sm:text-2xl">
              {{ auth?.first_name }} {{ auth?.last_name }}
            </h1>
            <p class="font-modam text-sm text-white/65">{{ auth?.mobile }}</p>
          </div>

          <!-- Quick stats -->
          <div class="flex gap-3 sm:gap-5">
            <template v-if="statsPending">
              <div
                v-for="i in 3"
                :key="i"
                class="flex min-w-16 flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <Skeleton width="32px" height="16px" class="!bg-white/25" />
                <Skeleton width="42px" height="9px" class="!bg-white/15" />
              </div>
            </template>
            <template v-else>
              <div
                v-for="s in stats"
                :key="s.label"
                class="flex min-w-16 flex-col items-center gap-0.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-center backdrop-blur-md"
              >
                <span
                  class="font-modam text-lg font-bold leading-none text-white"
                  >{{ s.value }}</span
                >
                <span class="whitespace-nowrap text-[10px] text-white/60">{{
                  s.label
                }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- ══ BODY ══ -->
    <main class="mx-auto max-w-5xl px-4 pt-6">
      <!-- loyalty -->
      <section
        v-if="loyalty"
        class="mb-6 rounded-2xl border border-nimoura-200 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)]"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-nimoura-text-800">
              باشگاه مشتریان
            </p>
            <p class="mt-1 text-xs text-nimoura-text-500">
              {{ visitCount }} از ۷ روز این هفته
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p class="font-modam text-lg font-bold text-nimoura-primary">
              {{ numberFormat(balanceAmount) }} تومان اعتبار
            </p>
            <Button
              type="button"
              icon="pi pi-gift"
              label="دعوت از دوستان"
              size="small"
              outlined
              class="!rounded-xl !border-nimoura-primary/30 !bg-nimoura-primary/10 !px-3 !py-1.5 !text-xs !font-semibold !text-nimoura-primary hover:!bg-nimoura-primary hover:!text-white"
              @click="activeTab = 'referral'"
            />
            <Button
              v-if="balanceAmount >= 500000"
              type="button"
              label="درخواست تسویه"
              size="small"
              outlined
              class="!rounded-xl !border-emerald-600/30 !bg-emerald-50 !px-3 !py-1.5 !text-xs !font-semibold !text-emerald-700 hover:!bg-emerald-600 hover:!text-white"
              @click="showWithdrawalDialog = true"
            />
          </div>
        </div>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-nimoura-100">
          <div
            class="h-full rounded-full bg-gradient-to-l from-nimoura-500 to-nimoura-700 transition-all duration-500"
            :style="{ width: `${(visitCount / 7) * 100}%` }"
          />
        </div>
      </section>

      <!-- ══ TABS (Custom Implementation) ══ -->
      <div class="relative">
        <!-- سایه/محو شدن سمت راست (در حالت RTL یعنی سمتی که محتوا ادامه دارد) -->
        <div
          class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 rounded-r-2xl sm:hidden"
        ></div>

        <!-- سایه/محو شدن سمت چپ -->
        <div
          class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 rounded-l-2xl sm:hidden"
        ></div>

        <!-- Tab List -->
        <div
          class="scrollbar-hide flex gap-1 overflow-x-auto rounded-2xl border border-nimoura-text-100 bg-white p-1.5 shadow-sm"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            class="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            :class="
              activeTab === tab.key
                ? 'bg-nimoura-primary text-white shadow-md shadow-nimoura-primary/30'
                : 'text-nimoura-text-500 hover:bg-nimoura-50 hover:text-nimoura-primary'
            "
          >
            <i :class="`pi ${tab.icon} text-sm`" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Panels Content -->
      <div class="mt-4">
        <div v-if="activeTab === 'orders'" class="space-y-3">
          <ProfileOrders />
        </div>
        <div v-else-if="activeTab === 'tickets'" class="space-y-3">
          <ProfileTicketsTicketList />
        </div>
        <div v-else-if="activeTab === 'account'" class="space-y-4">
          <ProfileAccount :user="auth" />
        </div>
        <div v-else-if="activeTab === 'referral'" class="space-y-3">
          <ProfileReferralCard />
        </div>
        <div v-else-if="activeTab === 'addresses'" class="space-y-3">
          <ProfileAddresses />
        </div>
        <div v-else-if="activeTab === 'wishlist'" class="space-y-3">
          <ProfileWishlist />
        </div>
      </div>
    </main>

    <!-- ══ DIALOGS ══ -->
    <AuthLogoutConfirm v-model="showConfirmLogOut" />
    <ProfileLoyaltyWithdrawalDialog
      v-model:visible="showWithdrawalDialog"
      :balance="balanceAmount"
    />
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();

const { stats, pending: statsPending } = useProfileStats();
const {
  balance: loyalty,
  balanceAmount,
  visitCount,
  refresh: refreshLoyalty,
} = useLoyalty();

const showWithdrawalDialog = ref(false);
onMounted(() => refreshLoyalty());

const showConfirmLogOut = ref(false);

// ─── Tabs ─────────────────────────────────────
const route = useRoute();
const tabs = [
  { key: "orders", label: "سفارشات", icon: "pi-shopping-bag" },
  { key: "tickets", label: "پشتیبانی و تیکت‌ها", icon: "pi-comments" },
  { key: "account", label: "حساب من", icon: "pi-user" },
  { key: "referral", label: "دعوت از دوستان", icon: "pi-gift" },
  { key: "addresses", label: "آدرس‌ها", icon: "pi-map-marker" },
  { key: "wishlist", label: "علاقه‌مندی", icon: "pi-heart" },
];
const initialTab = (route.query.tab as string) || "orders";
const activeTab = ref(
  tabs.some((t) => t.key === initialTab) ? initialTab : "orders",
);

// ─── Computed ─────────────────────────────────
const initials = computed(() => {
  const first = auth.value?.first_name || "";
  const last = auth.value?.last_name || "";

  const name = `${first} ${last}`.trim();

  return name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
    : "ن";
});
</script>

<template>
  <div class="profile-root min-h-screen" dir="rtl">

    <!-- ══ HEADER BAND ══ -->
    <div class="profile-hero relative overflow-hidden px-4 pb-6 pt-10">

      <!-- bg blobs -->
      <div class="blob blob-1" />
      <div class="blob blob-2" />

      <div class="relative z-10 mx-auto max-w-5xl">
        <!-- breadcrumb + logout (هم‌ردیف) -->
        <div class="mb-6 flex items-center justify-between">
          <p class="flex items-center gap-1.5 text-xs" style="color:rgba(255,255,255,0.5)">
            <NuxtLink to="/" class="no-underline hover:opacity-80 transition-opacity" style="color:inherit">خانه</NuxtLink>
            <i class="pi pi-angle-left text-[10px]" />
            <span style="color:rgba(255,255,255,0.85)">ناحیه کاربری</span>
          </p>

          <!-- ══ LOGOUT PILL ══ -->
          <button
            type="button"
            class="logout-pill"
            @click="showConfirmLogOut = true"
          >
            <i class="pi pi-sign-out text-[13px]" />
            <span class="hidden sm:inline">خروج</span>
          </button>
        </div>

        <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <!-- Avatar -->
          <div class="avatar-ring shrink-0">
            <div class="avatar-inner">
              <span class="avatar-initials">{{ initials }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="mb-1 text-xl font-bold text-white sm:text-2xl font-vazir">
              {{ auth?.first_name }} {{ auth?.last_name }}
            </h1>
            <p class="text-sm font-modam" style="color:rgba(255,255,255,0.6)">{{ auth?.mobile }}</p>
          </div>

          <!-- Quick stats -->
<!-- Quick stats -->
  <div class="flex gap-4 sm:gap-6">
    <template v-if="statsPending">
      <div v-for="i in 3" :key="i" class="stat-pill">
        <span class="stat-num opacity-40">–</span>
        <span class="stat-label opacity-40">...</span>
      </div>
    </template>

    <template v-else>
      <div v-for="s in stats" :key="s.label" class="stat-pill">
        <span class="stat-num font-modam">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </template>
  </div>
        </div>
      </div>
    </div>

    <!-- ══ BODY ══ -->
    <div class="mx-auto max-w-5xl px-4 pb-20 pt-6">

      <!-- ── Tab nav ── -->
      <div class="hide-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-2xl p-1.5" style="background:#fff; box-shadow:0 2px 16px rgba(183,110,121,0.07)">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab-btn"
          :class="activeTab === tab.key ? 'tab-btn--active' : ''"
          @click="activeTab = tab.key"
        >
          <i :class="`pi ${tab.icon} text-sm`" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- ── Tab panels ── -->
      <Transition name="fade-up" mode="out-in">

        <!-- ▸ ORDERS ──────────────────────────────── -->
        <div v-if="activeTab === 'orders'" key="orders" class="space-y-3">
          <ProfileOrders />
        </div>

        <!-- ▸ ACCOUNT INFO ──────────────────────────── -->
        <div v-else-if="activeTab === 'account'" key="account" class="space-y-4">
         <ProfileAccount :user="auth"/>
        </div>

        <!-- ▸ ADDRESSES ──────────────────────────────── -->
        <div v-else-if="activeTab === 'addresses'" key="addresses" class="space-y-3">
         <ProfileAddresses />
        </div>
        <!-- ▸ Wishlist ──────────────────────────────── -->
        <div v-else-if="activeTab === 'wishlist'" key="wishlist" class="space-y-3">
         <ProfileWishlist />
        </div>

      </Transition>
    </div>

    <!-- ══ LOGOUT CONFIRM MODAL ══ -->
    <AuthLogoutConfirm v-model="showConfirmLogOut" />

  </div>
</template>

<script setup lang="ts">
const auth = useAuth()

const { stats, pending: statsPending } = useProfileStats();

const showConfirmLogOut = ref(false)

// ─── Tabs ─────────────────────────────────────
const tabs = [
  { key: 'orders',    label: 'سفارشات',  icon: 'pi-shopping-bag' },
  { key: 'account',   label: 'حساب من',   icon: 'pi-user' },
  { key: 'addresses', label: 'آدرس‌ها',   icon: 'pi-map-marker' },
   { key: 'wishlist',  label: 'علاقه‌مندی',    icon: 'pi-heart' },
]
const activeTab = ref('orders')

// ─── Computed ─────────────────────────────────
const initials = computed(() => {
  const first = auth.value?.first_name || ''
  const last = auth.value?.last_name || ''

  const name = `${first} ${last}`.trim()

  return name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('')
    : 'ن'
})
</script>

<style scoped>
/* ── CSS vars ───────────────────────────────── */
.profile-root {
  --primary:  #b76e79;
  --base:     #fff8f4;
  --nt-100: #e9e6e6; --nt-200: #cfc9c9; --nt-300: #b5adad;
  --nt-400: #9b9191; --nt-500: #807676; --nt-600: #665d5d;
  --nt-700: #4e4545; --nt-800: #3a3131; --nt-900: #272121;
  background: var(--base);
  font-family: 'Vazirmatn', sans-serif;
}

/* ── Hero ───────────────────────────────────── */
.profile-hero {
  background: linear-gradient(135deg, #3d1f25 0%, #6b2d38 50%, #b76e79 100%);
}
.blob {
  position: absolute; border-radius: 50%;
  filter: blur(60px); pointer-events: none;
}
.blob-1 {
  width: 300px; height: 300px;
  background: rgba(255,255,255,0.06);
  top: -80px; left: -60px;
}
.blob-2 {
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.04);
  bottom: -40px; right: 10%;
}

/* ── Logout pill ─────────────────────────────── */
.logout-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.85);
  font-size: 12px; font-family: 'Vazirmatn', sans-serif;
  font-weight: 600; cursor: pointer;
  transition: all .2s ease;
}
.logout-pill:hover {
  background: rgba(220,38,38,0.15);
  border-color: rgba(220,38,38,0.35);
  color: #fecaca;
}
.logout-pill:active { transform: scale(.96); }

/* ── Avatar ─────────────────────────────────── */
.avatar-ring {
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.15));
}
.avatar-inner {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #d4909b, #b76e79);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255,255,255,0.2);
}
.avatar-initials {
  font-size: 1.5rem; font-weight: 700;
  color: #fff; letter-spacing: .05em;
}

/* ── Stats ──────────────────────────────────── */
.stat-pill {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px; padding: 10px 18px;
}
.stat-num  { font-size: 1.1rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-label{ font-size: 10px; color: rgba(255,255,255,0.6); white-space: nowrap; }

/* ── Tabs ───────────────────────────────────── */
.hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 14px;
  font-size: 12px; font-family: 'Vazirmatn', sans-serif;
  font-weight: 500; white-space: nowrap;
  border: none; background: transparent;
  color: var(--nt-400); cursor: pointer;
  transition: all .2s; flex-shrink: 0;
}

.tab-btn--active {
  background: linear-gradient(135deg, #b76e79, #9a5a64);
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(183,110,121,0.35);
}

/* ── Transition ─────────────────────────────── */
.fade-up-enter-active { transition: opacity .25s ease, transform .25s ease; }
.fade-up-leave-active { transition: opacity .15s ease; }
.fade-up-enter-from  { opacity: 0; transform: translateY(8px); }
.fade-up-leave-to    { opacity: 0; }
</style>
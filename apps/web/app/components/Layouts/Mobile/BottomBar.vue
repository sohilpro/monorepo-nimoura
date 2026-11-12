<template>
  <!-- Category drawer -->
  <LayoutsMobileCategoryDrawer
    v-model="drawerOpen"
    :categories
  />

  <!-- Bottom Navbar -->
  <nav
    v-if="shouldShowNavbar"
    class="lg:hidden fixed bottom-0 inset-x-0 z-80
           transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
    :class="isHidden ? 'translate-y-[110%]' : 'translate-y-0'"
  >
    <ul
      class="flex justify-around items-center mx-3 rounded-[22px] px-1 py-2
             bg-white/[0.82] backdrop-blur-xl saturate-[180%]
             border border-white/60
             shadow-[0_8px_32px_rgba(180,100,80,0.10),0_2px_8px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]"
      :style="{ marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }"
    >
      <li v-for="item in navItems" :key="item.key" class="flex-1">

        <!-- Categories button -->
        <button
          v-if="item.key === 'categories'"
          type="button"
          class="nav-item"
          :class="drawerOpen ? 'text-nimoura-primary' : 'text-gray-400'"
          :aria-label="item.label"
          @click="drawerOpen = !drawerOpen"
        >
          <span
            class="nav-icon-pill"
            :class="drawerOpen ? 'bg-nimoura-primary/[0.12] -translate-y-px' : ''"
          >
            <svg
              class="size-[21px] transition-transform duration-300"
              :class="drawerOpen ? 'scale-90' : ''"
              viewBox="0 0 24 24" fill="none"
            >
              <rect x="3" y="5"     width="7"  height="2.5" rx="1.25" fill="currentColor"/>
              <rect x="3" y="10.75" width="11" height="2.5" rx="1.25" fill="currentColor"/>
              <rect x="3" y="16.5"  width="8"  height="2.5" rx="1.25" fill="currentColor"/>
              <circle cx="19" cy="6.25"  r="2.75" fill="currentColor" opacity=".3"/>
              <circle cx="19" cy="12"    r="2.75" fill="currentColor" opacity=".3"/>
              <circle cx="19" cy="17.75" r="2.75" fill="currentColor" opacity=".3"/>
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </button>

        <!-- Regular link -->
        <NuxtLink
          v-else
          :to="item.to!"
          class="nav-item no-underline"
          :class="isActive(item) ? 'text-nimoura-primary' : 'text-gray-400'"
          :aria-label="item.label"
        >
          <span
            class="nav-icon-pill"
            :class="isActive(item) ? 'bg-nimoura-primary/[0.12] -translate-y-px' : ''"
          >
            <i :class="`pi ${item.icon} text-[19px]`" />
          </span>
          <span class="nav-label">{{ item.label }}</span>

          <!-- Cart badge -->
          <span
            v-if="item.key === 'cart' && (cartCount ?? 0) > 0"
            class="absolute top-0.5 font-modam left-[calc(50%+8px)]
                   min-w-[17px] h-[17px] px-1 rounded-full
                   bg-nimoura-primary text-white text-[10px] font-bold
                   flex justify-center border-2 border-white"
          >
            {{ (cartCount ?? 0) > 9 ? '۹+' : cartCount }}
          </span>
        </NuxtLink>

      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  icon?: string
  children: Category[]
}

interface NavItem {
  key: string
  label: string
  to?: string
  icon?: string
  exact?: boolean
}

const props = defineProps<{
  categories?: Category[]
  cartCount?: number
}>()

// ─── Nav items ────────────────────────────────
const navItems: NavItem[] = [
  { key: 'home',       to: '/',        label: 'خانه',      icon: 'pi-home',        exact: true },
  { key: 'categories',                 label: 'دسته‌بندی' },
  { key: 'cart',       to: '/cart',    label: 'سبد خرید',  icon: 'pi-shopping-bag' },
  { key: 'profile',   to: '/profile', label: 'حساب من',   icon: 'pi-user'          },
]

// ─── Route ────────────────────────────────────
const route = useRoute()

const shouldShowNavbar = computed(() => {
  if (route.path === '/products/amazing' || route.path === '/products/amazing') return true
  return !/^\/product\/[^/]+(\/[^/]+)?$/.test(route.path)
})

function isActive(item: NavItem) {
  if (!item.to) return false
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

// ─── Scroll hide ──────────────────────────────
const isHidden   = ref(false)
const drawerOpen = ref(false)
let lastScrollTop = 0
let ticking       = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const cur = window.scrollY
    if (Math.abs(cur - lastScrollTop) >= 10) {
      isHidden.value = cur > lastScrollTop && cur > 60
      lastScrollTop  = Math.max(cur, 0)
    }
    ticking = false
  })
}

watch(drawerOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
      document.body.style.overflow = ''
  lastScrollTop = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 100%;
  padding: 4px 2px 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.nav-icon-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 30px;
  border-radius: 14px;
  transition: background 0.25s, transform 0.2s;
}

.nav-label {
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.02em;
  white-space: nowrap;
  font-family: 'Vazirmatn', sans-serif;
}
</style>
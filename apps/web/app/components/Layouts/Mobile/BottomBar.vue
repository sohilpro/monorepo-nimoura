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
      class="flex justify-around items-center mx-3 mb-[calc(env(safe-area-inset-bottom,0px)+10px)] rounded-[22px] px-1 py-2
             bg-white/[0.82] backdrop-blur-xl saturate-[180%]
             border border-white/60
             shadow-[0_8px_32px_rgba(180,100,80,0.10),0_2px_8px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <li v-for="item in navItems" :key="item.key" class="flex-1">

        <!-- Categories button -->
        <button
          v-if="item.key === 'categories'"
          type="button"
          class="relative flex flex-col items-center gap-[3px] w-full px-0.5 pt-1 pb-0.5
                 border-none bg-transparent cursor-pointer transition-colors duration-200
                 [-webkit-tap-highlight-color:transparent]"
          :class="drawerOpen ? 'text-nimoura-primary' : 'text-gray-400'"
          :aria-label="item.label"
          @click="drawerOpen = !drawerOpen"
        >
          <span
            class="flex items-center justify-center w-11 h-[30px] rounded-[14px]
                   transition-[background,transform] duration-200"
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
          <span class="text-[10px] leading-none tracking-[0.02em] whitespace-nowrap font-vazir">{{ item.label }}</span>
        </button>

        <!-- Regular link -->
        <NuxtLink
          v-else
          :to="item.to!"
          class="relative flex flex-col items-center gap-[3px] w-full px-0.5 pt-1 pb-0.5
                 border-none bg-transparent cursor-pointer transition-colors duration-200 no-underline
                 [-webkit-tap-highlight-color:transparent]"
          :class="isActive(item) ? 'text-nimoura-primary' : 'text-gray-400'"
          :aria-label="item.label"
          @click="drawerOpen = false"
        >
          <span
            class="flex items-center justify-center w-11 h-[30px] rounded-[14px]
                   transition-[background,transform] duration-200"
            :class="isActive(item) ? 'bg-nimoura-primary/[0.12] -translate-y-px' : ''"
          >
            <i :class="`pi ${item.icon} text-[19px]`" />
          </span>
          <span class="text-[10px] leading-none tracking-[0.02em] whitespace-nowrap font-vazir">{{ item.label }}</span>

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

watch(() => route.fullPath, () => {
  drawerOpen.value = false
})

const shouldShowNavbar = computed(() => {
  if (route.path === '/products/amazing') return true
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
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

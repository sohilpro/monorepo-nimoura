<template>
  <aside
    dir="rtl"
    :class="[
      'fixed top-0 right-0 z-50 flex h-full flex-col border-l border-gray-100 bg-white px-4 text-gray-900 shadow-xl shadow-gray-200/30 transition-all duration-300 ease-in-out lg:shadow-none lg:translate-x-0',
      {
        'lg:w-[280px]': showFull,
        'lg:w-[84px]': !showFull,
        'w-[280px] translate-x-0': isMobileOpen,
        'translate-x-full': !isMobileOpen,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <!-- لوگو، برند و دکمه بستن در موبایل -->
    <div
      :class="[
        'flex items-center py-5 transition-all',
        showFull ? 'justify-between' : 'lg:justify-center',
      ]"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5" @click="closeMobile">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-rose-400 text-lg font-bold text-white shadow-sm"
        >
          ن
        </span>
        <div v-if="showFull" class="flex flex-col leading-tight">
          <span class="text-xl font-extrabold tracking-tight text-brand-600">
            نیمورا
          </span>
          <span class="text-[11px] font-medium text-gray-400">
            پنل مدیریت فروشگاه
          </span>
        </div>
      </NuxtLink>

      <!-- دکمه بستن در موبایل -->
      <button
        v-if="isMobileOpen"
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        @click="closeMobile"
        title="بستن منو"
      >
        <i class="pi pi-times text-sm" />
      </button>
    </div>

    <Divider class="!my-0 !mb-3 border-gray-100" />

    <!-- عنوان گروه منو -->
    <div
      :class="[
        'mb-2.5 flex items-center text-xs font-semibold text-gray-400',
        showFull ? 'justify-start px-2' : 'lg:justify-center',
      ]"
    >
      <span v-if="showFull">منوی دسترسی</span>
      <i v-else class="pi pi-ellipsis-h text-sm text-gray-300" />
    </div>

    <!-- بدنه منو با PrimeVue PanelMenu -->
    <nav class="no-scrollbar flex-1 overflow-y-auto pb-4">
      <PanelMenu
        v-model:expandedKeys="expandedKeys"
        :model="sortedMenuItems"
        class="nimoura-sidebar-menu w-full"
        :pt="panelMenuPt"
      >
        <template #item="{ item, root }">
          <!-- آیتم دارای مسیر مستقیم (بدون زیرمجموعه) -->
          <NuxtLink
            v-if="item.route"
            v-ripple
            :to="item.route"
            v-tooltip.left="!showFull && root ? item.label : undefined"
            :class="[
              'p-ripple flex w-full items-center gap-3 rounded-xl transition-all duration-200',
              root ? 'px-3 py-2.5 text-xs font-medium' : 'px-3 py-2 text-[12px]',
              !showFull && root ? 'lg:justify-center lg:px-0' : '',
              isActive(item.route)
                ? 'bg-brand-50/80 font-bold text-brand-600 shadow-2xs'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
            @click="closeMobile"
          >
            <i
              :class="[
                item.icon,
                root ? 'text-base' : 'text-xs',
                isActive(item.route) ? 'text-brand-600' : 'text-gray-400',
              ]"
            />

            <span v-if="showFull || !root" class="truncate">
              {{ item.label }}
            </span>

            <span
              v-if="(showFull || !root) && (item.isNew || item.pro || item.ownerOnly)"
              class="mr-auto flex items-center gap-1"
            >
              <Tag
                v-if="item.ownerOnly"
                value="مالک"
                severity="danger"
                rounded
                class="!px-1.5 !py-0.2 !text-[9px]"
              />
              <Tag
                v-if="item.isNew"
                value="جدید"
                severity="success"
                rounded
                class="!px-1.5 !py-0.2 !text-[9px]"
              />
              <Tag
                v-if="item.pro"
                value="ویژه"
                severity="warn"
                rounded
                class="!px-1.5 !py-0.2 !text-[9px]"
              />
            </span>
          </NuxtLink>

          <!-- آیتم والد (دارای زیرمجموعه) -->
          <div
            v-else
            v-ripple
            v-tooltip.left="!showFull ? item.label : undefined"
            :class="[
              'p-ripple flex w-full cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200',
              !showFull ? 'lg:justify-center lg:px-0' : '',
              isParentActive(item) || isGroupExpanded(item.key)
                ? 'bg-brand-50/60 font-semibold text-brand-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <i
              :class="[
                item.icon,
                'text-base',
                isParentActive(item) || isGroupExpanded(item.key)
                  ? 'text-brand-600'
                  : 'text-gray-400',
              ]"
            />

            <span v-if="showFull" class="truncate">
              {{ item.label }}
            </span>

            <i
              v-if="showFull && item.items?.length"
              :class="[
                'pi pi-chevron-down mr-auto text-[10px] transition-transform duration-200',
                isGroupExpanded(item.key)
                  ? 'rotate-180 text-brand-600'
                  : 'text-gray-400',
              ]"
            />
          </div>
        </template>
      </PanelMenu>
    </nav>

    <!-- فوتر سایدبار در حالت باز -->
    <div
      v-if="showFull"
      class="mt-auto border-t border-gray-100 py-3 px-1 flex items-center justify-between text-[11px] text-gray-400"
    >
      <span class="flex items-center gap-1.5 font-medium">
        <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        وضعیت: آنلاین
      </span>
      <span class="font-mono text-[10px] text-gray-400">Nimoura v2.0</span>
    </div>
  </aside>
</template>

<script setup>
const route = useRoute();
const { isExpanded, isMobileOpen, isHovered } = useSidebar();

const showFull = computed(
  () => isExpanded.value || isHovered.value || isMobileOpen.value
);

const expandedKeys = ref({});

const rawMenuItems = [
  {
    key: "dashboard",
    label: "داشبورد",
    icon: "pi pi-home",
    items: [
      { key: "dashboard-shop", label: "گزارش فروشگاه", icon: "pi pi-chart-bar", route: "/" },
    ],
  },
  {
    key: "products",
    label: "محصولات",
    icon: "pi pi-box",
    items: [
      { key: "products-all", label: "همه محصولات", icon: "pi pi-list", route: "/product" },
      { key: "products-create", label: "ایجاد محصول جدید", icon: "pi pi-plus-circle", route: "/product/create" },
    ],
  },
  {
    key: "orders",
    label: "سفارشات",
    icon: "pi pi-shopping-bag",
    items: [
      { key: "orders-all", label: "همه سفارشات", icon: "pi pi-list", route: "/order" },
      { key: "orders-create", label: "ایجاد سفارش بصورت دستی", icon: "pi pi-plus-circle", route: "/order/create" },
      { key: "orders-pending", label: "سفارشات ارسال نشده", icon: "pi pi-truck", route: "/order/no-sending" },
    ],
  },
  {
    key: "customers",
    label: "مشتری‌ها",
    icon: "pi pi-users",
    items: [
      { key: "customers-all", label: "همه مشتریان", icon: "pi pi-list", route: "/customers" },
      { key: "customers-create", label: "افزودن مشتری جدید", icon: "pi pi-user-plus", route: "/customers/create" },
    ],
  },
  {
    key: "categories",
    label: "دسته‌بندی‌ها",
    icon: "pi pi-sitemap",
    items: [
      { key: "categories-all", label: "همه دسته‌ها", icon: "pi pi-list", route: "/category" },
      { key: "categories-create", label: "ایجاد دسته‌بندی", icon: "pi pi-plus-circle", route: "/category/create" },
    ],
  },
  {
    key: "brands",
    label: "برندها",
    icon: "pi pi-verified",
    items: [
      { key: "brands-all", label: "همه برندها", icon: "pi pi-list", route: "/brand" },
      { key: "brands-create", label: "ایجاد برند جدید", icon: "pi pi-plus-circle", route: "/brand/create" },
    ],
  },
  {
    key: "tags",
    label: "تگ‌های محصول",
    icon: "pi pi-tags",
    items: [
      { key: "tags-manage", label: "مدیریت تگ‌ها", icon: "pi pi-tag", route: "/tag" },
    ],
  },
  {
    key: "loyalty",
    label: "باشگاه مشتریان",
    icon: "pi pi-gift",
    items: [
      { key: "loyalty-settings", label: "تنظیمات و پاداش‌ها", icon: "pi pi-sliders-h", route: "/loyalty", ownerOnly: true },
    ],
  },
  {
    key: "promotions",
    label: "کدهای تخفیف",
    icon: "pi pi-percentage",
    items: [
      { key: "promotions-all", label: "همه کدها", icon: "pi pi-list", route: "/promotion" },
      { key: "promotions-create", label: "کد تخفیف جدید", icon: "pi pi-plus-circle", route: "/promotion/create" },
    ],
  },
  {
    key: "comments",
    label: "دیدگاه کاربران",
    icon: "pi pi-comments",
    items: [
      { key: "comments-all", label: "همه دیدگاه‌ها", icon: "pi pi-list", route: "/comments" },
      { key: "comments-approve", label: "تایید شده", icon: "pi pi-check-circle", route: "/comments/approve" },
      { key: "comments-reject", label: "تایید نشده", icon: "pi pi-times-circle", route: "/comments/reject" },
    ],
  },
  {
    key: "banners",
    label: "بنرها و اسلایدرها",
    icon: "pi pi-images",
    items: [
      { key: "banners-all", label: "همه بنرها", icon: "pi pi-image", route: "/banners" },
      { key: "banners-create", label: "بنر جدید", icon: "pi pi-plus-circle", route: "/banners/create" },
    ],
  },
  {
    key: "magazine",
    label: "مجله زیبایی",
    icon: "pi pi-book",
    items: [
      { key: "magazine-articles", label: "همه مقالات", icon: "pi pi-file-edit", route: "/magazine/articles" },
      { key: "magazine-categories", label: "دسته‌بندی‌های وبلاگ", icon: "pi pi-folder", route: "/magazine/categories" },
      { key: "magazine-tags", label: "برچسب‌ها", icon: "pi pi-hashtag", route: "/magazine/tags" },
      { key: "magazine-authors", label: "نویسندگان", icon: "pi pi-user-edit", route: "/magazine/authors" },
      { key: "magazine-comments", label: "دیدگاه‌های مقالات", icon: "pi pi-comment", route: "/magazine/comments" },
    ],
  },

  // گزینه‌های بدون زیرمجموعه (در انتهای منو)
  {
    key: "tickets",
    label: "پشتیبانی و تیکت‌ها",
    icon: "pi pi-ticket",
    route: "/tickets",
  },
  {
    key: "newsletter",
    label: "اعضای خبرنامه",
    icon: "pi pi-envelope",
    route: "/news-letter",
  },
];

const sortedMenuItems = computed(() => {
  const withSubmenu = rawMenuItems.filter((item) => item.items?.length);
  const withoutSubmenu = rawMenuItems.filter((item) => !item.items?.length);
  return [...withSubmenu, ...withoutSubmenu];
});

const panelMenuPt = computed(() => ({
  root: { class: "flex flex-col gap-1 border-0 bg-transparent p-0" },
  panel: { class: "border-0 bg-transparent p-0 shadow-none" },
  header: { class: "border-0 bg-transparent p-0" },
  headerContent: { class: "border-0 bg-transparent p-0 rounded-xl" },
  contentContainer: { class: showFull.value ? "" : "hidden" },
  content: { class: "border-0 bg-transparent p-0" },
  rootList: { class: "mt-1 mr-3 space-y-1 border-r border-gray-100 pr-2" },
  itemContent: { class: "bg-transparent rounded-xl" },
}));

const isActive = (path) => route.path === path;

const isParentActive = (item) =>
  Boolean(item.items?.some((sub) => isActive(sub.route)));

const isGroupExpanded = (key) => Boolean(expandedKeys.value[key]);

const closeMobile = () => {
  if (isMobileOpen.value) {
    isMobileOpen.value = false;
  }
};

watch(
  () => route.path,
  () => {
    const activeParent = sortedMenuItems.value.find((item) =>
      item.items?.some((sub) => isActive(sub.route))
    );
    if (activeParent) {
      expandedKeys.value = { [activeParent.key]: true };
    }
  },
  { immediate: true }
);
</script>

<style scoped>
:deep(.p-panelmenu-panel) {
  border: none;
  background: transparent;
  padding: 0;
}

:deep(.p-panelmenu-header-content),
:deep(.p-panelmenu-item-content) {
  border: none;
  background: transparent;
}

:deep(.p-panelmenu-header-content:hover),
:deep(.p-panelmenu-item-content:hover) {
  background: transparent;
}
</style>

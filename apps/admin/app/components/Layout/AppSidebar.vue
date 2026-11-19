<template>
  <aside
    dir="rtl"
    :class="[
      'fixed top-0 right-0 z-50 mt-16 flex h-screen flex-col border-l border-gray-200 bg-white px-4 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 lg:translate-x-0',
      {
        'lg:w-[290px]': showFull,
        'lg:w-[90px]': !showFull,
        'w-[290px] translate-x-0': isMobileOpen,
        'translate-x-full': !isMobileOpen,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <!-- لوگو و عنوان پنل -->
    <div
      :class="[
        'flex py-6 transition-all',
        showFull ? 'justify-start' : 'lg:justify-center',
      ]"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5" @click="closeMobile">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-sm"
        >
          ن
        </span>
        <div v-if="showFull" class="flex flex-col leading-tight">
          <span class="text-xl font-extrabold tracking-tight text-brand-500">
            نیمورا
          </span>
          <span class="text-[11px] font-medium text-gray-500">
            پنل مدیریت فروشگاه
          </span>
        </div>
      </NuxtLink>
    </div>

    <Divider class="!my-0 !mb-4" />

    <!-- عنوان گروه منو -->
    <div
      :class="[
        'mb-3 flex items-center text-xs font-semibold text-gray-400',
        showFull ? 'justify-start px-2' : 'lg:justify-center',
      ]"
    >
      <span v-if="showFull">منوی مدیریت</span>
      <i v-else class="pi pi-ellipsis-h text-sm" />
    </div>

    <!-- بدنه منو با PrimeVue PanelMenu -->
    <nav class="no-scrollbar flex-1 overflow-y-auto pb-6">
      <PanelMenu
        v-model:expandedKeys="expandedKeys"
        :model="sortedMenuItems"
        class="nimoura-sidebar-menu w-full"
        :pt="panelMenuPt"
      >
        <template #item="{ item, root }">
          <!-- آیتم دارای مسیر مستقیم (بدون زیرمجموعه یا زیرآیتم) -->
          <NuxtLink
            v-if="item.route"
            v-ripple
            :to="item.route"
            v-tooltip.left="!showFull && root ? item.label : undefined"
            :class="[
              'p-ripple flex w-full items-center gap-3 rounded-xl transition-colors duration-200',
              root ? 'px-3 py-2.5 text-sm font-medium' : 'px-3 py-2 text-[13px]',
              !showFull && root ? 'lg:justify-center lg:px-0' : '',
              isActive(item.route)
                ? 'bg-brand-50 font-semibold text-brand-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            ]"
            @click="closeMobile"
          >
            <i
              :class="[
                item.icon,
                root ? 'text-base' : 'text-xs',
                isActive(item.route) ? 'text-brand-500' : 'text-gray-400',
              ]"
            />

            <span v-if="showFull || !root" class="truncate">
              {{ item.label }}
            </span>

            <span
              v-if="(showFull || !root) && (item.isNew || item.pro)"
              class="mr-auto flex items-center gap-1"
            >
              <Tag
                v-if="item.isNew"
                value="جدید"
                severity="success"
                rounded
                class="!px-2 !py-0.5 !text-[10px]"
              />
              <Tag
                v-if="item.pro"
                value="pro"
                severity="warn"
                rounded
                class="!px-2 !py-0.5 !text-[10px]"
              />
            </span>
          </NuxtLink>

          <!-- آیتم والد (دارای زیرمجموعه) -->
          <div
            v-else
            v-ripple
            v-tooltip.left="!showFull ? item.label : undefined"
            :class="[
              'p-ripple flex w-full cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
              !showFull ? 'lg:justify-center lg:px-0' : '',
              isParentActive(item) || isGroupExpanded(item.key)
                ? 'bg-brand-50 text-brand-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            ]"
          >
            <i
              :class="[
                item.icon,
                'text-base',
                isParentActive(item) || isGroupExpanded(item.key)
                  ? 'text-brand-500'
                  : 'text-gray-400',
              ]"
            />

            <span v-if="showFull" class="truncate">
              {{ item.label }}
            </span>

            <i
              v-if="showFull && item.items?.length"
              :class="[
                'pi pi-chevron-down mr-auto text-xs transition-transform duration-200',
                isGroupExpanded(item.key)
                  ? 'rotate-180 text-brand-500'
                  : 'text-gray-400',
              ]"
            />
          </div>
        </template>
      </PanelMenu>
    </nav>
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
      { key: "dashboard-shop", label: "فروشگاه", icon: "pi pi-chart-bar", route: "/" },
    ],
  },
  {
    key: "products",
    label: "محصولات",
    icon: "pi pi-box",
    items: [
      { key: "products-all", label: "همه", icon: "pi pi-list", route: "/product" },
      { key: "products-create", label: "ایجاد محصول جدید", icon: "pi pi-plus-circle", route: "/product/create" },
    ],
  },
  {
    key: "orders",
    label: "سفارشات",
    icon: "pi pi-shopping-bag",
    items: [
      { key: "orders-all", label: "همه", icon: "pi pi-list", route: "/order" },
      { key: "orders-pending", label: "سفارشات ارسال نشده", icon: "pi pi-truck", route: "/order/no-sending" },
    ],
  },
  {
    key: "customers",
    label: "مشتری‌ها",
    icon: "pi pi-users",
    items: [
      { key: "customers-all", label: "همه", icon: "pi pi-list", route: "/customers" },
      { key: "customers-create", label: "ایجاد مشتری جدید", icon: "pi pi-user-plus", route: "/customers/create" },
    ],
  },
  {
    key: "categories",
    label: "دسته‌بندی‌ها",
    icon: "pi pi-sitemap",
    items: [
      { key: "categories-all", label: "همه", icon: "pi pi-list", route: "/category" },
      { key: "categories-create", label: "ایجاد دسته‌بندی", icon: "pi pi-plus-circle", route: "/category/create" },
    ],
  },
  {
    key: "brands",
    label: "برندها",
    icon: "pi pi-verified",
    items: [
      { key: "brands-all", label: "همه", icon: "pi pi-list", route: "/brand" },
      { key: "brands-create", label: "ایجاد برند", icon: "pi pi-plus-circle", route: "/brand/create" },
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
      { key: "loyalty-settings", label: "تنظیمات باشگاه", icon: "pi pi-sliders-h", route: "/loyalty" },
    ],
  },
  {
    key: "promotions",
    label: "تخفیف‌ها",
    icon: "pi pi-percentage",
    items: [
      { key: "promotions-all", label: "کدهای تخفیف", icon: "pi pi-list", route: "/promotion" },
      { key: "promotions-create", label: "کد تخفیف جدید", icon: "pi pi-plus-circle", route: "/promotion/create" },
    ],
  },
  {
    key: "comments",
    label: "دیدگاه کاربران",
    icon: "pi pi-comments",
    items: [
      { key: "comments-all", label: "همه", icon: "pi pi-list", route: "/comments" },
      { key: "comments-approve", label: "تایید شده", icon: "pi pi-check-circle", route: "/comments/approve" },
      { key: "comments-reject", label: "تایید نشده", icon: "pi pi-times-circle", route: "/comments/reject" },
    ],
  },
  {
    key: "banners",
    label: "بنرها",
    icon: "pi pi-images",
    items: [
      { key: "banners-all", label: "همه", icon: "pi pi-image", route: "/banners" },
      { key: "banners-create", label: "بنر جدید", icon: "pi pi-plus-circle", route: "/banners/create" },
    ],
  },
  {
    key: "magazine",
    label: "مجله زیبایی",
    icon: "pi pi-book",
    items: [
      { key: "magazine-articles", label: "مقالات", icon: "pi pi-file-edit", route: "/magazine/articles" },
      { key: "magazine-categories", label: "دسته‌بندی‌ها", icon: "pi pi-folder", route: "/magazine/categories" },
      { key: "magazine-tags", label: "برچسب‌ها", icon: "pi pi-hashtag", route: "/magazine/tags" },
      { key: "magazine-authors", label: "نویسندگان", icon: "pi pi-user-edit", route: "/magazine/authors" },
      { key: "magazine-comments", label: "نظرات", icon: "pi pi-comment", route: "/magazine/comments" },
    ],
  },

  // گزینه‌های بدون زیرمجموعه (همیشه در انتهای منو)
  {
    key: "tickets",
    label: "پشتیبانی و تیکت‌ها",
    icon: "pi pi-ticket",
    route: "/tickets",
  },
  {
    key: "newsletter",
    label: "خبرنامه",
    icon: "pi pi-envelope",
    route: "/news-letter",
  },
];

// تضمین قرارگیری همیشگی آیتم‌های بدون زیرمجموعه در انتهای لیست
const sortedMenuItems = computed(() => {
  const withSubmenu = rawMenuItems.filter((item) => item.items?.length);
  const withoutSubmenu = rawMenuItems.filter((item) => !item.items?.length);
  return [...withSubmenu, ...withoutSubmenu];
});

const panelMenuPt = computed(() => ({
  root: { class: "flex flex-col gap-1.5 border-0 bg-transparent p-0" },
  panel: { class: "border-0 bg-transparent p-0 shadow-none" },
  header: { class: "border-0 bg-transparent p-0" },
  headerContent: { class: "border-0 bg-transparent p-0 rounded-xl" },
  contentContainer: { class: showFull.value ? "" : "hidden" },
  content: { class: "border-0 bg-transparent p-0" },
  rootList: { class: "mt-1 mr-4 space-y-1 border-r border-gray-200 pr-2" },
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

// باز کردن خودکار زیرمنوی مرتبط با مسیر فعلی
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
/* سازگاری کامل استایل در هر دو نسخه PrimeVue 3 و 4 */
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
<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 right-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-l border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        'translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <NuxtLink to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/logo.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/logo-dark.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img
          v-else
          src="/images/logo/logo-icon.svg"
          alt="Logo"
          width="32"
          height="32"
        />
      </NuxtLink>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'mr-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(
                          groupIndex,
                          index
                        ),
                      },
                    ]"
                  />
                </button>
                <NuxtLink
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </NuxtLink>
                <Transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 mr-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <NuxtLink
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(
                                subItem.path
                              ),
                              'menu-dropdown-item-inactive': !isActive(
                                subItem.path
                              ),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 mr-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </Transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  ChatIcon,
  MailIcon,
  DocsIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
  BoxCubeIcon,
} from "../Icons_TMP";
const route = useRoute();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

const menuGroups = [
  {
    title: "منو",
    items: [
      {
        icon: GridIcon,
        name: "داشبورد",
        subItems: [{ name: "فروشگاه", path: "/", pro: false }],
      },
      {
        name: "محصولات",
        icon: PageIcon,
        subItems: [
          { name: "همه", path: "/product", pro: false },
          { name: "ایجاد محصول جدید", path: "/product/create", pro: false },
        ],
      },

      {
        icon: CalenderIcon,
        name: "سفارشات",
   
         subItems: [
          { name: "همه", path: "/order", pro: false },
          { name: "سفارشات ارسال نشده", path: "/order/no-sending", pro: false },
        ],
      },
      {
        icon: CalenderIcon,
        name: "خبر نامه",
        path: "/news-letter",
      },
      {
        icon: UserCircleIcon,
        name: "مشتری ها",
        subItems: [
          { name: "همه", path: "/customers", pro: false },
          { name: "ایجاد مشتری جدید", path: "/customers/create", pro: false },
        ],
      },

      {
        name: "دسته بندی ها",
        icon: ListIcon,
        subItems: [
          { name: "همه", path: "/category", pro: false },
          { name: "ایجاد دسته بندی", path: "/category/create", pro: false },
        ],
      },
      {
        name: "برند ها",
        icon: TableIcon,
        subItems: [
          { name: "همه", path: "/brand", pro: false },
          { name: "ایحاد برند", path: "/brand/create", pro: false },
        ],
      },
      {
        name: "تگ های محصول",
        icon: TableIcon,
        subItems: [{ name: "مدیریت تگ ها", path: "/tag", pro: false }],
      },
      {
        name: "تخفیف ها",
        icon: TableIcon,
        subItems: [
          { name: "کد های تخفیف", path: "/promotion", pro: false },
          { name: "کد تخفیف جدید", path: "/promotion/create", pro: false },
        ],
      },
      {
        icon: CalenderIcon,
        name: "دیدگاه کاربران",
        subItems: [
          { name: "همه", path: "/comments", pro: false },
          { name: "تایید شده", path: "/comments/approve", pro: false },
          { name: "تایید نشده", path: "/comments/reject", pro: false },
        ],
      },
      {
        icon: CalenderIcon,
        name: "بنر ها",
        subItems: [
          { name: "همه", path: "/banners", pro: false },
          { name: "بنر جدید", path: "/banners/create", pro: false },
        ],
      },
      {
        icon: CalenderIcon,
        name: "مجله زیبایی",
        subItems: [
          { name: "مقالات", path: "/magazine/articles", pro: false },
          { name: "دسته‌بندی‌ها", path: "/magazine/categories", pro: false },
          { name: "برچسب‌ها", path: "/magazine/tags", pro: false },
          { name: "نویسندگان", path: "/magazine/authors", pro: false },
          { name: "نظرات", path: "/magazine/comments", pro: false },
          // { name: "مقاله جدید", path: "/magazine/articles/create", pro: false },
        ],
      },
    ],
  },
];

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path))
    )
  );
});

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path)
      ))
  );
};

const startTransition = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  el.offsetHeight; // force reflow
  el.style.height = height + "px";
};

const endTransition = (el) => {
  el.style.height = "";
};
</script>

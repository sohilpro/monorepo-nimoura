<template>
  <div class="flex-between container">
    <!-- Search Box -->
    <MainSearchBox />

    <!-- Logo -->
    <NuxtLink to="/" class="flex flex-col text-center items-center">
      <span
        class="font-modam font-bold text-4xl text-nimoura-primary flex items-center"
      >
        <!-- <Iconsnimoura /> -->
        نیمورا
      </span>
      <p class="font-vazir">زیبایی را با نیمورا تجربه کنید.</p>
    </NuxtLink>

    <ClientOnly>
      <!--  Action -->
      <div class="flex items-center gap-x-3">
        <!-- LOGIN -->
        <NuxtLink v-if="!auth" to="/auth" class="flex items-center gap-x-2">
          <Button
            label="ورود | ثبت‌نام"
            variant="outlined"
            rounded
            severity="secondary"
            class="app-hover"
            icon="pi pi-sign-in"
          />
        </NuxtLink>

        <!-- Account Btn -->
        <button
          v-else
          class="group relative flex-center py-2 px-4 border border-nimoura-border rounded-full app-hover delay-75"
        >
          <NuxtLink to="/profile" class="flex items-center gap-x-1">
          <i class="pi pi-user"/>
            <p>حساب کاربری</p>
          </NuxtLink>

          <div
            class="absolute border border-gray-100 z-999 w-52 p-2 bg-white text-nimoura-text-700 flex flex-col gap-y-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-12 transition-all delay-100 top-20 rounded-lg text-base shadow *:transition-all duration-300 *:py-1.5 *:px-2 *:text-red-500 *:w-full"
          >
            <template v-for="(item, i) in menuItems" :key="i">

              <button
                @click="item.onClick?.()"
                class="flex items-center gap-x-2"
              >
                <i :class="`${item.icon}`"/>
                {{ item.label }}
              </button>
            </template>
          </div>
        </button>

        <!-- <AuthLogoutConfirm v-model="showConfirmLogOut" /> -->

        <!-- Shoping cart -->
        <NuxtLink
          to="/cart"
          class="flex-center text-gray-100 rounded-full relative"
        >
          <Button
            icon="pi pi-shopping-cart"
            rounded
            :pt="{
              root: {
                style: {
                  backgroundColor: 'var(--p-nimoura-500)',
                  borderColor: 'var(--p-nimoura-500)',
                },
              },
            }"
          />
          <span class="absolute top-0 -right-1 flex h-4 w-4">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-nimoura-velvet opacity-75"
            ></span>
            <span
              class="relative font-modam inline-flex rounded-full h-4 w-4 bg-white text-xs flex-center text-black"
              >{{ cart.totalCount  }}</span
            >
          </span>
        </NuxtLink>

        <!-- Cart -->
        <!-- <CartShopping /> -->
      </div>

      <template #fallback>
        <div class="flex items-center gap-x-3">
          <!-- ... محتوای Action-Bar-Skeleton را اینجا کپی کنید ... -->
          <!-- <div
            class="flex-center py-2 px-4 h-11 bg-gray-200 rounded-full border border-gray-300 w-32"
          >
            <div class="w-full h-4 bg-gray-300 rounded-md"></div>
          </div>
          <div
            class="flex-center p-2 h-11 w-11 bg-nimoura-primary rounded-full relative"
          >
            <div class="size-6 bg-white/50 rounded-full"></div>
            <span class="absolute -top-1 -right-1 flex h-4 w-4">
              <span
                class="relative inline-flex rounded-full h-4 w-4 bg-gray-300 text-xs flex-center"
              ></span>
            </span>
          </div>-->
          <Skeleton width="8rem" height="2.75rem" class="mb-2 rounded-full!"></Skeleton>
          <div
            class="flex-center p-2 h-11 w-11 bg-nimoura-primary rounded-full relative"
          >
          <Skeleton size="1rem"></Skeleton>
          <span class="absolute -top-1 -right-1 flex h-4 w-4">
            <Skeleton width="1rem" height="1rem" class="mb-2"></Skeleton>
            
          </span>
        </div>
        </div> 
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
const auth = useAuth();
const cart = useCartStore();
const showConfirmLogOut = ref(false);

const menuItems = [
  {
    type: "button",
    label: "خروج از حساب",
    icon: "pi pi-sign-out",
    onClick: logoutUser,
  },
];

function logoutUser() {
  showConfirmLogOut.value = true;
}
</script>

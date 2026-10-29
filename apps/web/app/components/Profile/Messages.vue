<template>
  <main class="container relative">
    <div class="flex flex-col lg:flex-row gap-x-8 mt-10">
      <!-- SIDE MENU -->
      <ProfileSideMenu />

      <!-- TOP FILTER BOX & PRODUCT & PAGINATION -->
      <div class="lg:w-3/4">
        <ProfileSideMenuMobile />

        <div class="flex flex-col shadow rounded-lg p-4 bg-white mt-5 lg:mt-0">
          <div class="flex items-center justify-between">
            <h2 class="font-vazir font-medium text-lg">پیام های من:</h2>
          </div>

          <ul class="mt-5 space-y-3">
            <li
              class="relative w-full border border-nimoura-border p-3 md:p-4 rounded-lg bg-white"
            >
              <h2 class="font-vazir font-medium text-lg text-nimoura-primary">
                پارسا وصالی عزیز، سفارش شما با شماره پیگیری #1222 ارسال شد
              </h2>

              <div class="space-y-1.5 text-nimoura-text-600 mt-3 mr-2 text-sm">
                <p class="flex items-center gap-x-1">
                  1404/3/9 | 12:00
                  <svg class="size-5 mb-0.5 text-nimoura-text-400">
                    <use href="#calendar"></use>
                  </svg>
                </p>
              </div>

              <span
                class="absolute p-1.5 md:p-2 rounded-lg bg-nimoura-primary/10 text-nimoura-primary left-4 bottom-3 flex items-center gap-x-2 cursor-pointer hover:bg-nimoura-primary/20 transition-all text-sm font-vazir font-medium"
              >
                پیگیری سفارش
                <svg class="size-5">
                  <use href="#arrow"></use>
                </svg>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<template>
  <main class="container relative">
    <div class="mt-10 flex flex-col gap-8 lg:flex-row">
      <!-- SIDE MENU -->
      <ProfileSideMenu />

      <!-- MESSAGES -->
      <div class="lg:w-3/4">
        <ProfileSideMenuMobile />

        <section class="mt-5 rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] lg:mt-0">
          <div class="flex items-center justify-between border-b border-nimoura-text-100 pb-4">
            <h2 class="text-lg font-semibold text-nimoura-text-900">پیام های من</h2>
            <span class="rounded-full bg-nimoura-primary/10 px-3 py-1 text-xs font-semibold text-nimoura-primary">۱ پیام</span>
          </div>

          <ul class="mt-5 space-y-3">
            <li class="relative rounded-2xl border border-nimoura-100 bg-nimoura-base/60 p-4 transition-all hover:border-nimoura-300 hover:shadow-sm">
              <div class="flex items-start gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-nimoura-primary/10 text-nimoura-primary">
                  <i class="pi pi-truck text-sm" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-semibold leading-relaxed text-nimoura-primary sm:text-base">
                    پارسا وصالی عزیز، سفارش شما با شماره پیگیری #1222 ارسال شد
                  </h3>
                  <p class="mt-3 flex items-center gap-1.5 text-sm text-nimoura-text-500">
                    1404/3/9 | 12:00
                    <svg class="size-4 text-nimoura-text-400">
                      <use href="#calendar"></use>
                    </svg>
                  </p>
                </div>
              </div>

              <Button
                type="button"
                label="پیگیری سفارش"
                icon="pi pi-arrow-left"
                icon-pos="right"
                size="small"
                class="!mt-4 !rounded-xl !border !border-nimoura-primary/20 !bg-nimoura-primary/10 !px-3 !py-2 !text-xs !font-semibold !text-nimoura-primary transition-colors hover:!bg-nimoura-primary hover:!text-white"
              />
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

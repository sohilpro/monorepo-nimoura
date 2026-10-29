<template>
  <Dialog
    v-model:visible="model"
    modal
    :draggable="false"
    :dismissable-mask="true"
    class="!w-[24rem] !max-w-[92vw] !rounded-2xl"
    :pt="{ header: '!hidden', content: '!rounded-2xl !p-6' }"
  >
    <div class="mx-auto text-center">
      <div class="mb-4 flex justify-center">
        <div class="flex-center size-14 rounded-full bg-red-50 text-red-500">
          <i class="pi pi-sign-out text-2xl" />
        </div>
      </div>

      <h2 class="mb-2 text-lg font-bold text-surface-800">خروج از حساب</h2>
      <p class="text-sm text-surface-500">
        آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <Button
          label="بله، خارج شو"
          severity="danger"
          :loading="isLoggingOut"
          class="!flex-1"
          @click="logout"
        />
        <Button
          label="انصراف"
          severity="secondary"
          outlined
          class="!flex-1"
          @click="model = false"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const auth = useAuth();
const cart: any = useCartStore();
const toast = useAppToast();
const isLoggingOut = ref(false);

async function logout() {
  isLoggingOut.value = true;

  try {
    const data: any = await $fetch("/api/auth/logout", { method: "DELETE" });

    toast.info(data.message);
    auth.value = null;
    cart.items = [];
    cart.shippingCost = null;
    cart.promotion = null;

    navigateTo("/");
  } catch (err: any) {
    toast.error(err?.data?.message || "خطا در خروج از حساب");
  } finally {
    isLoggingOut.value = false;
    model.value = false;
  }
}
</script>
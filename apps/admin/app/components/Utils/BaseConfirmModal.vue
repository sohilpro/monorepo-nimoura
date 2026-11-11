<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-2xl bg-opacity-50"
  >
    <div
      class="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md"
    >
      <h2 class="text-lg font-bold text-gray-800 mb-4">
        {{ title }}
      </h2>
      <p class="text-sm text-gray-600 mb-6">
        {{ message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          @click="cancel"
        >
          انصراف
        </button>
        <button
          :disabled="isLoading"
          :class="{ 'opacity-50': isLoading }"
          class="px-4 py-2 bg-red-600 flex items-center gap-2 text-white rounded hover:bg-red-700"
          @click="confirm"
        >
          {{ confirmLabel }}

          <IconsLoading v-if="isLoading" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { confirmLabel, message, title, visible } = defineProps<{
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
}>();

const emit = defineEmits(["confirm", "cancel"]);

const { isLoading } = useLoading();

function confirm() {
  emit("confirm");
}
function cancel() {
  emit("cancel");
  document.documentElement.classList.remove("overflow-hidden");
}
</script>

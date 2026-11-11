<template>
  <div
    class="border-gray-300 border-dashed border-2 rounded-xl transition-all duration-300 bg-gray-50 p-7 hover:border-brand-500 lg:p-10 cursor-pointer"
    :class="{ '!border-brand-500 opacity-50': isDragging }"
    @click="emit('browse')"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div class="dz-message m-0! text-center">
      <div class="mb-[22px] flex justify-center">
        <div
          class="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700"
        >
          <svg
            class="fill-current"
            width="29"
            height="28"
            viewBox="0 0 29 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
            />
          </svg>
        </div>
      </div>
      <h4
        class="mb-3 font-semibold text-gray-800 text-theme-xl"
      >
        فایل خود را بکشید و رها کنید
      </h4>
      <span
        class="mx-auto mb-5 block w-full max-w-[290px] text-sm text-gray-700"
      >
        تصاویر PNG، JPG، WebP یا SVG خود را اینجا بکشید و رها کنید یا فایل را
        انتخاب کنید
      </span>
      <span
        class="font-medium underline cursor-pointer text-theme-sm text-brand-500"
      >
        انتخاب فایل
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["browse", "drop"]);
const isDragging = ref(false);

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  emit("drop", files);
}
</script>

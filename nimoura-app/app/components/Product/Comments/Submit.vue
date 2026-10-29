<template>
  <div class="lg:w-1/4 flex flex-col w-full">
    <!-- عنوان فرم -->
    <p class="font-vazir font-medium text-lg mb-2 text-nimoura-text-800">
      ثبت دیدگاه
    </p>

    <!-- ورودی عنوان -->
    <input
      v-model="body.subject"
      type="text"
      placeholder="عنوان"
      class="tailwind-input bg-nimoura-base border border-nimoura-border text-nimoura-text-700 focus:ring-1 focus:ring-nimoura-primary focus:outline-none rounded-lg px-3 py-2 mb-4"
    />

    <!-- توضیح سوال -->
    <p class="text-nimoura-text-500 text-sm mb-4">
      این محصول را به دیگران پیشنهاد :
    </p>

    <!-- دکمه‌های پیشنهاد -->
    <div
      class="grid grid-cols-12 child:col-span-6 gap-4 child:w-full child:flex child:items-center child:justify-center child:gap-x-2 child:rounded-lg child:shadow-sm child:py-2 mb-5 child:font-vazir child:font-medium child:duration-300 child:transition-all"
    >
      <button
        type="button"
        @click="handleSubmitRecommend(true)"
        class="text-green-600 border border-green-100 focus:ring-2 focus:ring-green-400 bg-green-50 hover:bg-green-100"
      >
        <svg class="w-5 h-5">
          <use href="#hand-up"></use>
        </svg>
        میکنم
      </button>
      <button
        type="button"
        @click="handleSubmitRecommend(false)"
        class="text-red-500 border border-red-100 focus:ring-2 focus:ring-red-400 bg-red-50 hover:bg-red-100"
      >
        <svg class="w-5 h-5">
          <use href="#hand-down"></use>
        </svg>
        نمیکنم
      </button>
    </div>

    <!-- متن دیدگاه -->
    <textarea
      v-model="body.description"
      class="h-24 tailwind-input bg-nimoura-base border border-nimoura-border text-nimoura-text-700 focus:ring-1 focus:ring-nimoura-primary focus:outline-none rounded-lg px-3 py-2 mb-4"
      placeholder="متن دیدگاه"
    ></textarea>

    <!-- دکمه ارسال -->
    <button
      @click="handleSubmitComment"
      class="rounded-lg p-2 bg-nimoura-primary hover:bg-nimoura-primary/90 text-white transition-all text-sm font-medium"
    >
      ثبت
    </button>
  </div>
</template>

<script setup>
const route = useRoute();
const { withLoading } = useLoading();

const body = reactive({
  subject: "",
  description: "",
  productId: +route.params.id,
});

const handleSubmitComment = async () => {
  await withLoading(async () => {
    try {
      const data = await $fetch("/api/comments/create", {
        method: "POST",
        body,
      });

      useNuxtApp().$toast.success(data.data.message || "دیدگاه شما ثبت شد.");
    } catch (error) {
      useNuxtApp().$toast.error(
        error.data.data.message || "مشکلی پیش آمده است.",
      );
    }
  });
};
const handleSubmitRecommend = async (req) => {
  await withLoading(async () => {
    try {
      const data = await $fetch("/api/comments/recommend", {
        method: "POST",
        body: { recommend: req },
        query: { id: +route.params.id },
      });

      useNuxtApp().$toast.success(data.data.message);
    } catch (error) {
      useNuxtApp().$toast.error(
        error.data.data.message || "نشکلی پیش آمده است.",
      );
    } finally {
      isLoading.value = false;
    }
  });
};
</script>

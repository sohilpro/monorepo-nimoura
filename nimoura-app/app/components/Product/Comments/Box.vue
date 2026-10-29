<template>
  <li
    v-for="(comment, index) in comments"
    :key="index"
    class="child:flex py-4 border-b border-nimoura-border/60"
  >
    <!-- TITLE -->
    <div class="flex items-center gap-x-2">
      <h2 class="font-vazir font-medium text-lg mb-1 text-nimoura-text-800">
        {{ comment.subject }}
      </h2>
      <span
        v-if="comment.isVerifiedBuyer"
        class="px-2 py-1 mb-2 rounded-lg bg-nimoura-primary text-white text-xs"
      >
        خریدار
      </span>
    </div>

    <!-- COMMENT TEXT -->
    <div class="flex-col">
      <p
        class="text-nimoura-text-500 mb-2 line-clamp-2 text-sm leading-relaxed"
      >
        {{ comment.description }}
      </p>
    </div>

    <!-- COMMENT FOOTER -->
    <div
      class="mt-2 lg:mt-0 flex-col lg:flex-row gap-y-2 lg:items-center justify-between"
    >
      <div class="flex items-center gap-x-4 text-nimoura-text-400 text-xs">
        <p>{{ formatDate(comment.createdAt) }}</p>
        <p>{{ comment.user.first_name }} {{ comment.user.last_name }}</p>
      </div>

      <div class="flex items-center gap-x-2 flex-wrap mt-2">
        <p class="text-nimoura-text-400 text-sm">
          آیا این دیدگاه برایتان مفید بود؟
        </p>
        <div
          class="flex items-center gap-x-2 child:flex child:items-center child:gap-x-1 child:rounded-lg child:px-3 child:py-1 child:font-vazir child:font-medium child:duration-300 child:transition-all child:text-sm child:border"
        >
          <button
            class="text-green-600 border-green-200 hover:bg-green-50 focus:ring-2 focus:ring-green-400"
          >
            {{ comment.likesCount }}
            <svg class="w-4 h-4">
              <use href="#hand-up"></use>
            </svg>
          </button>
          <button
            class="text-red-500 border-red-200 hover:bg-red-50 focus:ring-2 focus:ring-red-400"
          >
            {{ comment.dislikesCount }}
            <svg class="w-4 h-4">
              <use href="#hand-down"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup>
const { comments } = defineProps({
  comments: Array,
});
const route = useRoute();
const { data } = await useFetch("/api/comments/listByProduct", {
  query: { id: +route.params.id },
});

const handleSubmitRecommend = async (req) => {
  isLoading.value = true;
  try {
    const data = await $fetch("/api/comments/recommend", {
      method: "POST",
      body: { recommend: req },
      query: { id: +route.params.id },
    });

    useNuxtApp().$toast.success(data.data.message);
  } catch (error) {
    useNuxtApp().$toast.error(error.data.data.message || "نشکلی پیش آمده است.");
  } finally {
    isLoading.value = false;
  }
};
</script>

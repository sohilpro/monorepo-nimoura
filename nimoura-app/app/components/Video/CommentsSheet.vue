<script setup lang="ts">
interface CommentItem {
  id: number;
  text: string;
  createdAt: string;
  user: { id: number; firstName?: string; lastName?: string; avatar?: string };
}

const props = defineProps<{ visible: boolean; videoId: number }>();
const emit = defineEmits<{ "update:visible": [boolean] }>();

const comments = ref<CommentItem[]>([]);
const nextCursor = ref<number | null>(null);
const pending = ref(false);
const loadedOnce = ref(false);
const newComment = ref("");
const sending = ref(false);

async function loadComments() {
  if (pending.value) return;
  pending.value = true;
  try {
    const res: any = await $fetch<{
      items: CommentItem[];
      nextCursor: number | null;
    }>(`/api/explore/videos/${props.videoId}/comments`, {
      query: { cursor: nextCursor.value ?? undefined },
    });
    comments.value.push(...res.data.items);
    nextCursor.value = res.nextCursor;
  } finally {
    pending.value = false;
    loadedOnce.value = true;
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible && !loadedOnce.value) loadComments();
  },
);

async function submitComment() {
  const text = newComment.value.trim();
  if (!text || sending.value) return;
  sending.value = true;
  try {
    const comment = await $fetch<CommentItem>(
      `/api/explore/videos/${props.videoId}/comments`,
      { method: "POST", body: { text } },
    );
    comments.value.unshift(comment);
    newComment.value = "";
  } finally {
    sending.value = false;
  }
}

function close() {
  emit("update:visible", false);
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="absolute inset-0 z-50 overflow-hidden"
      @click.self="close"
    >
      <Transition name="slide-up" appear>
        <div
          v-if="visible"
          class="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-nimoura-text-100"
          >
            <p class="font-medium text-nimoura-text-800">دیدگاه‌ها</p>
            <button @click="close">
              <i class="pi pi-times text-nimoura-text-400" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            <div v-if="pending && comments.length === 0" class="space-y-3">
              <Skeleton
                v-for="n in 4"
                :key="n"
                height="3rem"
                class="rounded-xl"
              />
            </div>

            <p
              v-else-if="comments.length === 0"
              class="text-center text-sm text-nimoura-text-400 py-8"
            >
              هنوز دیدگاهی ثبت نشده. اولین نفر باش!
            </p>

            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex gap-3"
            >
              <img
                :src="comment.user.avatar || '/images/avatar-placeholder.png'"
                class="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-nimoura-text-800">
                  {{ comment.user.firstName }} {{ comment.user.lastName }}
                </p>
                <p class="text-sm text-nimoura-text-600 mt-0.5">
                  {{ comment.text }}
                </p>
              </div>
            </div>

            <button
              v-if="nextCursor"
              class="text-nimoura-primary text-sm mx-auto block"
              @click="loadComments"
            >
              نمایش بیشتر
            </button>
          </div>

          <div
            class="flex items-center gap-2 px-4 py-3 border-t border-nimoura-text-100"
          >
            <input
              v-model="newComment"
              type="text"
              placeholder="دیدگاهت رو بنویس..."
              class="flex-1 border border-nimoura-text-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nimoura-primary/30"
              @keyup.enter="submitComment"
            />
            <button
              class="text-nimoura-primary disabled:opacity-40"
              :disabled="!newComment.trim() || sending"
              @click="submitComment"
            >
              <i class="pi pi-send text-xl!" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

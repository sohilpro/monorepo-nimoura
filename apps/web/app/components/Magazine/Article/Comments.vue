<script setup lang="ts">
import type { Comment } from "~~/server/types/magazine";

const props = defineProps<{
  articleId: number | string;
  commentCount: number;
}>();

const toast = useAppToast();

// دریافت لیست نظرات تایید شده
const {
  data: commentsData,
  pending,
  refresh,
} = await useFetch<Comment[]>("/api/magazine/comments", {
  query: { articleId: props.articleId },
  key: `article-comments-${props.articleId}`,
});

const comments = computed<Comment[]>(() => {
  const c = commentsData.value as any;
  if (Array.isArray(c?.data)) return c.data;
  if (Array.isArray(c)) return c;
  return [];
});

// فرم ثبت نظر
const form = reactive({
  name: "",
  email: "",
  content: "",
  parentId: null as number | null,
});

const replyingToName = ref<string | null>(null);
const submitting = ref(false);
const submittedSuccess = ref(false);

function setReply(comment: Comment) {
  form.parentId = Number(comment.id);
  replyingToName.value = comment.name;
  document
    .getElementById("comment-form")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cancelReply() {
  form.parentId = null;
  replyingToName.value = null;
}

async function handleSubmit() {
  if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
    toast.add({
      severity: "warn",
      summary: "لطفاً تمام فیلدها را پر کنید",
      life: 2500,
    });
    return;
  }

  submitting.value = true;
  try {
    await $fetch("/api/magazine/comments", {
      method: "POST",
      body: {
        articleId: Number(props.articleId),
        name: form.name.trim(),
        email: form.email.trim(),
        content: form.content.trim(),
        parentId: form.parentId || undefined,
      },
    });

    submittedSuccess.value = true;
    form.name = "";
    form.email = "";
    form.content = "";
    cancelReply();

    toast.add({
      severity: "success",
      summary: "دیدگاه شما ثبت شد",
      detail: "نظر شما پس از بررسی و تایید مدیر نمایش داده خواهد شد.",
      life: 4000,
    });
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "خطا در ثبت نظر",
      detail: err?.data?.message || "مشکلی پیش آمد، لطفاً دوباره تلاش کنید.",
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <section id="comments-section" class="my-14 rounded-3xl border border-nimoura-border/40 bg-white p-6 sm:p-10 shadow-xs">
    <!-- عنوان بخش دیدگاه‌ها -->
    <div class="mb-8 flex items-center justify-between border-b border-nimoura-border/30 pb-5">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary">
          <i class="pi pi-comments text-lg" />
        </span>
        <div>
          <h3 class="font-display text-xl sm:text-2xl font-bold text-nimoura-velvet">
            دیدگاه‌ها و پرسش‌های کاربران
          </h3>
          <p class="text-xs text-nimoura-text-500 mt-0.5">
            تجربه یا نظر خود را درباره این مقاله با دیگران در میان بگذارید
          </p>
        </div>
      </div>
      <span class="rounded-full bg-nimoura-base px-3.5 py-1 text-xs font-bold text-nimoura-primary border border-nimoura-border/40">
        {{ comments.length }} نظر
      </span>
    </div>

    <!-- فرم ثبت نظر -->
    <div id="comment-form" class="mb-12 rounded-2xl bg-nimoura-base/50 p-5 sm:p-6 border border-nimoura-border/40">
      <div v-if="replyingToName" class="mb-4 flex items-center justify-between rounded-xl bg-nimoura-primary/10 px-4 py-2 text-xs text-nimoura-velvet">
        <span>
          در پاسخ به <strong>{{ replyingToName }}</strong>
        </span>
        <button type="button" class="text-nimoura-primary font-bold hover:underline" @click="cancelReply">
          انصراف
        </button>
      </div>

      <h4 class="font-display text-sm font-bold text-nimoura-velvet mb-4">
        {{ replyingToName ? 'ارسال پاسخ شما' : 'دیدگاه خود را بنویسید' }}
      </h4>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-medium text-nimoura-text-600 mb-1.5">نام و نام‌خانوادگی *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="مثلاً: سارا احمدی"
              class="w-full rounded-xl border border-nimoura-border/60 bg-white px-3.5 py-2.5 text-xs text-nimoura-velvet shadow-xs focus:border-nimoura-primary focus:outline-none focus:ring-1 focus:ring-nimoura-primary"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-nimoura-text-600 mb-1.5">ایمیل (نمایش داده نمی‌شود) *</label>
            <input
              v-model="form.email"
              type="email"
              dir="ltr"
              placeholder="name@example.com"
              class="w-full rounded-xl border border-nimoura-border/60 bg-white px-3.5 py-2.5 text-xs text-nimoura-velvet shadow-xs text-left focus:border-nimoura-primary focus:outline-none focus:ring-1 focus:ring-nimoura-primary"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-nimoura-text-600 mb-1.5">متن دیدگاه شما *</label>
          <textarea
            v-model="form.content"
            rows="3"
            placeholder="تجربه یا سوال خود را اینجا بنویسید..."
            class="w-full rounded-xl border border-nimoura-border/60 bg-white p-3.5 text-xs text-nimoura-velvet leading-relaxed shadow-xs focus:border-nimoura-primary focus:outline-none focus:ring-1 focus:ring-nimoura-primary"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] text-nimoura-text-400">
            * نظر شما پس از بررسی توسط تیم تحریریه منتشر خواهد شد.
          </span>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center gap-2 rounded-xl bg-nimoura-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-nimoura-primary/90 disabled:opacity-50"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner text-xs" />
            <i v-else class="pi pi-send text-xs" />
            ثبت دیدگاه
          </button>
        </div>
      </form>
    </div>

    <!-- لیست دیدگاه‌های تایید شده -->
    <div v-if="pending" class="space-y-4 py-4">
      <PSkeleton height="90px" class="!rounded-2xl" />
      <PSkeleton height="90px" class="!rounded-2xl" />
    </div>

    <div v-else-if="comments.length > 0" class="space-y-6">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-2xl border border-nimoura-border/30 bg-nimoura-base/20 p-4 sm:p-5"
      >
        <!-- کاربر اصلی -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-nimoura-primary/15 font-bold text-nimoura-primary text-xs">
              {{ comment.name.charAt(0) }}
            </div>
            <div>
              <p class="font-display text-xs sm:text-sm font-bold text-nimoura-velvet">{{ comment.name }}</p>
              <span class="text-[11px] text-nimoura-text-400">{{ formatDate(comment.createdAt) }}</span>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-nimoura-primary hover:bg-nimoura-primary/10 transition"
            @click="setReply(comment)"
          >
            <i class="pi pi-reply text-[10px]" />
            پاسخ
          </button>
        </div>

        <p class="mt-3 text-xs sm:text-sm leading-relaxed text-nimoura-text-700 whitespace-pre-line">
          {{ comment.content }}
        </p>

        <!-- پاسخ‌های مرتبط -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-3 mr-4 border-r-2 border-nimoura-primary/30 pr-4">
          <div
            v-for="reply in comment.replies"
            :key="reply.id"
            class="rounded-xl bg-white p-3.5 border border-nimoura-border/30 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-nimoura-velvet px-2 py-0.5 text-[10px] font-bold text-white">
                  پاسخ مدیر
                </span>
                <span class="text-xs font-bold text-nimoura-velvet">{{ reply.name }}</span>
              </div>
              <span class="text-[10px] text-nimoura-text-400">{{ formatDate(reply.createdAt) }}</span>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-nimoura-text-600 whitespace-pre-line">
              {{ reply.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-10 text-xs sm:text-sm text-nimoura-text-400">
      هنوز نظری برای این مقاله ثبت نشده است. شما اولین نفری باشید که نظر خود را به اشتراک می‌گذارد!
    </div>
  </section>
</template>

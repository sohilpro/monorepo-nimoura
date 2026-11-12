<template>
  <div class="w-full xl:w-72 xl:shrink-0">
    <div
      class="bg-nimoura-base border border-nimoura-border rounded-2xl p-4 sm:p-5 space-y-4 xl:sticky xl:top-4"
    >
      <p class="text-base font-medium text-nimoura-text-700">
        نظر خود را بنویسید
      </p>

      <ClientOnly>
        <template v-if="!isLoggedIn">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <span
              class="flex size-11 items-center justify-center rounded-2xl bg-nimoura-primary/10 text-nimoura-primary"
            >
              <i class="pi pi-user text-lg!" aria-hidden="true" />
            </span>
            <p class="text-xs leading-6 text-nimoura-text-600">
              برای ثبت دیدگاه، امتیاز و آپلود تصویر محصول، ابتدا وارد حساب کاربری خود شوید.
            </p>
            <NuxtLink
              :to="loginUrl"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-nimoura-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-nimoura-primary/90"
            >
              <i class="pi pi-sign-in text-sm!" aria-hidden="true" />
              <span>ورود به حساب کاربری</span>
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <!-- Stars -->
          <div>
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="text-xl leading-none transition-transform hover:scale-110"
                :class="
                  star <= (hoverRating || form.rating)
                    ? 'text-amber-400'
                    : 'text-gray-300'
                "
                :aria-label="`امتیاز ${star} از ۵`"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="form.rating = star"
              >
                ★
              </button>
              <span v-if="form.rating" class="ms-1 text-xs text-nimoura-text-400">
                {{ ratingLabel(form.rating) }}
              </span>
            </div>
            <p v-if="formErrors.rating" class="mt-1 text-xs text-red-500">
              {{ formErrors.rating }}
            </p>
          </div>

          <!-- Subject -->
          <div>
            <InputText
              v-model="form.subject"
              placeholder="عنوان نظر"
              class="w-full text-sm"
              maxlength="100"
              :invalid="!!formErrors.subject"
            />
            <p v-if="formErrors.subject" class="mt-1 text-xs text-red-500">
              {{ formErrors.subject }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <Textarea
              v-model="form.description"
              :rows="4"
              placeholder="تجربه خود را بنویسید..."
              class="w-full resize-none text-sm"
              autoResize
              :invalid="!!formErrors.description"
            />
            <p v-if="formErrors.description" class="mt-1 text-xs text-red-500">
              {{ formErrors.description }}
            </p>
          </div>

          <!-- Image upload -->
          <div>
            <p class="mb-2 text-xs text-nimoura-text-500">
              تصویر محصول <span class="text-nimoura-text-400">(اختیاری، حداکثر ۴ مگابایت)</span>
            </p>
            <div class="flex items-center gap-3">
              <div
                v-if="imagePreview"
                class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-nimoura-border"
              >
                <img
                  :src="imagePreview"
                  alt="پیش‌نمایش تصویر نظر"
                  class="h-full w-full object-cover"
                />
                <button
                  type="button"
                  class="absolute inset-0 flex items-center justify-center bg-black/45 text-xs text-white opacity-0 transition-opacity hover:opacity-100"
                  aria-label="حذف تصویر"
                  @click="clearImage"
                >
                  ✕
                </button>
              </div>

              <button
                v-if="!imagePreview"
                type="button"
                class="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-nimoura-border text-nimoura-text-400 transition-colors hover:border-nimoura-primary hover:text-nimoura-primary disabled:opacity-50"
                :disabled="submitting"
                @click="fileInput?.click()"
              >
                <i class="pi pi-image text-base" />
                <span class="text-[9px]">افزودن</span>
              </button>

              <div v-if="imagePreview" class="text-xs leading-5 text-nimoura-text-400">
                <p>عکس انتخاب شد</p>
                <button
                  type="button"
                  class="text-red-400 underline hover:text-red-500"
                  @click="clearImage"
                >
                  حذف
                </button>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>
          </div>

          <Button
            :label="submitting ? 'در حال ارسال...' : 'ثبت نظر'"
            :loading="submitting"
            :disabled="submitting"
            icon="pi pi-send"
            class="w-full !border-nimoura-primary !bg-nimoura-primary"
            @click="submitComment"
          />

          <p class="text-center text-[11px] leading-5 text-nimoura-text-400">
            نظرات پس از تأیید نمایش داده می‌شوند
          </p>
        </template>

        <template #fallback>
          <div class="space-y-3 py-2 animate-pulse">
            <div class="h-6 w-28 rounded-full bg-gray-200" />
            <div class="h-9 w-full rounded-lg bg-gray-200" />
            <div class="h-24 w-full rounded-lg bg-gray-200" />
            <div class="h-10 w-full rounded-lg bg-gray-200" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const props = defineProps<{
  productId: number;
}>();

const emit = defineEmits<{
  submitted: [];
}>();

const auth = useAuth();
const route = useRoute();
const toast = useAppToast();

const isLoggedIn = computed(() => Boolean(auth.value));
const loginUrl = computed(
  () => `/auth?redirect=${encodeURIComponent(route.fullPath)}`,
);

const fileInput = ref<HTMLInputElement | null>(null);
const submitting = ref(false);
const hoverRating = ref(0);
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const form = reactive({ rating: 0, subject: "", description: "" });
const formErrors = reactive({ rating: "", subject: "", description: "" });

const ratingLabel = (n: number) =>
  (["", "خیلی بد", "بد", "متوسط", "خوب", "عالی"] as const)[n] ?? "";

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error("فقط فرمت‌های JPG، PNG و WebP مجاز هستند");
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("حجم تصویر نباید بیشتر از ۴ مگابایت باشد");
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imagePreview.value = (ev.target?.result as string) ?? null;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  imagePreview.value = null;
  selectedFile.value = null;
}

async function uploadCommentImage(): Promise<string | null> {
  if (!selectedFile.value) return null;

  const fd = new FormData();
  fd.append("file", selectedFile.value);

  const res = await $fetch<{ success: boolean; url?: string; data?: { publicUrl?: string } }>(
    "/api/upload/comment-image",
    { method: "POST", body: fd },
  );

  const url = res?.url ?? res?.data?.publicUrl;
  if (!url) {
    throw new Error("آپلود تصویر با خطا مواجه شد");
  }
  return url;
}

function validate() {
  formErrors.rating = form.rating ? "" : "امتیاز الزامی است";
  formErrors.subject = form.subject.trim() ? "" : "عنوان الزامی است";
  formErrors.description =
    form.description.trim().length >= 10
      ? ""
      : "توضیحات باید حداقل ۱۰ کاراکتر باشد";
  return !formErrors.rating && !formErrors.subject && !formErrors.description;
}

async function submitComment() {
  if (!isLoggedIn.value) {
    toast.info("برای ثبت نظر ابتدا وارد حساب کاربری خود شوید");
    return;
  }
  if (!validate()) return;

  submitting.value = true;
  try {
    const imageUrl = await uploadCommentImage();

    await $fetch("/api/comments", {
      method: "POST",
      body: {
        productId: props.productId,
        subject: form.subject.trim(),
        description: form.description.trim(),
        rating: form.rating,
        images: imageUrl ? [imageUrl] : [],
      },
    });

    toast.success("نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود");
    form.rating = 0;
    form.subject = "";
    form.description = "";
    clearImage();
    emit("submitted");
  } catch (err: any) {
    const msg =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "مشکلی در ثبت نظر پیش آمد";
    toast.error(Array.isArray(msg) ? msg[0] : msg);
  } finally {
    submitting.value = false;
  }
}
</script>

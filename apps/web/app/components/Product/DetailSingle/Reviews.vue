<template>
  <section class="w-full bg-white px-3 py-4 sm:p-6 border border-gray-200 rounded-2xl" dir="rtl">

    <!-- Title -->
    <h2 class="text-lg sm:text-xl font-medium text-nimoura-text-700 mb-1">نظرات خریداران</h2>
    <div class="w-10 h-[1.5px] bg-nimoura-primary rounded mb-5" />

    <div class="flex flex-col xl:flex-row gap-5">

      <!-- ══ RIGHT COLUMN: form (mobile: top, xl: left) ══ -->
      <div class="w-full xl:w-72 xl:shrink-0">
        <div class="bg-nimoura-base border border-nimoura-border rounded-2xl p-4 sm:p-5 space-y-4 xl:sticky xl:top-4">
          <p class="text-base font-medium text-nimoura-text-700">نظر خود را بنویسید</p>

          <!-- Stars -->
          <div>
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5" :key="star"
                type="button"
                class="text-xl transition-transform hover:scale-110 leading-none"
                :class="star <= (hoverRating || form.rating) ? 'text-amber-400' : 'text-gray-300'"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="form.rating = star"
              >★</button>
              <span v-if="form.rating" class="text-xs text-nimoura-text-400 mr-1">
                {{ ratingLabel(form.rating) }}
              </span>
            </div>
            <p v-if="formErrors.rating" class="text-xs text-red-500 mt-1">{{ formErrors.rating }}</p>
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
            <p v-if="formErrors.subject" class="text-xs text-red-500 mt-1">{{ formErrors.subject }}</p>
          </div>

          <!-- Description -->
          <div>
            <Textarea
              v-model="form.description"
              :rows="4"
              placeholder="تجربه خود را بنویسید... "
              class="w-full resize-none text-sm"
              autoResize
              :invalid="!!formErrors.description"
            />
            <p v-if="formErrors.description" class="text-xs text-red-500 mt-1">{{ formErrors.description }}</p>
          </div>

          <!-- Image upload — یه عکس -->
          <div>
            <p class="text-xs text-nimoura-text-500 mb-2">
              تصویر <span class="text-nimoura-text-400">(اختیاری)</span>
            </p>
            <div class="flex items-center gap-3">
              <!-- preview -->
              <div
                v-if="imagePreview"
                class="relative w-16 h-16 rounded-xl overflow-hidden border border-nimoura-border shrink-0"
              >
                <img :src="imagePreview" alt="" class="w-full h-full object-cover" />
                <button
                  type="button"
                  class="absolute inset-0 bg-black/40 flex items-center justify-center
                         opacity-0 hover:opacity-100 transition-opacity text-white text-xs"
                  @click="clearImage"
                >✕</button>
              </div>

              <!-- trigger -->
              <button
                v-if="!imagePreview"
                type="button"
                class="w-16 h-16 rounded-xl border-2 border-dashed border-nimoura-border
                       flex flex-col items-center justify-center gap-0.5 shrink-0
                       text-nimoura-text-400 hover:border-nimoura-primary hover:text-nimoura-primary
                       transition-colors disabled:opacity-50"
                :disabled="submitting"
                @click="fileInput?.click()"
              >
                <i class="pi pi-image text-base" />
                <span class="text-[9px]">افزودن</span>
              </button>

              <div v-if="imagePreview" class="text-xs text-nimoura-text-400 leading-5">
                <p>عکس انتخاب شد</p>
                <button type="button" class="text-red-400 hover:text-red-500 underline" @click="clearImage">
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
            class="w-full !bg-nimoura-primary !border-nimoura-primary"
            @click="submitComment"
          />

          <p class="text-[11px] text-nimoura-text-400 text-center leading-5">
            نظرات پس از تأیید نمایش داده می‌شوند
          </p>
        </div>
      </div>

      <!-- ══ LEFT COLUMN: stats + comments ══ -->
      <div class="flex-1 min-w-0 space-y-5">

        <!-- Rating summary -->
        <div class="flex items-center gap-4 sm:gap-6 bg-nimoura-base border border-nimoura-border rounded-xl p-4 sm:p-5">
          <div class="text-center shrink-0">
            <div class="text-4xl sm:text-5xl font-medium text-nimoura-text-800 leading-none font-modam">
              {{ product.averageRating?.toFixed(1) ?? '۰' }}
              <span class="text-sm text-nimoura-primary font-normal font-modam">/۵</span>
            </div>
            <div class="text-nimoura-primary text-sm mt-1.5">
              {{ starsFilled(Math.round(product.averageRating ?? 0)) }}
            </div>
            <div class="text-[11px] text-nimoura-text-500 mt-1 font-modam">{{ product.ratingsCount ?? 0 }} نظر</div>
          </div>

          <div class="flex-1 min-w-0 space-y-1.5">
            <div v-for="row in computedRatingDist" :key="row.star" class="flex items-center gap-2">
              <span class="text-xs text-nimoura-text-500 w-3 shrink-0 font-modam">{{ row.star }}</span>
              <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-nimoura-primary rounded-full transition-all duration-700 "
                  :style="{ width: row.percent + '%' }"
                />
              </div>
              <span class="text-[11px] text-nimoura-text-400 w-4 text-left shrink-0 font-modam">{{ row.count }}</span>
            </div>
          </div>
        </div>

        <!-- Buyer photos -->
        <div v-if="allImages.length">
          <p class="text-sm font-medium text-nimoura-text-700 mb-2.5">تصاویر خریداران</p>
          <div class="flex gap-2 overflow-x-auto pb-1 snap-x no-scrollbar">
            <button
              v-for="(img, i) in allImages.slice(0, 12)" :key="i"
              class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-nimoura-border
                     overflow-hidden snap-start hover:opacity-85 transition-opacity"
              @click="lightboxSrc = img"
            >
              <img :src="img" alt="تصویر خریدار" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-if="loadingComments" class="space-y-3">
          <div
            v-for="n in 3" :key="n"
            class="bg-nimoura-base border border-nimoura-border rounded-xl p-4 animate-pulse"
          >
            <div class="flex gap-3 mb-3">
              <div class="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div class="flex-1 space-y-2 pt-1">
                <div class="h-3 w-28 rounded-full bg-gray-200" />
                <div class="h-2 w-16 rounded-full bg-gray-200" />
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-2.5 w-full rounded-full bg-gray-200" />
              <div class="h-2.5 w-4/5 rounded-full bg-gray-200" />
              <div class="h-2.5 w-2/3 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!comments.length"
          class="flex flex-col items-center justify-center py-14 gap-3
                 text-nimoura-text-400 bg-nimoura-base border border-nimoura-border rounded-xl"
        >
          <i class="pi pi-comments text-3xl opacity-40" />
          <p class="text-sm">هنوز نظری ثبت نشده. اولین نفر باش!</p>
        </div>

        <!-- Comment cards -->
        <div v-else class="space-y-3">
          <div
            v-for="c in comments" :key="c.id"
            class="bg-nimoura-base border border-nimoura-border rounded-xl p-4"
          >
            <!-- Header -->
            <div class="flex items-start gap-3 mb-3">
              <Avatar
                :label="avatarLetter(c.user?.first_name)"
                shape="circle"
                class="!bg-nimoura-accent/30 !text-nimoura-primary shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-medium text-nimoura-text-700 truncate">
                    {{ c.user?.first_name }} {{ c.user?.last_name }}
                  </span>
                  <span
                    v-if="c.isVerifiedBuyer"
                    class="text-[10px] bg-green-50 text-green-600 border border-green-200
                           px-2 py-0.5 rounded-full shrink-0"
                  >خریدار تأیید شده</span>
                </div>
                <div class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(c.createdAt) }}</div>
              </div>
            </div>

            <!-- Stars + subject -->
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="text-nimoura-primary text-sm leading-none">{{ starsFilled(c.rating ?? 0) }}</span>
              <span class="text-sm font-medium text-nimoura-text-700">{{ c.subject }}</span>
            </div>

            <!-- Description -->
            <p class="text-sm text-nimoura-text-600 leading-6 mb-3 whitespace-pre-line">
              {{ c.description }}
            </p>

            <!-- Attached images -->
            <div v-if="c.images?.length" class="flex gap-2 flex-wrap mb-3">
              <button
                v-for="(img, i) in c.images" :key="i"
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-nimoura-border
                       hover:opacity-85 transition-opacity shrink-0"
                @click="lightboxSrc = img"
              >
                <img :src="img" alt="تصویر نظر" class="w-full h-full object-cover" />
              </button>
            </div>

            <!-- Like / Dislike -->
            <div class="flex items-center gap-3 pt-2.5 border-t border-nimoura-border/50 flex-wrap">
              <span class="text-xs text-nimoura-text-400">آیا این نظر مفید بود؟</span>
              <div class="flex items-center gap-2">
                <button
                  class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  :class="c._liked
                    ? 'bg-green-50 text-green-600 font-medium'
                    : 'text-nimoura-text-500 hover:bg-gray-100'"
                  @click="react(c, 'like')"
                >
                  <i class="pi pi-thumbs-up text-[12px]" />
                  {{ c.likesCount }}
                </button>
                <button
                  class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  :class="c._disliked
                    ? 'bg-red-50 text-red-500 font-medium'
                    : 'text-nimoura-text-500 hover:bg-gray-100'"
                  @click="react(c, 'dislike')"
                >
                  <i class="pi pi-thumbs-down text-[12px]" />
                  {{ c.dislikesCount }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Lightbox -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="lightboxSrc"
        class="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4"
        @click="lightboxSrc = null"
      >
        <img
          :src="lightboxSrc"
          alt=""
          class="max-w-full max-h-[90dvh] rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </Transition>

    <Toast
      position="top-center"
      :pt="{ root: { style: 'font-family:Vazirmatn,sans-serif;direction:rtl' } }"
    />
  </section>
</template>

<script setup lang="ts">

// ─── Types ────────────────────────────────────
interface CommentUser { first_name: string; last_name: string }

interface Comment {
  id: number
  subject: string
  description: string
  images: string[] | null
  user: CommentUser
  isVerifiedBuyer: boolean
  likesCount: number
  dislikesCount: number
  rating?: number
  createdAt: string
  _liked?: boolean
  _disliked?: boolean
}

interface RatingRow { star: number; count: number; percent: number }

// ─── Props ────────────────────────────────────
const props = defineProps<{
  product: {
    id: number
    averageRating?: number
    ratingsCount?: number
  }
  ratingDistribution?: RatingRow[]
}>()

// ─── State ────────────────────────────────────
const toast           = useToast()
const fileInput       = ref<HTMLInputElement | null>(null)
const lightboxSrc     = ref<string | null>(null)
const loadingComments = ref(false)
const submitting = ref(false)
const comments   = ref<Comment[]>([])
const hoverRating   = ref(0)
const imagePreview  = ref<string | null>(null)   // base64 برای preview
const selectedFile  = ref<File | null>(null)      // فایل واقعی برای آپلود

const form = reactive({ rating: 0, subject: '', description: '' })
const formErrors = reactive({ rating: '', subject: '', description: '' })

// ─── Computed ─────────────────────────────────
const computedRatingDist = computed<RatingRow[]>(() =>
  props.ratingDistribution
    ?? [5, 4, 3, 2, 1].map(s => ({ star: s, count: 0, percent: 0 }))
)

const allImages = computed(() =>
  comments.value.flatMap(c => c.images ?? [])
)

// ─── Helpers ──────────────────────────────────
const avatarLetter = (name?: string) => name?.charAt(0) ?? '؟'
const starsFilled  = (n: number)     => '★'.repeat(n) + '☆'.repeat(5 - n)
const ratingLabel  = (n: number)     =>
  (['', 'خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'] as const)[n] ?? ''

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Load comments ────────────────────────────
async function loadComments() {
  loadingComments.value = true
  try {
    const res = await $fetch<{ data: { comments: Comment[] } }>(
      `/api/comments/${props.product.id}`
    )
    comments.value = (res.data?.comments ?? []).map(c => ({
      ...c, _liked: false, _disliked: false,
    }))
  } catch {
    toast.add({ severity: 'error', summary: 'خطا', detail: 'بارگذاری نظرات ناموفق بود', life: 3000 })
  } finally {
    loadingComments.value = false
  }
}

// ─── Image select (فقط preview — آپلود موقع submit) ─────────────────────
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = ev => imagePreview.value = ev.target!.result as string
  reader.readAsDataURL(file)

  input.value = ''
}

function clearImage() {
  imagePreview.value = null
  selectedFile.value = null
}

// ─── آپلود عکس هنگام submit ───────────────────────────────────────────────
async function uploadCommentImage(): Promise<string | null> {
  if (!selectedFile.value) return null

  const fd = new FormData()
  fd.append('file', selectedFile.value)

  try {
    const res = await $fetch<{ success: boolean; url: string }>(
      '/api/upload/comment-image',
      { method: 'POST', body: fd },
    )
    return res.url ?? null
  } catch {
    toast.add({ severity: 'error', summary: 'خطا', detail: 'آپلود عکس ناموفق بود', life: 3000 })
    return null
  }
}

// ─── Validation ───────────────────────────────
function validate() {
  formErrors.rating      = form.rating ? '' : 'امتیاز الزامی است'
  formErrors.subject     = form.subject.trim() ? '' : 'عنوان الزامی است'
  formErrors.description = form.description.trim().length >= 10
    ? '' : 'توضیحات باید حداقل ۱۰ کاراکتر باشد'
  return !formErrors.rating && !formErrors.subject && !formErrors.description
}

// ─── Submit ───────────────────────────────────
async function submitComment() {
  if (!validate()) return
  submitting.value = true
  try {
    // ۱. اول عکس آپلود کن (اگه داشت)
    const imageUrl = await uploadCommentImage()

    // ۲. ثبت کامنت با URL عکس
    await $fetch('/api/comments', {
      method: 'POST',
      body: {
        productId:   props.product.id,
        subject:     form.subject.trim(),
        description: form.description.trim(),
        images:      imageUrl ? [imageUrl] : [],
      },
    })
    toast.add({
      severity: 'success', summary: 'ثبت شد',
      detail: 'نظر شما پس از تأیید نمایش داده می‌شود', life: 4000,
    })
    form.rating      = 0
    form.subject     = ''
    form.description = ''
    clearImage()
  } catch (err: any) {
    toast.add({
      severity: 'error', summary: 'خطا',
      detail: err?.data?.message ?? 'مشکلی پیش آمد', life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

// ─── React ────────────────────────────────────
async function react(c: Comment, type: 'like' | 'dislike') {
  const wasLiked    = c._liked
  const wasDisliked = c._disliked

  if (type === 'like') {
    if (c._liked)    { c.likesCount--;    c._liked    = false }
    else             { c.likesCount++;    c._liked    = true
      if (c._disliked) { c.dislikesCount--; c._disliked = false } }
  } else {
    if (c._disliked) { c.dislikesCount--; c._disliked = false }
    else             { c.dislikesCount++; c._disliked  = true
      if (c._liked)    { c.likesCount--;    c._liked    = false } }
  }

  try {
    await $fetch(`/api/comments/${c.id}/${type}`, { method: 'POST' })
  } catch {
    c._liked      = wasLiked
    c._disliked   = wasDisliked
    toast.add({ severity: 'error', summary: 'خطا', detail: 'ثبت واکنش ناموفق بود', life: 2000 })
  }
}

// ─── Init ─────────────────────────────────────
onMounted(loadComments)
</script>

<style scoped>
.no-scrollbar              { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
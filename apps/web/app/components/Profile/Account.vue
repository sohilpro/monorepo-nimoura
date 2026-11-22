<template>
  <section
    class="rounded-2xl border border-nimoura-text-100 bg-white p-5 shadow-[0_8px_30px_rgba(39,33,33,0.05)] sm:p-6"
    dir="rtl"
    aria-label="اطلاعات شخصی"
  >
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="relative pr-3 text-base font-bold text-nimoura-text-900">
        <span
          class="absolute right-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-nimoura-primary"
          aria-hidden="true"
        />
        اطلاعات شخصی
      </h2>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-nimoura-primary/10 px-2.5 py-1 text-[11px] font-semibold text-nimoura-text-500"
      >
        <i class="pi pi-lock text-[10px]!" aria-hidden="true" />
        شماره موبایل قابل تغییر نیست
      </span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <!-- first_name — editable -->
      <div class="flex flex-col gap-1.5">
        <label
          for="profile-first-name"
          class="flex items-center gap-1 text-[11px] font-bold tracking-wide text-nimoura-text-500"
        >
          نام
          <span class="text-nimoura-error">*</span>
        </label>
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-xs! text-nimoura-primary/60"
            aria-hidden="true"
          >
            <i class="pi pi-user" />
          </span>
          <InputText
            id="profile-first-name"
            v-model="form.first_name"
            type="text"
            placeholder="نام"
            maxlength="80"
            :disabled="!editMode"
            class="!h-11 !w-full !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !ps-10 !pe-10 !text-sm !text-nimoura-text-800 !shadow-none placeholder:!text-nimoura-text-300 focus:!border-nimoura-primary focus:!bg-white focus:!ring-4 focus:!ring-nimoura-primary/10 disabled:!border-nimoura-text-100 disabled:!bg-nimoura-50/60 disabled:!text-nimoura-text-500"
            :class="{
              '!border-nimoura-primary !bg-white': editMode && !errors.first_name,
              '!border-nimoura-error/70': errors.first_name,
            }"
          />
          <button
            v-if="!editMode"
            type="button"
            aria-label="ویرایش نام"
            class="absolute inset-y-0 end-0 flex items-center pe-3 text-[11px]! text-nimoura-primary/50 transition-colors hover:text-nimoura-primary"
            @click="editMode = true"
          >
            <i class="pi pi-pencil" aria-hidden="true" />
          </button>
        </div>
        <span v-if="errors.first_name" class="text-[11px] text-nimoura-error">
          {{ errors.first_name }}
        </span>
      </div>

      <!-- last_name — editable -->
      <div class="flex flex-col gap-1.5">
        <label
          for="profile-last-name"
          class="flex items-center gap-1 text-[11px] font-bold tracking-wide text-nimoura-text-500"
        >
          نام خانوادگی
          <span class="text-nimoura-error">*</span>
        </label>
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-xs! text-nimoura-primary/60"
            aria-hidden="true"
          >
            <i class="pi pi-user" />
          </span>
          <InputText
            id="profile-last-name"
            v-model="form.last_name"
            type="text"
            placeholder="نام خانوادگی"
            maxlength="80"
            :disabled="!editMode"
            class="!h-11 !w-full !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !ps-10 !pe-10 !text-sm !text-nimoura-text-800 !shadow-none placeholder:!text-nimoura-text-300 focus:!border-nimoura-primary focus:!bg-white focus:!ring-4 focus:!ring-nimoura-primary/10 disabled:!border-nimoura-text-100 disabled:!bg-nimoura-50/60 disabled:!text-nimoura-text-500"
            :class="{
              '!border-nimoura-primary !bg-white': editMode && !errors.last_name,
              '!border-nimoura-error/70': errors.last_name,
            }"
          />
          <button
            v-if="!editMode"
            type="button"
            aria-label="ویرایش نام خانوادگی"
            class="absolute inset-y-0 end-0 flex items-center pe-3 text-[11px]! text-nimoura-primary/50 transition-colors hover:text-nimoura-primary"
            @click="editMode = true"
          >
            <i class="pi pi-pencil" aria-hidden="true" />
          </button>
        </div>
        <span v-if="errors.last_name" class="text-[11px] text-nimoura-error">
          {{ errors.last_name }}
        </span>
      </div>

      <!-- phone — locked -->
      <div class="flex flex-col gap-1.5">
        <label for="profile-mobile" class="text-[11px] font-bold tracking-wide text-nimoura-text-500">
          شماره موبایل
        </label>
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-xs! text-nimoura-primary/40"
            aria-hidden="true"
          >
            <i class="pi pi-phone" />
          </span>
          <InputText
            id="profile-mobile"
            :value="currentUser?.mobile || (currentUser as any)?.phone || ''"
            type="tel"
            disabled
            readonly
            class="!h-11 !w-full !cursor-default !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-50/60 !ps-10 !pe-10 !text-sm !text-nimoura-text-500 !shadow-none"
          />
          <span
            class="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs! text-nimoura-text-300"
            aria-hidden="true"
          >
            <i class="pi pi-lock" />
          </span>
        </div>
        <span class="text-[10px] text-nimoura-text-400">
          برای تغییر شماره با پشتیبانی تماس بگیر
        </span>
      </div>

      <!-- birthDate — editable -->
      <div class="flex flex-col gap-1.5 sm:col-span-2">
        <label
          for="profile-birth-date"
          class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-nimoura-text-500"
        >
          تاریخ تولد
          <span class="font-normal text-nimoura-text-400">(اختیاری)</span>
        </label>
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-xs! text-nimoura-primary/60"
            aria-hidden="true"
          >
            <i class="pi pi-calendar" />
          </span>
          <InputText
            id="profile-birth-date"
            v-model="form.birthDate"
            type="text"
            placeholder="مثلاً ۱۳۷۵/۰۵/۱۲"
            maxlength="10"
            inputmode="numeric"
            :disabled="!editMode"
            class="!h-11 !w-full !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !ps-10 !pe-10 !font-modam !text-sm !text-nimoura-text-800 !shadow-none placeholder:!font-vazir placeholder:!text-nimoura-text-300 focus:!border-nimoura-primary focus:!bg-white focus:!ring-4 focus:!ring-nimoura-primary/10 disabled:!border-nimoura-text-100 disabled:!bg-nimoura-50/60 disabled:!text-nimoura-text-500"
            :class="{ '!border-nimoura-primary !bg-white': editMode }"
            @input="maskDate"
          />
          <button
            v-if="!editMode"
            type="button"
            aria-label="ویرایش تاریخ تولد"
            class="absolute inset-y-0 end-0 flex items-center pe-3 text-[11px]! text-nimoura-primary/50 transition-colors hover:text-nimoura-primary"
            @click="editMode = true"
          >
            <i class="pi pi-pencil" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div
      class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-nimoura-text-100 pt-5"
    >
      <p v-if="savedAt" class="flex items-center gap-1.5 text-xs text-nimoura-text-400">
        <i class="pi pi-check-circle text-xs! text-nimoura-success" aria-hidden="true" />
        آخرین ذخیره: {{ savedAt }}
      </p>
      <span v-else />

      <div class="flex items-center gap-2">
        <Button
          v-if="!editMode"
          label="ویرایش"
          icon="pi pi-pencil"
          outlined
          class="!rounded-xl !border-nimoura-primary/40 !bg-transparent !px-5 !py-2.5 !text-sm !font-semibold !text-nimoura-primary hover:!border-nimoura-primary hover:!bg-nimoura-primary/5"
          @click="startEdit"
        />
        <template v-else>
          <Button
            label="انصراف"
            text
            class="!rounded-xl !bg-nimoura-primary/5 !px-5 !py-2.5 !text-sm !font-medium !text-nimoura-text-500 hover:!bg-nimoura-primary/10"
            :disabled="submitting"
            @click="cancelEdit"
          />
          <Button
            label="ذخیره"
            :icon="submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
            class="!rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.25)] hover:!bg-nimoura-600 disabled:!opacity-60"
            :disabled="submitting"
            @click="save"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UserProfile } from '@nimoura/shared-types'

const auth = useAuth()

const props = defineProps<{
  user?: UserProfile | null
}>()

const emit = defineEmits<{
  (e: 'updated', user: any): void
}>()

// ─── State ────────────────────────────────────
const toast      = useAppToast()
const editMode   = ref(false)
const submitting = ref(false)
const savedAt    = ref<string>('')

const currentUser = computed(() => props.user || auth.value)

const form = reactive({
  first_name: currentUser.value?.first_name ?? '',
  last_name:  currentUser.value?.last_name  ?? '',
  birthDate:  (currentUser.value as any)?.birthDate ?? '',
})

// Watch currentUser so if it loads asynchronously, form state initializes correctly
watch(
  () => currentUser.value,
  (u) => {
    if (u && !editMode.value) {
      form.first_name = u.first_name ?? ''
      form.last_name  = u.last_name  ?? ''
      form.birthDate  = (u as any)?.birthDate ?? ''
    }
  },
  { immediate: true, deep: true }
)

const errors = reactive({
  first_name: '',
  last_name:  '',
})

// ─── Handlers ────────────────────────────────
function startEdit() {
  form.first_name = currentUser.value?.first_name ?? ''
  form.last_name  = currentUser.value?.last_name  ?? ''
  form.birthDate  = (currentUser.value as any)?.birthDate ?? ''

  errors.first_name = ''
  errors.last_name  = ''

  editMode.value = true
}

function cancelEdit() {
  form.first_name = currentUser.value?.first_name ?? ''
  form.last_name  = currentUser.value?.last_name  ?? ''
  form.birthDate  = (currentUser.value as any)?.birthDate ?? ''

  errors.first_name = ''
  errors.last_name  = ''

  editMode.value = false
}

function validate() {
  errors.first_name = ''
  errors.last_name  = ''

  if (!form.first_name.trim()) {
    errors.first_name = 'نام الزامی است'
    return false
  }

  if (!form.last_name.trim()) {
    errors.last_name = 'نام خانوادگی الزامی است'
    return false
  }

  if (form.first_name.trim().length < 2) {
    errors.first_name = 'نام باید حداقل ۲ کاراکتر باشد'
    return false
  }

  if (form.last_name.trim().length < 2) {
    errors.last_name = 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'
    return false
  }

  return true
}

async function updateProfile(payload: {
  first_name: string
  last_name: string
  birthDate?: string
}) {
  const response = await $fetch<any>('/api/user/profile', {
    method: 'PUT',
    body: payload,
  })
  return response?.data?.user || response?.data || response
}

async function save() {
  if (!validate()) return

  submitting.value = true

  try {
    const updated = await updateProfile({
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      birthDate:  form.birthDate.trim() || undefined,
    })

    if (auth.value && updated) {
      auth.value = {
        ...auth.value,
        ...updated,
        first_name: updated.first_name ?? form.first_name.trim(),
        last_name:  updated.last_name  ?? form.last_name.trim(),
      }
    }

    emit('updated', updated)

    savedAt.value  = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    editMode.value = false

    toast.add({
      severity: 'success',
      summary: 'ذخیره شد',
      detail: 'اطلاعات با موفقیت بروز شد',
      life: 3000
    })

  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: err?.data?.message || err?.statusMessage || 'مشکلی پیش آمد، دوباره تلاش کن',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

// ── date masking ۱۳۷۵/۰۵/۱۲ ─────────────────
function maskDate(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/[^\d۰-۹]/g, '')

  if (v.length > 4)  v = v.slice(0, 4) + '/' + v.slice(4)
  if (v.length > 7)  v = v.slice(0, 7) + '/' + v.slice(7)
  if (v.length > 10) v = v.slice(0, 10)

  form.birthDate = v
}
</script>

<template>
  <div class="panel" dir="rtl">
    <div class="flex items-center justify-between mb-6">
      <h2 class="panel-title">اطلاعات شخصی</h2>
      <span class="lock-notice">
        <i class="pi pi-lock text-[11px]" />
        شماره موبایل قابل تغییر نیست
      </span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">

      <!-- first_name — editable -->
      <div class="field-group">
        <label class="field-label">
          نام و نام خانوادگی
          <span class="required">*</span>
        </label>
        <div class="field-wrap" :class="{ 'field-wrap--active': editMode, 'field-wrap--error': errors.first_name }">
          <i class="pi pi-user field-icon" />
          <input
            v-model="form.first_name"
            type="text"
            placeholder="نام کامل"
            class="field-input"
            :disabled="!editMode"
            maxlength="80"
          />
          <i v-if="!editMode" class="pi pi-pencil edit-hint" @click="editMode = true" />
        </div>
        <span v-if="errors.first_name" class="field-error">{{ errors.first_name }}</span>
      </div>

      <!-- last_name — editable -->
      <div class="field-group">
        <label class="field-label">
          نام و نام خانوادگی
          <span class="required">*</span>
        </label>
        <div class="field-wrap" :class="{ 'field-wrap--active': editMode, 'field-wrap--error': errors.last_name }">
          <i class="pi pi-user field-icon" />
          <input
            v-model="form.last_name"
            type="text"
            placeholder="نام کامل"
            class="field-input"
            :disabled="!editMode"
            maxlength="80"
          />
          <i v-if="!editMode" class="pi pi-pencil edit-hint" @click="editMode = true" />
        </div>
        <span v-if="errors.last_name" class="field-error">{{ errors.last_name }}</span>
      </div>

      <!-- phone — locked -->
      <div class="field-group">
        <label class="field-label">شماره موبایل</label>
        <div class="field-wrap field-wrap--locked">
          <i class="pi pi-phone field-icon" style="opacity:.4" />
          <input
            :value="props.user.mobile"
            type="tel"
            class="field-input"
            disabled
            readonly
          />
          <i class="pi pi-lock text-[12px]" style="color:var(--nt-300); flex-shrink:0" />
        </div>
        <span class="field-hint">برای تغییر شماره با پشتیبانی تماس بگیر</span>
      </div>

      <!-- birthDate — editable -->
      <div class="field-group sm:col-span-2">
        <label class="field-label">
          تاریخ تولد
          <span class="optional">(اختیاری)</span>
        </label>
        <div class="field-wrap" :class="{ 'field-wrap--active': editMode }">
          <i class="pi pi-calendar field-icon" />
          <input
            v-model="form.birthDate"
            type="text"
            placeholder="مثلاً ۱۳۷۵/۰۵/۱۲"
            class="field-input"
            :disabled="!editMode"
            maxlength="10"
            inputmode="numeric"
            @input="maskDate"
          />
          <i v-if="!editMode" class="pi pi-pencil edit-hint" @click="editMode = true" />
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div class="mt-6 flex items-center justify-between border-t pt-5"
         style="border-color:rgba(183,110,121,0.1)">

      <p v-if="savedAt" class="flex items-center gap-1.5 text-xs font-vazir" style="color:var(--nt-400)">
        <i class="pi pi-check-circle text-xs" style="color:#059669" />
        آخرین ذخیره: {{ savedAt }}
      </p>
      <span v-else />

      <div class="flex gap-2">
        <template v-if="!editMode">
          <button type="button" class="btn-outline" @click="startEdit">
            <i class="pi pi-pencil text-xs" />
            ویرایش
          </button>
        </template>
        <template v-else>
          <button type="button" class="btn-ghost" :disabled="submitting" @click="cancelEdit">
            انصراف
          </button>
          <button type="button" class="btn-primary" :disabled="submitting" @click="save">
            <i v-if="submitting" class="pi pi-spin pi-spinner text-xs" />
            <i v-else class="pi pi-check text-xs" />
            ذخیره
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ─── State ────────────────────────────────────
const toast      = useAppToast()
const editMode   = ref(false)
const submitting = ref(false)
const savedAt    = ref<string>('')

const form = reactive({
  first_name: props.user.first_name ?? '',
  last_name:  props.user.last_name  ?? '',
  birthDate:  props.user.birthDate ?? '',
})

const errors = reactive({
  first_name: '',
  last_name:  '',
})

// ─── Handlers ────────────────────────────────
function startEdit() {
  form.first_name = props.user.first_name ?? ''
  form.last_name  = props.user.last_name  ?? ''
  form.birthDate  = props.user.birthDate ?? ''

  errors.first_name = ''
  errors.last_name  = ''

  editMode.value = true
}

function cancelEdit() {
  form.first_name = props.user.first_name ?? ''
  form.last_name  = props.user.last_name  ?? ''
  form.birthDate  = props.user.birthDate ?? ''

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

async function save() {
  if (!validate()) return

  submitting.value = true

  try {
    const updated = await updateProfile({
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      birthDate:  form.birthDate.trim() || undefined,
    })

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

  } catch {
    toast.add({
      severity: 'error',
      summary: 'خطا',
      detail: 'مشکلی پیش آمد، دوباره تلاش کن',
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

<style scoped>
.panel {
  --primary: #b76e79;
  --base:    #fff8f4;
  --nt-300: #b5adad; --nt-400: #9b9191;
  --nt-500: #807676; --nt-800: #3a3131;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(183,110,121,0.08);
  box-shadow: 0 2px 20px rgba(183,110,121,0.05);
  font-family: 'Vazirmatn', sans-serif;
}

/* title */
.panel-title {
  font-size: .95rem; font-weight: 700; color: var(--nt-800);
  position: relative; padding-right: 12px;
}
.panel-title::before {
  content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 16px; background: var(--primary); border-radius: 2px;
}

.lock-notice {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
  background: rgba(183,110,121,0.07); color: var(--nt-400);
}

/* field */
.field-group { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 11px; font-weight: 700; color: var(--nt-500);
  letter-spacing: .02em; display: flex; align-items: center; gap: 4px;
}
.required { color: #dc2626; }
.optional  { color: var(--nt-400); font-weight: 400; }

.field-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px; border-radius: 14px;
  border: 1.5px solid rgba(183,110,121,0.14);
  background: var(--base);
  transition: border-color .2s, box-shadow .2s;
}
.field-wrap--active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(183,110,121,0.1);
  background: #fff;
}
.field-wrap--locked {
  background: rgba(183,110,121,0.03);
  border-color: rgba(183,110,121,0.08);
  cursor: not-allowed;
}
.field-wrap--error { border-color: rgba(220,38,38,0.45) !important; }

.field-icon { font-size: 13px; color: var(--primary); opacity: .6; flex-shrink: 0; }

.field-input {
  flex: 1; background: transparent; border: none; outline: none;
  font-size: .875rem; font-family: 'Modam', sans-serif;
  color: var(--nt-800); direction: rtl;
}
.field-input:disabled { color: var(--nt-500); cursor: default; }
.field-input::placeholder { color: var(--nt-300); }

.edit-hint {
  font-size: 11px; color: var(--primary); opacity: .45;
  cursor: pointer; flex-shrink: 0;
  transition: opacity .15s;
}
.edit-hint:hover { opacity: .85; }

.field-error { font-size: 11px; color: #dc2626; }
.field-hint  { font-size: 10px; color: var(--nt-400); }

/* buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #b76e79, #9a5a64);
  color: #fff; font-size: .875rem; font-family: 'Vazirmatn', sans-serif;
  font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 14px rgba(183,110,121,0.3);
  transition: opacity .2s, transform .15s;
}
.btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.btn-primary:not(:disabled):hover { opacity: .9; transform: translateY(-1px); }

.btn-outline {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 14px;
  border: 1.5px solid rgba(183,110,121,0.28);
  background: transparent; color: var(--primary);
  font-size: .875rem; font-family: 'Vazirmatn', sans-serif;
  font-weight: 600; cursor: pointer; transition: all .2s;
}
.btn-outline:hover { background: rgba(183,110,121,0.06); }

.btn-ghost {
  display: inline-flex; align-items: center;
  padding: 8px 18px; border-radius: 14px; border: none;
  background: rgba(183,110,121,0.07); color: var(--nt-500);
  font-size: .875rem; font-family: 'Vazirmatn', sans-serif;
  cursor: pointer; transition: background .2s;
}
.btn-ghost:disabled { opacity: .5; cursor: not-allowed; }
.btn-ghost:not(:disabled):hover { background: rgba(183,110,121,0.13); }
</style>
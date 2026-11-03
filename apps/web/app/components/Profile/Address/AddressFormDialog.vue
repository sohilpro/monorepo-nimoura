<script setup lang="ts">
import iranData from '~/assets/data/iran.provinces-cities.fa.json'

interface ProvinceData { province: string; cities: string[] }
const provinces = iranData as ProvinceData[]

const props = withDefaults(
  defineProps<{
    visible: boolean
    address?: Address | null // پر باشه = حالت ویرایش
  }>(),
  { address: null }
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'saved', address: Address, mode: 'create' | 'edit'): void
}>()

const { createAddress, updateAddress } = useAddresses()
const toast = useAppToast()

const dialogOpen = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const isEdit = computed(() => !!props.address)
const submitting = ref(false)

const emptyForm = (): AddressForm => ({ title: '', postal_code: '', state: '', city: '', address: '' })
const form = reactive<AddressForm>(emptyForm())
const errors = reactive<Partial<Record<keyof AddressForm, string>>>({})

const provinceSearch = ref('')
const citySearch = ref('')
const provinceOpen = ref(false)
const cityOpen = ref(false)
const provinceWrapRef = ref<HTMLElement | null>(null)
const cityWrapRef = ref<HTMLElement | null>(null)

const filteredProvinces = computed(() =>
  provinces.filter((p) => !provinceSearch.value || p.province.includes(provinceSearch.value))
)

const availableCities = computed<string[]>(() => {
  if (!form.state) return []
  return provinces.find((p) => p.province === form.state)?.cities ?? []
})

const filteredCities = computed(() =>
  availableCities.value.filter((c) => !citySearch.value || c.includes(citySearch.value))
)

function openProvinceDropdown() { provinceOpen.value = true; cityOpen.value = false }
function openCityDropdown() { cityOpen.value = true; provinceOpen.value = false }

function selectProvince(province: string) {
  form.state = province
  form.city = ''
  provinceSearch.value = ''
  citySearch.value = ''
  provinceOpen.value = false
}

function clearProvince() {
  form.state = ''
  form.city = ''
  provinceSearch.value = ''
  citySearch.value = ''
}

function selectCity(city: string) {
  form.city = city
  citySearch.value = ''
  cityOpen.value = false
}

function closeDropdownsOnOutside(e: MouseEvent) {
  if (provinceWrapRef.value && !provinceWrapRef.value.contains(e.target as Node)) {
    provinceOpen.value = false
    if (!form.state) provinceSearch.value = ''
  }
  if (cityWrapRef.value && !cityWrapRef.value.contains(e.target as Node)) {
    cityOpen.value = false
    if (!form.city) citySearch.value = ''
  }
}

function validate(): boolean {
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))
  let ok = true
  if (!form.title.trim()) { errors.title = 'عنوان الزامی است'; ok = false }
  if (!form.state) { errors.state = 'استان الزامی است'; ok = false }
  if (!form.city) { errors.city = 'شهر الزامی است'; ok = false }
  if (!/^\d{10}$/.test(form.postal_code.trim())) { errors.postal_code = 'کد پستی باید ۱۰ رقم عددی باشد'; ok = false }
  if (!form.address.trim()) { errors.address = 'آدرس کامل الزامی است'; ok = false }
  return ok
}

function resetForm() {
  Object.assign(form, emptyForm())
  Object.assign(errors, { title: '', state: '', city: '', postal_code: '', address: '' })
  provinceSearch.value = ''
  citySearch.value = ''
}

// هر بار دیالوگ باز می‌شه یا آدرس ویرایش عوض می‌شه، فرم رو با داده‌ی درست پر کن
watch(
  () => [props.visible, props.address] as const,
  ([visible, address]) => {
    if (!visible) return
    if (address) {
      Object.assign(form, {
        title: address.title,
        postal_code: address.postal_code,
        state: address.state,
        city: address.city,
        address: address.address,
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

async function submitForm() {
  if (!validate()) return
  submitting.value = true
  try {
    if (isEdit.value && props.address) {
      const updated = await updateAddress(props.address.id, { ...form })
      toast.add({ severity: 'success', summary: 'ذخیره شد', detail: 'آدرس ویرایش شد', life: 3000 })
      emit('saved', updated, 'edit')
    } else {
      const created = await createAddress({ ...form })
      toast.add({ severity: 'success', summary: 'افزوده شد', detail: 'آدرس جدید ثبت شد', life: 3000 })
      emit('saved', created, 'create')
    }
    dialogOpen.value = false
  } catch {
    toast.add({ severity: 'error', summary: 'خطا', detail: 'مشکلی پیش آمد، دوباره تلاش کن', life: 3000 })
  } finally {
    submitting.value = false
  }
}

const inputPT = {
  root: { style: 'width:100%;background:transparent;border:none;box-shadow:none;padding:0;font-family:Vazirmatn,sans-serif;font-size:.875rem;color:#3a3131;direction:rtl' },
}
const textareaPT = {
  root: { style: 'width:100%;background:transparent;border:none;box-shadow:none;padding:0;font-family:Vazirmatn,sans-serif;font-size:.875rem;color:#3a3131;direction:rtl;resize:none' },
}

onMounted(() => document.addEventListener('click', closeDropdownsOnOutside))
onUnmounted(() => document.removeEventListener('click', closeDropdownsOnOutside))
</script>

<template>
  <Dialog
    v-model:visible="dialogOpen"
    :header="isEdit ? 'ویرایش آدرس' : 'افزودن آدرس جدید'"
    modal :closable="true" :draggable="false"
    :style="{ width: 'min(560px, 96vw)' }"
    :pt="{
      root:        { style: 'border-radius:24px;overflow:hidden;font-family:Vazirmatn,sans-serif;direction:rtl' },
      header:      { style: 'background:#fff8f4;padding:20px 24px 16px;border-bottom:1px solid rgba(183,110,121,0.1)' },
      title:       { style: 'font-family:Vazirmatn,sans-serif;font-weight:700;font-size:.95rem;color:#3a3131' },
      content:     { style: 'padding:24px;background:#fff' },
      footer:      { style: 'padding:16px 24px 20px;background:#fff;border-top:1px solid rgba(183,110,121,0.08);gap:8px' },
      closeButton: { style: 'color:#9b9191' },
    }"
  >
    <div class="address-root space-y-4">
      <div class="field-group">
        <label class="field-label">عنوان آدرس <span class="req">*</span></label>
        <div class="field-wrap" :class="{ 'field-wrap--error': errors.title }">
          <i class="pi pi-tag text-sm field-icon" />
          <InputText v-model="form.title" placeholder="مثلاً: منزل، محل کار"
            class="field-input-prime" :pt="inputPT" maxlength="100" />
        </div>
        <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="field-group">
          <label class="field-label">استان <span class="req">*</span></label>
          <div class="field-wrap field-wrap--select" :class="{ 'field-wrap--error': errors.state }">
            <i class="pi pi-globe text-sm field-icon" />
            <div class="flex-1 relative" ref="provinceWrapRef">
              <input v-model="provinceSearch" type="text" class="select-input"
                :placeholder="form.state || 'جستجوی استان...'"
                :style="form.state && !provinceOpen ? 'color:#3a3131' : ''"
                @focus="openProvinceDropdown" @input="openProvinceDropdown" />
              <div v-if="provinceOpen" class="dropdown-list">
                <div v-if="!filteredProvinces.length" class="dropdown-empty">نتیجه‌ای یافت نشد</div>
                <button v-for="p in filteredProvinces" :key="p.province" type="button"
                  class="dropdown-item" :class="{ 'dropdown-item--active': form.state === p.province }"
                  @mousedown.prevent="selectProvince(p.province)">
                  {{ p.province }}
                </button>
              </div>
            </div>
            <i v-if="form.state" class="pi pi-times text-xs cursor-pointer" style="color:var(--nt-400)" @click="clearProvince" />
            <i v-else class="pi pi-angle-down text-xs" style="color:var(--nt-400)" />
          </div>
          <span v-if="errors.state" class="field-error">{{ errors.state }}</span>
        </div>

        <div class="field-group">
          <label class="field-label">شهر <span class="req">*</span></label>
          <div class="field-wrap field-wrap--select" :class="{ 'field-wrap--error': errors.city, 'field-wrap--disabled': !form.state }">
            <i class="pi pi-map-marker text-sm field-icon" :style="!form.state ? 'opacity:.3' : ''" />
            <div class="flex-1 relative" ref="cityWrapRef">
              <input v-model="citySearch" type="text" class="select-input"
                :placeholder="form.state ? (form.city || 'جستجوی شهر...') : 'ابتدا استان انتخاب کن'"
                :disabled="!form.state"
                :style="form.city && !cityOpen ? 'color:#3a3131' : ''"
                @focus="openCityDropdown" @input="openCityDropdown" />
              <div v-if="cityOpen && form.state" class="dropdown-list">
                <div v-if="!filteredCities.length" class="dropdown-empty">نتیجه‌ای یافت نشد</div>
                <button v-for="c in filteredCities" :key="c" type="button"
                  class="dropdown-item" :class="{ 'dropdown-item--active': form.city === c }"
                  @mousedown.prevent="selectCity(c)">
                  {{ c }}
                </button>
              </div>
            </div>
            <i v-if="form.city" class="pi pi-times text-xs cursor-pointer" style="color:var(--nt-400)" @click="form.city = ''; citySearch = ''" />
            <i v-else class="pi pi-angle-down text-xs" style="color:var(--nt-400)" />
          </div>
          <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label">کد پستی <span class="req">*</span></label>
        <div class="field-wrap" :class="{ 'field-wrap--error': errors.postal_code }">
          <i class="pi pi-inbox text-sm field-icon" />
          <InputText v-model="form.postal_code" placeholder="۱۰ رقم بدون خط تیره"
            class="field-input-prime" :pt="inputPT" maxlength="10" inputmode="numeric" />
        </div>
        <span v-if="errors.postal_code" class="field-error">{{ errors.postal_code }}</span>
      </div>

      <div class="field-group">
        <label class="field-label">آدرس کامل <span class="req">*</span></label>
        <div class="field-wrap field-wrap--textarea" :class="{ 'field-wrap--error': errors.address }">
          <Textarea v-model="form.address" placeholder="خیابان، کوچه، پلاک، واحد..."
            :rows="3" :auto-resize="false"
            class="field-input-prime !border-0 !shadow-none !bg-transparent resize-none"
            :pt="textareaPT" />
        </div>
        <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
      </div>
    </div>

    <template #footer>
      <Button label="انصراف" text class="!font-vazir !text-sm !rounded-xl !px-5"
        style="color:var(--nt-400)" :disabled="submitting" @click="dialogOpen = false" />
      <Button :label="isEdit ? 'ذخیره تغییرات' : 'افزودن آدرس'"
        :icon="submitting ? 'pi pi-spin pi-spinner' : (isEdit ? 'pi pi-check' : 'pi pi-plus')"
        class="!font-vazir !text-sm !rounded-xl !px-5"
        style="background:linear-gradient(135deg,#b76e79,#9a5a64);border:none;box-shadow:0 4px 12px rgba(183,110,121,0.25)"
        :disabled="submitting" @click="submitForm" />
    </template>
  </Dialog>
</template>

<style scoped>
.address-root { --primary:#b76e79; --base:#fff8f4; --nt-400:#9b9191; --nt-500:#807676; font-family:'Vazirmatn',sans-serif; }
.field-group { display:flex; flex-direction:column; gap:5px; }
.field-label { font-size:11px; font-weight:700; color:var(--nt-500); }
.req { color:#dc2626; }
.field-wrap { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:14px; border:1.5px solid rgba(183,110,121,0.15); background:var(--base); transition:border-color .2s, box-shadow .2s; }
.field-wrap:focus-within { border-color:var(--primary); box-shadow:0 0 0 3px rgba(183,110,121,0.1); }
.field-wrap--textarea { align-items:flex-start; }
.field-wrap--error { border-color:rgba(220,38,38,0.45) !important; }
.field-wrap--disabled { opacity:.55; pointer-events:none; }
.field-wrap--select { cursor:pointer; }
.field-icon { font-size:13px; color:var(--primary); opacity:.6; flex-shrink:0; }
.field-error { font-size:11px; color:#dc2626; font-family:'Vazirmatn',sans-serif; }
.select-input { width:100%; background:transparent; border:none; outline:none; font-size:.875rem; font-family:'Vazirmatn',sans-serif; color:var(--nt-500); direction:rtl; cursor:pointer; }
.select-input:disabled { cursor:default; }
.select-input::placeholder { color:var(--nt-400); }
.dropdown-list { position:absolute; top:calc(100% + 6px); right:0; left:0; z-index:100; background:#fff; border-radius:14px; border:1px solid rgba(183,110,121,0.15); box-shadow:0 8px 32px rgba(183,110,121,0.12); max-height:220px; overflow-y:auto; }
.dropdown-item { display:block; width:100%; padding:9px 14px; text-align:right; font-size:.83rem; font-family:'Vazirmatn',sans-serif; color:#665d5d; border:none; background:transparent; cursor:pointer; transition:background .12s; }
.dropdown-item:hover { background:rgba(183,110,121,0.06); color:var(--primary); }
.dropdown-item--active { background:rgba(183,110,121,0.1); color:var(--primary); font-weight:700; }
.dropdown-empty { padding:12px 14px; font-size:.83rem; font-family:'Vazirmatn',sans-serif; color:var(--nt-400); text-align:center; }
</style>
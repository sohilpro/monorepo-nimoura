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

const availableCities = computed<string[]>(() => {
  if (!form.state) return []
  return provinces.find((p) => p.province === form.state)?.cities ?? []
})

// انتخاب استان، شهر انتخاب‌شده را نامعتبر میکند
function onProvinceChange() {
  form.city = ''
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

const inputClass =
  '!h-11 !w-full !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !px-3.5 !text-sm !text-nimoura-text-800 !shadow-none placeholder:!text-nimoura-text-300 focus:!border-nimoura-primary focus:!bg-white focus:!ring-4 focus:!ring-nimoura-primary/10'

const selectPT = {
  root: {
    class:
      '!min-h-11 !w-full !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !shadow-none !transition-colors focus-within:!border-nimoura-primary focus-within:!bg-white focus-within:!ring-4 focus-within:!ring-nimoura-primary/10',
  },
  label: { class: '!px-3.5 !font-vazir !text-sm !text-nimoura-text-800' },
  dropdown: { class: '!text-nimoura-primary/70' },
  clearIcon: { class: '!text-nimoura-text-400 hover:!text-nimoura-primary' },
  header: { class: '!p-2 !pb-1.5' },
  overlay: {
    class:
      '!rounded-xl !border !border-nimoura-text-100 !bg-white !shadow-[0_12px_36px_rgba(39,33,33,0.12)]',
  },
  list: { class: '!max-h-60 !space-y-0.5 !overflow-y-auto !p-1.5' },
  option: {
    class:
      '!flex !min-h-9 !items-center !rounded-lg !px-3 !py-2 !font-vazir !text-sm !text-nimoura-text-700 data-[p-focused=true]:!bg-nimoura-primary/10 data-[p-focused=true]:!text-nimoura-primary data-[p-selected=true]:!bg-nimoura-primary/10 data-[p-selected=true]:!text-nimoura-primary',
  },
  emptyMessage: { class: '!px-3 !py-3 !text-center !font-vazir !text-sm !text-nimoura-text-400' },
  pcFilter: {
    root: {
      class:
        '!w-full !rounded-lg !border-nimoura-text-100 !bg-nimoura-base !px-3 !py-2 !font-vazir !text-sm !text-nimoura-text-800 focus:!border-nimoura-primary',
    },
  },
}
</script>

<template>
  <Dialog
    v-model:visible="dialogOpen"
    :header="isEdit ? 'ویرایش آدرس' : 'افزودن آدرس جدید'"
    modal
    :closable="true"
    :draggable="false"
    :pt="{
      root: {
        class:
          '!w-[min(560px,96vw)] !overflow-hidden !rounded-2xl !border !border-nimoura-text-100 !bg-white !font-vazir',
      },
      header: {
        class: '!border-b !border-nimoura-text-100 !bg-nimoura-base/70 !px-6 !pb-4 !pt-5',
      },
      title: { class: '!text-sm !font-bold !text-nimoura-text-900' },
      content: { class: '!bg-white !px-6 !py-5' },
      footer: {
        class: '!gap-2 !border-t !border-nimoura-text-100 !bg-white !px-6 !pb-5 !pt-4',
      },
      closeButton: { class: '!text-nimoura-text-400' },
    }"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-1.5">
        <label for="address-title" class="text-[11px] font-bold text-nimoura-text-500">
          عنوان آدرس <span class="text-nimoura-error">*</span>
        </label>
        <InputText
          id="address-title"
          v-model="form.title"
          placeholder="مثلاً: منزل، محل کار"
          maxlength="100"
          :class="[inputClass, { '!border-nimoura-error/70': errors.title }]"
        />
        <span v-if="errors.title" class="text-[11px] text-nimoura-error">{{ errors.title }}</span>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label for="address-province" class="text-[11px] font-bold text-nimoura-text-500">
            استان <span class="text-nimoura-error">*</span>
          </label>
          <Select
            v-model="form.state"
            input-id="address-province"
            :options="provinces"
            option-label="province"
            option-value="province"
            filter
            filter-placeholder="جستجوی استان..."
            placeholder="انتخاب استان"
            :show-clear="!!form.state"
            :pt="selectPT"
            :class="{ '!border-nimoura-error/70': errors.state }"
            aria-label="استان"
            @update:model-value="onProvinceChange"
          />
          <span v-if="errors.state" class="text-[11px] text-nimoura-error">{{ errors.state }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="address-city" class="text-[11px] font-bold text-nimoura-text-500">
            شهر <span class="text-nimoura-error">*</span>
          </label>
          <Select
            v-model="form.city"
            input-id="address-city"
            :options="availableCities"
            filter
            filter-placeholder="جستجوی شهر..."
            :placeholder="form.state ? 'انتخاب شهر' : 'ابتدا استان انتخاب کن'"
            :show-clear="!!form.city"
            :disabled="!form.state"
            :pt="selectPT"
            :class="{
              '!border-nimoura-error/70': errors.city,
              '!opacity-60': !form.state,
            }"
            aria-label="شهر"
          />
          <span v-if="errors.city" class="text-[11px] text-nimoura-error">{{ errors.city }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="address-postal-code" class="text-[11px] font-bold text-nimoura-text-500">
          کد پستی <span class="text-nimoura-error">*</span>
        </label>
        <InputText
          id="address-postal-code"
          v-model="form.postal_code"
          placeholder="۱۰ رقم بدون خط تیره"
          maxlength="10"
          inputmode="numeric"
          :class="[inputClass, { '!border-nimoura-error/70': errors.postal_code }]"
        />
        <span v-if="errors.postal_code" class="text-[11px] text-nimoura-error">
          {{ errors.postal_code }}
        </span>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="address-detail" class="text-[11px] font-bold text-nimoura-text-500">
          آدرس کامل <span class="text-nimoura-error">*</span>
        </label>
        <Textarea
          id="address-detail"
          v-model="form.address"
          placeholder="خیابان، کوچه، پلاک، واحد..."
          :rows="3"
          :auto-resize="false"
          class="!w-full !resize-none !rounded-xl !border !border-nimoura-text-100 !bg-nimoura-base/60 !px-3.5 !py-2.5 !text-sm !text-nimoura-text-800 !shadow-none placeholder:!text-nimoura-text-300 focus:!border-nimoura-primary focus:!bg-white focus:!ring-4 focus:!ring-nimoura-primary/10"
          :class="{ '!border-nimoura-error/70': errors.address }"
        />
        <span v-if="errors.address" class="text-[11px] text-nimoura-error">{{ errors.address }}</span>
      </div>
    </div>

    <template #footer>
      <Button
        label="انصراف"
        text
        class="!rounded-xl !bg-transparent !px-5 !py-2.5 !text-sm !font-medium !text-nimoura-text-500 hover:!bg-nimoura-primary/5"
        :disabled="submitting"
        @click="dialogOpen = false"
      />
      <Button
        :label="isEdit ? 'ذخیره تغییرات' : 'افزودن آدرس'"
        :icon="submitting ? 'pi pi-spin pi-spinner' : (isEdit ? 'pi pi-check' : 'pi pi-plus')"
        class="!rounded-xl !border-nimoura-primary !bg-nimoura-primary !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-[0_6px_18px_rgba(183,110,121,0.25)] hover:!bg-nimoura-600 disabled:!opacity-60"
        :disabled="submitting"
        @click="submitForm"
      />
    </template>
  </Dialog>
</template>

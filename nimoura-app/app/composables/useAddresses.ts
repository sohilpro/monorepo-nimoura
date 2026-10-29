export interface Address {
  id: number
  title: string
  postal_code: string
  state: string
  city: string
  address: string
  userId: number
}

export type AddressForm = Omit<Address, 'id' | 'userId'>

const api = {
  getAll: () => $fetch<{ data: { addresses: Address[] } }>('/api/addresses/my'),
  create: (dto: AddressForm) =>
    $fetch<{ data: { message: string; address: Address } }>('/api/addresses', {
      method: 'POST',
      body: dto,
    }),
  update: (id: number, dto: Partial<AddressForm>) =>
    $fetch<{ data: { message: string; address: Address } }>(`/api/addresses/${id}`, {
      method: 'PATCH',
      body: dto,
    }),
  remove: (id: number) =>
    $fetch<{ data: { message: string } }>(`/api/addresses/${id}`, { method: 'DELETE' }),
}

// استیت در سطح ماژول تعریف شده تا صفحه‌ی پروفایل و چک‌اوت
// به یک لیست واحد و سینک‌شده از آدرس‌ها دسترسی داشته باشن (بدون رفت‌وآمد اضافه به سرور)
const addresses = ref<Address[]>([])
const loading = ref(false)
const loaded = ref(false)

export function useAddresses() {
  async function fetchAddresses(force = false) {
    if (loaded.value && !force) return addresses.value
    loading.value = true
    try {
      const res = await api.getAll()
      addresses.value = res.data?.addresses ?? []
      loaded.value = true
    } finally {
      loading.value = false
    }
    return addresses.value
  }

  async function createAddress(dto: AddressForm) {
    const res = await api.create(dto)
    const created = res.data.address
    addresses.value.unshift(created)
    return created
  }

  async function updateAddress(id: number, dto: Partial<AddressForm>) {
    const res = await api.update(id, dto)
    const updated = res.data.address
    const idx = addresses.value.findIndex((a) => a.id === id)
    if (idx !== -1) addresses.value[idx] = updated
    return updated
  }

  async function removeAddress(id: number) {
    await api.remove(id)
    addresses.value = addresses.value.filter((a) => a.id !== id)
  }

  return { addresses, loading, fetchAddresses, createAddress, updateAddress, removeAddress }
}
export interface LoyaltyBalance {
  balance: number
  weeklyVisitCount: number
  weeklyVisitDates?: string[]
  weekCompleted?: boolean
  weeklyReward?: number
}

interface LoyaltyResponse {
  data?: LoyaltyBalance
  balance?: number
  weeklyVisitCount?: number
  days?: number
  weeklyVisitDates?: string[]
  weekCompleted?: boolean
  completed?: boolean
  weeklyReward?: number
  reward?: number
}

function normalizeLoyaltyResponse(response: LoyaltyResponse | null | undefined): LoyaltyBalance {
  const value = response?.data ?? response ?? {}
  const loyaltyValue = value as LoyaltyResponse
  return {
    balance: Number(value.balance ?? 0),
    weeklyVisitCount: Number(loyaltyValue.weeklyVisitCount ?? loyaltyValue.days ?? 0),
    weeklyVisitDates: loyaltyValue.weeklyVisitDates ?? [],
    weekCompleted: Boolean(loyaltyValue.weekCompleted ?? loyaltyValue.completed),
    weeklyReward: Number(loyaltyValue.weeklyReward ?? loyaltyValue.reward ?? 0),
  }
}

export function useLoyalty() {
  const auth = useAuth()
  const balance = useState<LoyaltyBalance | null>('loyalty-balance', () => null)
  const pending = useState('loyalty-pending', () => false)
  const error = useState<unknown>('loyalty-error', () => null)

  async function refresh() {
    if (!auth.value) {
      balance.value = null
      return null
    }
    pending.value = true
    error.value = null
    try {
      const response = await $fetch<LoyaltyResponse>('/api/loyalty/balance')
      balance.value = normalizeLoyaltyResponse(response)
      return balance.value
    } catch (cause) {
      error.value = cause
      return null
    } finally {
      pending.value = false
    }
  }

  async function registerVisit() {
    if (!auth.value) return null
    try {
      const response = await $fetch<LoyaltyResponse>('/api/loyalty/visit', { method: 'POST' })
      balance.value = normalizeLoyaltyResponse(response)
      return balance.value
    } catch (cause) {
      error.value = cause
      return null
    }
  }

  const balanceAmount = computed(() => balance.value?.balance ?? 0)
  const visitCount = computed(() => Math.min(balance.value?.weeklyVisitCount ?? 0, 7))

  return { balance, balanceAmount, visitCount, pending, error, refresh, registerVisit }
}

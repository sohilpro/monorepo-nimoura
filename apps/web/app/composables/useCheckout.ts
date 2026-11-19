export type CheckoutState = {
  addressId: number | null;
  firstName: string;
  lastName: string;
  phone: string;
  note: string;
  paymentMethod: 'zarinpal' | 'snapppay' | 'torobpay' | null;
  referralCode?: string;
  promotionId?: number | null;
};

export function useCheckout() {
  return useState<CheckoutState>('nimoura-checkout', () => ({
    addressId: null,
    firstName: '',
    lastName: '',
    phone: '',
    note: '',
    paymentMethod: null,
    referralCode: '',
    promotionId: null,
  }));
}

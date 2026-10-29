interface Auth {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  mobile: string;
  verify_mobile: boolean;
  email?: string;
  verify_email: boolean;
  identity_card: string;
}

export const useAuth = () => {
  return useState<Auth | null>("auth", () => null);
};
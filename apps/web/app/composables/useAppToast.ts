// composables/useAppToast.ts
export function useAppToast() {
  const toast = useToast();

  return {
    success: (detail: string, summary = "موفق") =>
      toast.add({ severity: "success", summary, detail, life: 3500 }),
    info: (detail: string, summary = "توجه") =>
      toast.add({ severity: "info", summary, detail, life: 3500 }),
    error: (detail: string, summary = "خطا") =>
      toast.add({ severity: "error", summary, detail, life: 4000 }),
    warn: (detail: string, summary = "هشدار") =>
      toast.add({ severity: "warn", summary, detail, life: 3500 }),
  };
}
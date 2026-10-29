// composables/useLoading.ts
export const useLoading = () => {
  const isLoading = useState("loading", () => false);

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    isLoading.value = true;
    try {
      return await fn();
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    wrap,
  };
};

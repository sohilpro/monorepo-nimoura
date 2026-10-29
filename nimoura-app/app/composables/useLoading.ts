export function useLoading() {
  const isLoading = ref(false);
  const startLoading = () => (isLoading.value = true);
  const stopLoading = () => (isLoading.value = false);

  const withLoading = async (fn: any) => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  };

  return { isLoading, startLoading, stopLoading, withLoading };
}

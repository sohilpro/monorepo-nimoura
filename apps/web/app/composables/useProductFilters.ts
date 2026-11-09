/** Product list filters that live in the URL (so they can be shared, bookmarked and go back/forward). */
export function parseIdList(value: unknown): number[] {
  const list = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(list.map((v) => Number(String(v).trim())).filter((n) => Number.isInteger(n) && n > 0))];
}

export function useProductFilters() {
  const route = useRoute();
  const router = useRouter();

  const selectedTagIds = computed(() => parseIdList(route.query.tags));
  const onSale = computed(() => route.query.onSale === 'true');
  const inStock = computed(() => route.query.isAvailable === 'true');
  const hasPriceFilter = computed(() => !!(route.query.minPrice || route.query.maxPrice));

  const activeCount = computed(
    () =>
      selectedTagIds.value.length +
      Number(onSale.value) +
      Number(inStock.value) +
      Number(hasPriceFilter.value),
  );

  // any filter change starts again from page 1
  function push(patch: Record<string, unknown>) {
    router.push({ query: { ...route.query, ...patch, page: undefined } });
  }

  function toggleTag(id: number) {
    const ids = new Set(selectedTagIds.value);
    ids.has(id) ? ids.delete(id) : ids.add(id);
    push({ tags: ids.size ? [...ids].join(',') : undefined });
  }

  const setFlag = (key: 'onSale' | 'isAvailable', value: boolean) =>
    push({ [key]: value ? 'true' : undefined });

  const clearPrice = () => push({ minPrice: undefined, maxPrice: undefined });

  return { selectedTagIds, onSale, inStock, hasPriceFilter, activeCount, push, toggleTag, setFlag, clearPrice };
}

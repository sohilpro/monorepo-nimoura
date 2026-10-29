export function useTableQuery(defaults: {
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: "ASC" | "DESC";
}) {
  const route: any = useRoute();
  const router: any = useRouter();

  const page = ref(+route.query.page || 1);
  const limit = ref(+route.query.limit || defaults.defaultLimit || 10);
  const search = ref(route.query.search || "");
  const sort = ref(route.query.sort || defaults.defaultSortBy || "id");
  const sortOrder = ref(
    (route.query.sortOrder as "ASC" | "DESC") ||
      defaults.defaultSortOrder ||
      "DESC"
  );

  function updateQuery() {
    router.push({
      query: {
        ...route.query,
        page: page.value,
        limit: limit.value,
        search: search.value,
        sort: sort.value,
        sortOrder: sortOrder.value,
      },
    });
  }

  function onPageChange(newPage: number) {
    page.value = newPage;
    updateQuery();
  }

  function onSearch(val: string) {
    search.value = val;
    page.value = 1;
    updateQuery();
  }

  function onSort({ key, order }: { key: string; order: string }) {
    sort.value = key;
    sortOrder.value = order as "ASC" | "DESC";
    updateQuery();
  }

  watch(
    () => route.query,
    () => {
      page.value = +route.query.page || 1;
      limit.value = +route.query.limit || defaults.defaultLimit || 10;
      search.value = route.query.search || "";
      sort.value = route.query.sort || defaults.defaultSortBy || "id";
      sortOrder.value =
        (route.query.sortOrder as "ASC" | "DESC") ||
        defaults.defaultSortOrder ||
        "DESC";
    },
    { immediate: true }
  );

  const queryParams = computed(() => ({
    page: page.value,
    limit: limit.value,
    search: search.value,
    sort: sort.value,
    sortOrder: sortOrder.value,
  }));

  return {
    page,
    limit,
    search,
    sort,
    sortOrder,
    queryParams,
    onPageChange,
    onSearch,
    onSort,
  };
}
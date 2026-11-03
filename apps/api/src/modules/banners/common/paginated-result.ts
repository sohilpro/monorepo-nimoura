export class PaginatedResult<T> {
  data: T[];
  items: T[];
  banners: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    this.data = data;
    this.items = data;
    this.banners = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
    this.meta = {
      total,
      page,
      limit,
      totalPages,
    };
  }
}

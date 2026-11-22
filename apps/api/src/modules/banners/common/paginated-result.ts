/**
 * شکل استاندارد پاسخ لیست بنرها در پنل ادمین.
 *
 * قبل از این، همان آرایه سه بار در کلیدهای data/items/banners تکرار میشد.
 * پنل ادمین ابتدا وارد .data میشد و سپس دنبال .items میگشت، در نتیجه با
 * Finding یک آرایه بجای شیء، لیست همیشه خالی میماند. فقط یک کلید آرایه
 * (items) نگه میداریم تا هم payload سبکتر شود و هم مصرفکننده سادهتر.
 */
export class PaginatedResult<T> {
  items: T[];
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

  constructor(items: T[], total: number, page: number, limit: number) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    this.items = items;
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

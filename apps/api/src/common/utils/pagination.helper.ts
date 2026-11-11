import { ILike } from 'typeorm';

export type SortDirection = 'ASC' | 'DESC';

/** Raw list query as received from the HTTP layer (values may be strings). */
export interface ListQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function toSortDirection(value?: string): SortDirection {
  return String(value || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
}

/** Sanitizes page/limit/search/sort values; sortBy is restricted to a whitelist. */
export function parseListQuery(
  query: ListQuery | undefined,
  allowedSortFields: readonly string[],
) {
  const page = Math.max(1, Number(query?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
  const search = (query?.search || '').trim();
  const sortOrder = toSortDirection(query?.sortOrder);
  const sortBy =
    query?.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'id';

  return { page, limit, search, sortOrder, sortBy };
}

export function buildPagination<T>(
  [items, total]: [T[], number],
  page: number | string,
  limit: number | string,
  key: string = 'items',
) {
  return {
    [key]: items,
    total: +total,
    page: +page,
    limit: +limit,
    totalPages: +Math.ceil(total / +limit),
    hasNextPage: +page * +limit < total,
    hasPrevPage: +page > 1,
  };
}

export function buildSearchWhereClause(search: string, fields: string[]) {
  if (!search?.trim()) return {};

  return fields.map((field) => ({
    [field]: ILike(`%${search}%`),
  }));
}

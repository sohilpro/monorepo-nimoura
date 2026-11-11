import { ILike } from 'typeorm';

export function buildPagination<T>(
  [items, total]: [T[], number],
  page: number,
  limit: number,
  key: string = 'items',
) {
  return {
    [key]: items,
    total: +total,
    page: +page,
    limit: +limit,
    totalPages: +Math.ceil(total / limit),
    hasNextPage: +page * limit < total,
    hasPrevPage: +page > 1,
  };
}

export function buildSearchWhereClause(search: string, fields: string[]) {
  if (!search?.trim()) return {};

  return fields.map((field) => ({
    [field]: ILike(`%${search}%`),
  }));
}

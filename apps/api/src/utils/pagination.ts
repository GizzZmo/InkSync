import { PaginationMeta, PaginationQuery } from '@inksync/shared';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationOptions(query: PaginationQuery): PaginationOptions {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, options: PaginationOptions): PaginationMeta {
  return {
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.ceil(total / options.limit),
  };
}

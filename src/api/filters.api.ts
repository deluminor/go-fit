import { ENDPOINTS } from '@/constants/api.ts';
import type { LoaderType } from '@/constants/loaders.ts';
import { PAGE_LIMIT } from '@/constants/patterns.ts';
import type { CategoryItem } from '@/types/category.ts';
import type { PaginatedResponse } from '@/types/pagination.ts';
import { http } from './instance.ts';
import { normalizePaginated } from './normalizers.ts';

export interface GetFiltersParams {
  filter: string;
  page?: number;
  limit?: number;
}

export interface ApiLoaderOptions {
  loader?: LoaderType | string;
}

export async function getFilters(
  { filter, page = 1, limit = PAGE_LIMIT.CATEGORIES }: GetFiltersParams,
  { loader }: ApiLoaderOptions = {},
): Promise<PaginatedResponse<CategoryItem>> {
  const { data } = await http.get(ENDPOINTS.filters, {
    params: { filter, page, limit },
    meta: { loader },
  });

  return normalizePaginated<CategoryItem>(data);
}

import type { PaginatedResponse } from '@/types/pagination.ts';
import type { Quote } from '@/types/quote.ts';

function assertObject(data: unknown, label: string): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`API: invalid ${label} response`);
  }

  return data as Record<string, unknown>;
}

export function normalizePaginated<T = Record<string, unknown>>(
  data: unknown,
): PaginatedResponse<T> {
  const body = assertObject(data, 'paginated');
  const { results, totalPages, page } = body;

  if (!Array.isArray(results)) {
    throw new Error('API: paginated results must be an array');
  }

  const normalizedPage = Number(page);
  const normalizedTotalPages = Number(totalPages);

  if (
    !Number.isFinite(normalizedPage) ||
    !Number.isFinite(normalizedTotalPages)
  ) {
    throw new Error('API: paginated page metadata must be numeric');
  }

  return {
    results: results as T[],
    totalPages: normalizedTotalPages,
    page: normalizedPage,
  };
}

export function normalizeQuote(data: unknown): Quote {
  const body = assertObject(data, 'quote');
  const { author, quote } = body;

  if (typeof author !== 'string' || typeof quote !== 'string') {
    throw new Error('API: quote must include author and quote strings');
  }

  return { author, quote };
}

export function normalizeEntity<T extends object = Record<string, unknown>>(
  data: unknown,
): T {
  return assertObject(data, 'entity') as T;
}

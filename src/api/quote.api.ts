import { ENDPOINTS } from '@/constants/api.ts';
import type { LoaderType } from '@/constants/loaders.ts';
import type { Quote } from '@/types/quote.ts';
import { http } from './instance.ts';
import { normalizeQuote } from './normalizers.ts';

export interface ApiLoaderOptions {
  loader?: LoaderType | string;
}

export async function getQuote({
  loader,
}: ApiLoaderOptions = {}): Promise<Quote> {
  const { data } = await http.get(ENDPOINTS.quote, { meta: { loader } });
  return normalizeQuote(data);
}

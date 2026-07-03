import { ENDPOINTS } from '@/constants/api.ts';
import type { LoaderType } from '@/constants/loaders.ts';
import { http } from './instance.ts';
import { normalizeEntity } from './normalizers.ts';

export interface ApiLoaderOptions {
  loader?: LoaderType | string;
}

export async function subscribe(
  email: string,
  { loader }: ApiLoaderOptions = {},
): Promise<Record<string, unknown>> {
  const { data } = await http.post(
    ENDPOINTS.subscription,
    { email },
    { meta: { loader } },
  );

  return normalizeEntity(data);
}

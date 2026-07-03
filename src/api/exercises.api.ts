import { ENDPOINTS } from '@/constants/api.ts';
import type { LoaderType } from '@/constants/loaders.ts';
import { PAGE_LIMIT } from '@/constants/patterns.ts';
import type { Exercise } from '@/types/exercise.ts';
import type { PaginatedResponse } from '@/types/pagination.ts';
import { http } from './instance.ts';
import { normalizeEntity, normalizePaginated } from './normalizers.ts';

export interface GetExercisesParams {
  bodypart?: string;
  muscles?: string;
  equipment?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface ApiLoaderOptions {
  loader?: LoaderType | string;
}

export interface RateExercisePayload {
  rate: number;
  email: string;
  review: string;
}

export async function getExercises(
  {
    bodypart = '',
    muscles = '',
    equipment = '',
    keyword = '',
    page = 1,
    limit = PAGE_LIMIT.EXERCISES,
  }: GetExercisesParams = {},
  { loader }: ApiLoaderOptions = {},
): Promise<PaginatedResponse<Exercise>> {
  const { data } = await http.get(ENDPOINTS.exercises, {
    params: { bodypart, muscles, equipment, keyword, page, limit },
    meta: { loader },
  });

  return normalizePaginated<Exercise>(data);
}

export async function getExerciseById(
  id: string,
  { loader }: ApiLoaderOptions = {},
): Promise<Exercise> {
  const { data } = await http.get(ENDPOINTS.exerciseById(id), {
    meta: { loader },
  });

  return normalizeEntity<Exercise>(data);
}

export async function rateExercise(
  id: string,
  payload: RateExercisePayload,
  { loader }: ApiLoaderOptions = {},
): Promise<Exercise> {
  const { data } = await http.patch(ENDPOINTS.rating(id), payload, {
    meta: { loader },
  });

  return normalizeEntity<Exercise>(data);
}

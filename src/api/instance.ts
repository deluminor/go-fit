import { API_EVENT } from '@/constants/api-events.ts';
import { API_BASE_URL } from '@/constants/api.ts';
import { LOADER, type LoaderType } from '@/constants/loaders.ts';
import type { AxiosLikeError } from '@/types/api.ts';
import { resolveAxiosErrorMessage } from '@/utils/api-error-message.ts';
import { emitApiEvent } from '@/utils/api-events.ts';
import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

function loaderMode(config?: InternalAxiosRequestConfig): LoaderType | string {
  return config?.meta?.loader ?? LOADER.GLOBAL;
}

http.interceptors.request.use((config) => {
  emitApiEvent(API_EVENT.LOADER_SHOW, loaderMode(config));
  return config;
});

http.interceptors.response.use(
  (response) => {
    emitApiEvent(API_EVENT.LOADER_HIDE, loaderMode(response.config));
    return response;
  },
  (error: AxiosLikeError & { config?: InternalAxiosRequestConfig }) => {
    emitApiEvent(API_EVENT.LOADER_HIDE, loaderMode(error.config));
    emitApiEvent(API_EVENT.NOTIFY_ERROR, resolveAxiosErrorMessage(error));
    return Promise.reject(error);
  },
);

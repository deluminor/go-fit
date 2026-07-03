import { getQuote } from '@/api/quote.api.ts';
import { LOADER } from '@/constants/loaders.ts';
import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import { readJSON, writeJSON } from '@/services/storage.service.ts';
import type { CachedQuote } from '@/types/quote.ts';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSsrQuote(
  root: HTMLElement,
): { quote: string; author: string } | null {
  const quote = root.querySelector('[data-quote-text]')?.textContent?.trim();
  const author = root.querySelector('[data-quote-author]')?.textContent?.trim();

  if (!quote || !author) return null;

  return { quote, author };
}

function renderCachedQuote(root: HTMLElement, cached: CachedQuote): void {
  const textEl = root.querySelector('[data-quote-text]');
  const authorEl = root.querySelector('[data-quote-author]');

  if (!textEl || !authorEl) return;

  if (
    textEl.textContent === cached.quote &&
    authorEl.textContent === cached.author
  ) {
    return;
  }

  textEl.textContent = cached.quote;
  authorEl.textContent = cached.author;
}

function renderQuote(root: HTMLElement, quote: string, author: string): void {
  const textEl = root.querySelector('[data-quote-text]');
  const authorEl = root.querySelector('[data-quote-author]');

  if (!textEl || !authorEl) return;

  textEl.textContent = quote;
  authorEl.textContent = author;
}

export async function initQuote(root: HTMLElement | null): Promise<void> {
  if (!root) return;

  const today = getTodayKey();
  const ssrQuote = readSsrQuote(root);
  const cached = readJSON<CachedQuote | null>(STORAGE_KEYS.QUOTE, null);

  if (cached?.date === today) {
    renderCachedQuote(root, cached);
    return;
  }

  if (ssrQuote) {
    writeJSON(STORAGE_KEYS.QUOTE, {
      date: today,
      quote: ssrQuote.quote,
      author: ssrQuote.author,
    });
    return;
  }

  const data = await getQuote({ loader: LOADER.SILENT }).catch(() => null);

  if (!data) return;

  renderQuote(root, data.quote, data.author);
  writeJSON(STORAGE_KEYS.QUOTE, {
    date: today,
    quote: data.quote,
    author: data.author,
  });
}

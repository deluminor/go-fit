import { escapeHtml } from '@/utils/escape-html.ts';

export function renderBadge(label = 'WORKOUT'): string {
  return `<span class="badge">${escapeHtml(label)}</span>`;
}

import type { ListStatus } from '@/types/list-status.ts';
import { escapeHtml } from '@/utils/escape-html.ts';

export function createListStatus(block: string): ListStatus {
  const REFRESH_CLASS = `${block}__refresh`;
  const REFRESHING_MODIFIER = `${block}--refreshing`;

  function hideRefreshing(root: HTMLElement): void {
    root.classList.remove(REFRESHING_MODIFIER);
    root.removeAttribute('aria-busy');
    root.querySelector(`.${REFRESH_CLASS}`)?.remove();
  }

  function showRefreshing(root: HTMLElement): void {
    root.classList.add(REFRESHING_MODIFIER);
    root.setAttribute('aria-busy', 'true');

    if (root.querySelector(`.${REFRESH_CLASS}`)) return;

    const refresh = document.createElement('li');

    refresh.className = REFRESH_CLASS;
    refresh.setAttribute('aria-hidden', 'true');
    refresh.innerHTML =
      '<span class="loader__spinner" aria-hidden="true"></span>';

    root.append(refresh);
  }

  function renderLoading(root: HTMLElement, srLabel: string): void {
    hideRefreshing(root);

    root.innerHTML = `
      <li class="${block}__status ${block}__status--loading">
        <span class="loader__spinner" aria-hidden="true"></span>
        <span class="visually-hidden">${escapeHtml(srLabel)}</span>
      </li>`;

    root.setAttribute('aria-busy', 'true');
  }

  function renderEmpty(root: HTMLElement, message: string): void {
    hideRefreshing(root);

    root.innerHTML = `
      <li class="${block}__status ${block}__status--empty">
        <div class="placeholder">${escapeHtml(message)}</div>
      </li>`;
  }

  return { showRefreshing, hideRefreshing, renderLoading, renderEmpty };
}

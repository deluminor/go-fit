import { escapeHtml } from '@/utils/escape-html.ts';

export interface RenderButtonProps {
  label?: string;
  type?: string;
}

export function renderButton({
  label = 'Button',
  type = 'button',
}: RenderButtonProps = {}): string {
  return `<button class="button" type="${escapeHtml(type)}">${escapeHtml(label)}</button>`;
}

export function setButtonLoading(
  button: HTMLButtonElement,
  isLoading: boolean,
  loadingClass = 'button--loading',
): void {
  button.classList.toggle(loadingClass, isLoading);
  button.disabled = isLoading;
  button.setAttribute('aria-busy', String(isLoading));
}

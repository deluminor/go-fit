import { SPRITE_ICON, renderSpriteIcon } from '@/utils/sprite-icon.ts';

const ROOT_ID = 'modal-root';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let activeClose: (() => void) | null = null;

export interface OpenModalOptions {
  name: string;
  label?: string;
  content?: string;
  onClose?: () => void;
}

export function openModal({
  name,
  label,
  content = '',
  onClose,
}: OpenModalOptions): () => void {
  const root = document.getElementById(ROOT_ID);
  if (!root) return () => {};

  const previouslyFocused = document.activeElement;
  if (activeClose) activeClose();

  const closeIconHtml = renderSpriteIcon(SPRITE_ICON.CLOSE || 'close', {
    className: 'modal__close-icon',
    width: '100%',
    height: '100%',
    stroke: true,
  });

  root.innerHTML = `
    <div class="modal" data-modal="${name}">
      <div class="modal__backdrop" data-close></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" tabindex="-1">
        <button class="modal__close" type="button" data-close aria-label="Close">
          ${closeIconHtml}
        </button>
        ${content}
      </div>
    </div>`;

  const dialog = root.querySelector('.modal__dialog') as HTMLElement;
  if (!dialog) return () => {};

  if (label) dialog.setAttribute('aria-label', label);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const modalRoot = root;

  function getFocusable(): HTMLElement[] {
    const nodes = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    return Array.from(nodes).filter((el) => el.offsetParent !== null);
  }

  function trapFocus(event: KeyboardEvent): void {
    const items = getFocusable();

    if (items.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key === 'Tab') trapFocus(event);
  }

  function close(): void {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = previousOverflow;
    modalRoot.innerHTML = '';
    activeClose = null;

    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();

    onClose?.();
  }

  root
    .querySelectorAll('[data-close]')
    .forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', onKeydown);

  (getFocusable()[0] ?? dialog).focus();

  activeClose = close;
  return close;
}

export function closeModal(): void {
  if (activeClose) activeClose();
}

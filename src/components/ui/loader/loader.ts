import { LOADER } from '@/constants/loaders.ts';

const GLOBAL_KEY = '__global__';

const counters = new Map<string, number>();
const overlays = new Map<string, HTMLElement>();

function resolveKey(mode: string | undefined): string | null {
  if (!mode || mode === LOADER.GLOBAL) return GLOBAL_KEY;
  if (mode === LOADER.SILENT) return null;

  return mode;
}

function getHostElement(key: string): HTMLElement | null {
  if (key === GLOBAL_KEY) return null;
  return document.querySelector(key);
}

function createOverlay(isGlobal: boolean): HTMLElement {
  const el = document.createElement('div');

  el.className = `loader ${isGlobal ? 'loader--global' : 'loader--local'}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="loader__spinner"></span>';

  return el;
}

function mount(key: string): void {
  const isGlobal = key === GLOBAL_KEY;
  let overlay = overlays.get(key);

  if (overlay && !isGlobal) {
    const host = getHostElement(key);

    if (!host || !host.contains(overlay)) {
      overlay.remove();
      overlays.delete(key);
      overlay = undefined;
    }
  }

  if (!overlay) {
    overlay = createOverlay(isGlobal);

    if (isGlobal) {
      document.body.append(overlay);
    } else {
      const host = getHostElement(key);
      if (!host) return;

      host.classList.add('loader-host');
      host.append(overlay);
    }

    overlays.set(key, overlay);
  }

  overlay.classList.add('loader--visible');
}

function unmount(key: string): void {
  const overlay = overlays.get(key);
  if (!overlay) return;

  if (key === GLOBAL_KEY) {
    overlay.classList.remove('loader--visible');
    return;
  }

  overlay.remove();

  const host = getHostElement(key);
  host?.classList.remove('loader-host');
  overlays.delete(key);
}

export function showLoader(mode?: string): void {
  const key = resolveKey(mode);
  if (key === null) return;

  counters.set(key, (counters.get(key) ?? 0) + 1);
  mount(key);
}

export function hideLoader(mode?: string): void {
  const key = resolveKey(mode);
  if (key === null) return;

  const current = counters.get(key) ?? 0;

  if (current <= 1) {
    counters.delete(key);
    unmount(key);
    return;
  }

  counters.set(key, current - 1);
}

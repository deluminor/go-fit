import { LOADER } from '../../../utils/constants.js';

const GLOBAL_KEY = '__global__';

/** @type {Map<string, number>} */
const counters = new Map();

/** @type {Map<string, HTMLElement>} */
const overlays = new Map();

/**
 * Resolves a stable cache key for loader state.
 * Local loaders use the CSS selector string, not the DOM node reference.
 * @param {string | undefined} mode
 * @returns {string | null}
 */
function resolveKey(mode) {
  if (!mode || mode === LOADER.GLOBAL) return GLOBAL_KEY;
  if (mode === LOADER.SILENT) return null;

  return mode;
}

/**
 * @param {string} key
 * @returns {HTMLElement | null}
 */
function getHostElement(key) {
  if (key === GLOBAL_KEY) return null;
  return document.querySelector(key);
}

/**
 * @param {boolean} isGlobal
 * @returns {HTMLElement}
 */
function createOverlay(isGlobal) {
  const el = document.createElement('div');

  el.className = `loader ${isGlobal ? 'loader--global' : 'loader--local'}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="loader__spinner"></span>';

  return el;
}

/**
 * @param {string} key
 */
function mount(key) {
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

/**
 * @param {string} key
 */
function unmount(key) {
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

/**
 * @param {string | undefined} mode
 */
export function showLoader(mode) {
  const key = resolveKey(mode);
  if (key === null) return;

  counters.set(key, (counters.get(key) ?? 0) + 1);
  mount(key);
}

/**
 * @param {string | undefined} mode
 */
export function hideLoader(mode) {
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

import { DEFAULT_FILTER } from '../utils/constants.js';

/**
 * @typedef {object} AppState
 * @property {string} activeFilter   Active filter tab (Muscles / Body parts / Equipment).
 * @property {?{ name: string, filter: string }} category  Selected category, or null on the categories view.
 * @property {number} page           Current page of the active list.
 * @property {string} keyword        Search keyword (exercises list only).
 */

/** @type {AppState} */
const state = {
  activeFilter: DEFAULT_FILTER,
  category: null,
  page: 1,
  keyword: '',
};

/** @type {Set<(state: Readonly<AppState>) => void>} */
const listeners = new Set();

/** @returns {Readonly<AppState>} */
function snapshot() {
  return Object.freeze({ ...state });
}

/** @returns {Readonly<AppState>} */
export function getState() {
  return snapshot();
}

/**
 * Shallow-merges a patch and notifies all subscribers.
 * @param {Partial<AppState>} patch
 */
export function setState(patch) {
  Object.assign(state, patch);
  const frozen = snapshot();

  for (const listener of listeners) listener(frozen);
}

/**
 * Subscribes to state changes. Returns an unsubscribe fn —
 * ALWAYS call it when tearing down a component (e.g. closing a modal)
 * to avoid leaking listeners.
 * @param {(state: Readonly<AppState>) => void} listener
 * @returns {() => void}
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

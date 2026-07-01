export const SPRITE_ICON = {
  CHEVRON_LEFT: 'icon-chevron-left',
  CHEVRON_RIGHT: 'icon-chevron-right',
  RUNNING: 'icon-running',
  STAR: 'icon-star',
  ARROW_UP_RIGHT: 'icon-arrow-up-right',
  SEARCH: 'icon-search',
};

/**
 * @param {string} iconId - Symbol id, e.g. `icon-star`
 * @param {{
 *   className?: string;
 *   width?: number | string;
 *   height?: number | string;
 *   viewBox?: string;
 *   stroke?: boolean;
 * }} [options]
 * @returns {string}
 * @example
 * renderSpriteIcon(SPRITE_ICON.STAR, { className: 'card__star', width: 18, height: 18 });
 */
export function renderSpriteIcon(iconId, options = {}) {
  const {
    className = '',
    width,
    height,
    viewBox = '0 0 32 32',
    stroke = false,
  } = options;

  const paintAttrs = stroke
    ? 'fill="none" stroke="currentColor"'
    : 'fill="currentColor"';

  const sizeAttrs = [
    width !== undefined && width !== null ? `width="${width}"` : '',
    height !== undefined && height !== null ? `height="${height}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const classAttr = className ? ` class="${className}"` : '';

  return `<svg${classAttr} ${sizeAttrs} viewBox="${viewBox}" ${paintAttrs} aria-hidden="true"><use href="#${iconId}"></use></svg>`;
}

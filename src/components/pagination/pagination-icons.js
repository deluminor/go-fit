import { renderSpriteIcon, SPRITE_ICON } from '../../utils/sprite-icon.js';

const CHEVRON_OPTIONS = {
  className: 'pagination__icon',
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
};

/**
 * @param {'left' | 'right'} direction
 * @returns {string}
 */
export function renderChevronIcon(direction) {
  const iconId =
    direction === 'left' ? SPRITE_ICON.CHEVRON_LEFT : SPRITE_ICON.CHEVRON_RIGHT;

  return renderSpriteIcon(iconId, CHEVRON_OPTIONS);
}

/**
 * @param {'left' | 'right'} direction
 * @returns {string}
 */
export function renderDoubleChevronIcon(direction) {
  const icon = renderChevronIcon(direction);
  return `<span class="pagination__icon-set pagination__icon-set--double">${icon}${icon}</span>`;
}

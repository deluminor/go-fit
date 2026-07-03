import { getFilters } from '@/api/filters.api.ts';
import { renderCategoryCard } from '@/components/category-card/render-category-card.ts';
import { createListStatus } from '@/components/shared/list-status.ts';
import { bindStoreIsland } from '@/components/shared/store-island.ts';
import { DEFAULT_FILTER } from '@/constants/filters.ts';
import { LOADER } from '@/constants/loaders.ts';
import { getState, setState } from '@/services/store.service.ts';
import type { AppState } from '@/types/app-state.ts';
import type { CategoryItem } from '@/types/category.ts';

const BLOCK = 'category-list';
const status = createListStatus(BLOCK);

let inflightKey: string | null = null;

function render(
  root: HTMLElement,
  items: CategoryItem[],
  caption: string,
): void {
  status.hideRefreshing(root);

  if (!items.length) {
    status.renderEmpty(root, 'No categories found.');
    return;
  }

  root.innerHTML = items
    .map((item) =>
      renderCategoryCard({
        name: String(item.name ?? ''),
        filter: String(item.filter ?? ''),
        imgURL: String(item.imgURL ?? ''),
        caption,
      }),
    )
    .join('');

  root.classList.add('category-list--revealing');

  requestAnimationFrame(() => {
    root.classList.remove('category-list--revealing');
  });
}

async function loadCategories(root: HTMLElement): Promise<void> {
  const { activeFilter, page } = getState();
  const requestKey = `${activeFilter}:${page}`;

  if (inflightKey === requestKey) return;

  inflightKey = requestKey;

  const hasCards = Boolean(root.querySelector('.category-card'));

  if (hasCards) {
    status.showRefreshing(root);
  } else if (!root.querySelector('.category-card')) {
    status.renderLoading(root, 'Loading categories…');
  }

  try {
    const {
      results,
      totalPages,
      page: responsePage,
    } = await getFilters(
      { filter: activeFilter, page },
      { loader: LOADER.SILENT },
    );

    const current = getState();
    const responseKey = `${current.activeFilter}:${current.page}`;

    if (responseKey !== requestKey) return;

    render(root, results, current.activeFilter);

    const patch: Partial<AppState> = {};

    if (current.totalPages !== totalPages) patch.totalPages = totalPages;
    if (current.page !== responsePage) patch.page = responsePage;

    if (Object.keys(patch).length > 0) setState(patch);
  } catch {
    status.renderEmpty(root, 'Failed to load categories.');
  } finally {
    if (inflightKey === requestKey) inflightKey = null;
  }
}

export function initCategoryList(root: HTMLElement | null): () => void {
  if (!root) return () => {};

  let lastKey = '';

  const { activeFilter, category, page } = getState();
  const hasSsrCards =
    root.dataset.hydrated === 'false' &&
    Boolean(root.querySelector('.category-card'));

  if (
    hasSsrCards &&
    category === null &&
    activeFilter === DEFAULT_FILTER &&
    page === 1
  ) {
    lastKey = `${activeFilter}:${page}`;

    const ssrTotalPages = Number(root.dataset.totalPages);

    if (
      Number.isFinite(ssrTotalPages) &&
      ssrTotalPages !== getState().totalPages
    ) {
      setState({ totalPages: ssrTotalPages });
    }
  }

  root.dataset.hydrated = 'true';

  const onClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const card = target.closest('.category-card');

    if (!card || !root.contains(card)) return;

    const name = card.getAttribute('data-name');
    const filter = card.getAttribute('data-filter');

    if (!name || !filter) return;

    setState({ category: { name, filter }, page: 1, keyword: '' });
  };

  const sync = (state: Readonly<AppState>) => {
    const isCategoriesView = state.category === null;

    root.hidden = !isCategoriesView;

    if (!isCategoriesView) {
      lastKey = '';
      return;
    }

    const key = `${state.activeFilter}:${state.page}`;

    if (key === lastKey) return;

    lastKey = key;
    loadCategories(root);
  };

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}

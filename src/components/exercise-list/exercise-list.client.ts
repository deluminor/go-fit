import { getExercises } from '@/api/exercises.api.ts';
import { renderExerciseCard } from '@/components/exercise-card/render-exercise-card.ts';
import { openExerciseModal } from '@/components/exercise-modal/exercise-modal.ts';
import { createListStatus } from '@/components/shared/list-status.ts';
import { bindStoreIsland } from '@/components/shared/store-island.ts';
import { FILTER_PARAM, type FilterType } from '@/constants/filters.ts';
import { LOADER } from '@/constants/loaders.ts';
import { getState, setState } from '@/services/store.service.ts';
import type { AppState } from '@/types/app-state.ts';
import type { Exercise } from '@/types/exercise.ts';

const BLOCK = 'exercise-list';
const status = createListStatus(BLOCK);

let inflightKey: string | null = null;

function requestKeyOf(state: Readonly<AppState>): string {
  const categoryName = state.category ? state.category.name : '';
  return `${state.activeFilter}|${categoryName}|${state.keyword}|${state.page}`;
}

function render(root: HTMLElement, items: Exercise[]): void {
  status.hideRefreshing(root);

  if (!items.length) {
    status.renderEmpty(
      root,
      'No exercises found. Try a different keyword or category.',
    );
    return;
  }

  root.innerHTML = items.map((item) => renderExerciseCard(item)).join('');
}

async function loadExercises(root: HTMLElement): Promise<void> {
  const state = getState();

  if (!state.category) return;

  const requestKey = requestKeyOf(state);

  if (inflightKey === requestKey) return;

  inflightKey = requestKey;

  const hasCards = Boolean(root.querySelector('.exercise-card'));

  if (hasCards) {
    status.showRefreshing(root);
  } else {
    status.renderLoading(root, 'Loading exercises…');
  }

  const paramKey = FILTER_PARAM[state.activeFilter as FilterType];

  try {
    const {
      results,
      totalPages,
      page: responsePage,
    } = await getExercises(
      {
        [paramKey]: state.category.name,
        keyword: state.keyword,
        page: state.page,
      },
      { loader: LOADER.SILENT },
    );

    if (requestKeyOf(getState()) !== requestKey) return;

    render(root, results);

    const current = getState();
    const patch: Partial<AppState> = {};

    if (current.totalPages !== totalPages) patch.totalPages = totalPages;
    if (current.page !== responsePage) patch.page = responsePage;

    if (Object.keys(patch).length > 0) setState(patch);
  } catch {
    status.renderEmpty(root, 'Failed to load exercises.');
  } finally {
    if (inflightKey === requestKey) inflightKey = null;
  }
}

export function initExerciseList(root: HTMLElement | null): () => void {
  if (!root) return () => {};

  let lastKey = '';

  const onClick = (event: Event) => {
    const target = event.target as HTMLElement;

    const card = target.closest('.exercise-card');
    if (!card || !root.contains(card)) return;

    const startBtn = card.querySelector('.exercise-card__start');
    const id = startBtn?.getAttribute('data-id');

    if (!id) return;

    openExerciseModal(id);
  };

  const sync = (state: Readonly<AppState>) => {
    const isExercisesView = state.category !== null;

    root.hidden = !isExercisesView;

    if (!isExercisesView) {
      lastKey = '';
      return;
    }

    const key = requestKeyOf(state);

    if (key === lastKey) return;

    lastKey = key;
    loadExercises(root);
  };

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}

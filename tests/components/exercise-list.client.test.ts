import type { getExercises } from '@/api/exercises.api.ts';
import type { Exercise } from '@/types/exercise.ts';
import type { PaginatedResponse } from '@/types/pagination.ts';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';

vi.mock('@/api/exercises.api.ts', () => ({
  getExercises: vi.fn(),
}));

const EXERCISE_LIST_PATH = '@/components/exercise-list/exercise-list.client.ts';
const EXERCISES_API_PATH = '@/api/exercises.api.ts';
const STORE_PATH = '@/services/store.service.ts';

type StoreModule = typeof import('@/services/store.service.ts');

interface SetupOptions {
  resolve?: PaginatedResponse<Exercise>;
  reject?: Error;
  category?: { name: string; filter: string } | null;
}

let root: HTMLElement;
let teardown: () => void = () => {};
let store: StoreModule;
let getExercisesMock: MockedFunction<typeof getExercises>;

const SAMPLE: PaginatedResponse<Exercise> = {
  results: [
    {
      _id: '1',
      name: 'air bike',
      rating: 4,
      burnedCalories: 312,
      bodyPart: 'waist',
      target: 'abs',
    },
    {
      _id: '2',
      name: '3/4 sit-up',
      rating: 5,
      burnedCalories: 220,
      bodyPart: 'waist',
      target: 'abs',
    },
  ],
  page: 1,
  totalPages: 3,
};

const WAIST = { name: 'waist', filter: 'bodypart' };

async function setup({
  resolve = SAMPLE,
  reject,
  category = WAIST,
}: SetupOptions = {}): Promise<void> {
  localStorage.clear();
  vi.resetModules();

  const api = await import(EXERCISES_API_PATH);
  getExercisesMock = vi.mocked(api.getExercises);

  if (reject) {
    getExercisesMock.mockRejectedValue(reject);
  } else {
    getExercisesMock.mockResolvedValue(resolve);
  }

  store = await import(STORE_PATH);

  if (category) {
    store.setState({ activeFilter: 'Body parts', category, page: 1 });
  }

  const { initExerciseList } = await import(EXERCISE_LIST_PATH);

  root = document.createElement('ul');
  root.setAttribute('data-component', 'exercise-list');
  document.body.append(root);
  teardown = initExerciseList(root);
}

describe('exercise-list island', () => {
  afterEach(() => {
    teardown();
    root.remove();
    vi.restoreAllMocks();
  });

  it('stays hidden while no category is selected', async () => {
    await setup({ category: null });

    expect(root.hidden).toBe(true);
    expect(getExercisesMock).not.toHaveBeenCalled();
  });

  it('loads exercises for the active filter + category and renders a card each', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelectorAll('.exercise-card')).toHaveLength(2);
    });

    expect(root.hidden).toBe(false);
    expect(getExercisesMock).toHaveBeenCalledWith(
      { bodypart: 'waist', keyword: '', page: 1 },
      { loader: 'silent' },
    );
    expect(root.textContent).toContain('air bike');
  });

  it('shows an empty message when nothing is found', async () => {
    await setup({ resolve: { results: [], page: 1, totalPages: 1 } });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('No exercises found');
    });
    expect(root.querySelector('.exercise-card')).toBeNull();
  });

  it('shows a failure state when the request rejects', async () => {
    await setup({ reject: new Error('network down') });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('Failed to load exercises.');
    });
  });

  it('reloads when the keyword changes', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(getExercisesMock).toHaveBeenCalledTimes(1);
    });

    store.setState({ keyword: 'plank', page: 1 });

    await vi.waitFor(() => {
      expect(getExercisesMock).toHaveBeenCalledTimes(2);
    });
    expect(getExercisesMock).toHaveBeenLastCalledWith(
      { bodypart: 'waist', keyword: 'plank', page: 1 },
      { loader: 'silent' },
    );
  });
});

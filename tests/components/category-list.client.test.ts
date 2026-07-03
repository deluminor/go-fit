import type { getFilters } from '@/api/filters.api.ts';
import type { CategoryItem } from '@/types/category.ts';
import type { PaginatedResponse } from '@/types/pagination.ts';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';

vi.mock('@/api/filters.api.ts', () => ({
  getFilters: vi.fn(),
}));

const CATEGORY_LIST_PATH = '@/components/category-list/category-list.client.ts';
const FILTERS_API_PATH = '@/api/filters.api.ts';
const STORE_PATH = '@/services/store.service.ts';

type StoreModule = typeof import('@/services/store.service.ts');

interface SetupOptions {
  resolve?: PaginatedResponse<CategoryItem>;
  reject?: Error;
}

let root: HTMLElement;
let teardown: () => void = () => {};
let store: StoreModule;
let getFiltersMock: MockedFunction<typeof getFilters>;

const SAMPLE: PaginatedResponse<CategoryItem> = {
  results: [
    { name: 'biceps', filter: 'muscles', imgURL: 'https://cdn.test/b.jpg' },
    { name: 'triceps', filter: 'muscles', imgURL: 'https://cdn.test/t.jpg' },
  ],
  page: 1,
  totalPages: 1,
};

async function setup({
  resolve = SAMPLE,
  reject,
}: SetupOptions = {}): Promise<void> {
  localStorage.clear();
  vi.resetModules();

  const api = await import(FILTERS_API_PATH);
  getFiltersMock = vi.mocked(api.getFilters);

  if (reject) {
    getFiltersMock.mockRejectedValue(reject);
  } else {
    getFiltersMock.mockResolvedValue(resolve);
  }

  store = await import(STORE_PATH);
  const { initCategoryList } = await import(CATEGORY_LIST_PATH);

  root = document.createElement('ul');
  root.setAttribute('data-component', 'category-list');
  document.body.append(root);
  teardown = initCategoryList(root);
}

describe('category-list island', () => {
  afterEach(() => {
    teardown();
    root.remove();
    vi.restoreAllMocks();
  });

  it('loads categories on init and renders a card per result', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelectorAll('.category-card')).toHaveLength(2);
    });

    expect(getFiltersMock).toHaveBeenCalledWith(
      { filter: 'Muscles', page: 1 },
      { loader: 'silent' },
    );
    expect(root.textContent).toContain('biceps');
    expect(root.textContent).toContain('triceps');
  });

  it('shows an empty state when no categories are returned', async () => {
    await setup({ resolve: { results: [], page: 1, totalPages: 1 } });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('No categories found.');
    });
    expect(root.querySelector('.category-card')).toBeNull();
  });

  it('shows a failure state when the request rejects', async () => {
    await setup({ reject: new Error('network down') });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('Failed to load categories.');
    });
  });

  it('stores the selected category when a card is clicked', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelector('.category-card')).not.toBeNull();
    });

    root.querySelector<HTMLElement>('.category-card')!.click();

    expect(store.getState().category).toEqual({
      name: 'biceps',
      filter: 'muscles',
    });
  });

  it('reloads when the active filter changes', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(getFiltersMock).toHaveBeenCalledTimes(1);
    });

    store.setState({ activeFilter: 'Equipment', page: 1 });

    await vi.waitFor(() => {
      expect(getFiltersMock).toHaveBeenCalledTimes(2);
    });
    expect(getFiltersMock).toHaveBeenLastCalledWith(
      { filter: 'Equipment', page: 1 },
      { loader: 'silent' },
    );
  });
});

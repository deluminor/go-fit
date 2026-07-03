import { getState, subscribe } from '@/services/store.service.ts';
import type { AppState } from '@/types/app-state.ts';

type IslandListener = [type: string, handler: EventListener];

export interface BindStoreIslandOptions {
  root?: EventTarget | null;
  listeners?: IslandListener[];
}

export function bindStoreIsland(
  sync: (state: Readonly<AppState>) => void,
  { root, listeners = [] }: BindStoreIslandOptions = {},
): () => void {
  const stop = subscribe(sync);

  sync(getState());

  for (const [type, handler] of listeners) {
    root?.addEventListener(type, handler);
  }

  return () => {
    stop();

    for (const [type, handler] of listeners) {
      root?.removeEventListener(type, handler);
    }
  };
}

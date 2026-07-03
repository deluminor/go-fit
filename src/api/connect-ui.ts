import { hideLoader, showLoader } from '@/components/ui/loader/loader.ts';
import { API_EVENT } from '@/constants/api-events.ts';
import { onApiEvent } from '@/utils/api-events.ts';
import { notifyError } from '@/utils/notify.ts';

let connected = false;

export function connectApiUi(): void {
  if (connected) return;
  connected = true;

  onApiEvent(API_EVENT.LOADER_SHOW, (mode) =>
    showLoader(mode as string | undefined),
  );
  onApiEvent(API_EVENT.LOADER_HIDE, (mode) =>
    hideLoader(mode as string | undefined),
  );
  onApiEvent(API_EVENT.NOTIFY_ERROR, (message) =>
    notifyError(message as string),
  );
}

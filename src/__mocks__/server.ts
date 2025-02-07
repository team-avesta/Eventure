import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

const worker = setupWorker();

export const server = {
  listen: () => worker.start({ onUnhandledRequest: 'bypass' }),
  resetHandlers: () => worker.resetHandlers(),
  close: () => worker.stop(),
  use: (...handlers: any[]) => worker.use(...handlers),
};

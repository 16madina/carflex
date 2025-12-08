import { registerPlugin } from '@capacitor/core';

import type { StoreKitPlugin } from './definitions';

const StoreKit = registerPlugin<StoreKitPlugin>('StoreKitPlugin', {
  web: () => import('./web').then(m => new m.StoreKitPluginWeb()),
});

export * from './definitions';
export { StoreKit };

import { WebPlugin } from '@capacitor/core';

import type { StoreKitPlugin, Product, PurchaseResult, Transaction } from './definitions';

export class StoreKitPluginWeb extends WebPlugin implements StoreKitPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async getProducts(options: { productIdentifiers: string[] }): Promise<{ products: Product[] }> {
    console.warn('StoreKit is not available on web');
    throw this.unimplemented('Not implemented on web.');
  }

  async purchaseProduct(options: { productIdentifier: string }): Promise<PurchaseResult> {
    console.warn('StoreKit is not available on web');
    throw this.unimplemented('Not implemented on web.');
  }

  async restorePurchases(): Promise<{ transactions: Transaction[] }> {
    console.warn('StoreKit is not available on web');
    throw this.unimplemented('Not implemented on web.');
  }
}

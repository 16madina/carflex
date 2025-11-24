import { Capacitor, registerPlugin } from '@capacitor/core';
// import { StoreKitPlugin } from 'capacitor-storekit-plugin';

// Example usage
// const result = await StoreKitPlugin.echo({ value: 'test' });
// console.log(result);

// console.log("[StoreKit] storekit.ts loaded ✅");

// 3️⃣ Export the test function
// export const testStoreKitPlugin = async () => {
//   try {
//     const result = await StoreKit.echo({ value: 'Simulator test' });
//     console.log('[StoreKit Test] ✅ Plugin working:', result);
//   } catch (error) {
//     console.error('[StoreKit Test] ❌ Error:', error);
//   }
// };

function serializeError(error: any): string {
  if (!error) return 'Unknown error';
  const errorDetails: any = {
    message: error.message || 'No message',
    code: error.code || 'No code',
    name: error.name || 'Error',
  };
  Object.getOwnPropertyNames(error).forEach(key => {
    if (!errorDetails[key]) errorDetails[key] = error[key];
  });
  if (error.errorMessage) errorDetails.errorMessage = error.errorMessage;
  if (error.data) errorDetails.data = error.data;
  return JSON.stringify(errorDetails, null, 2);
}

function extractCapacitorError(error: any): { code: string; message: string } {
  const code = error?.code || error?.errorCode || error?.data?.code || 'UNKNOWN';
  const message = 
    error?.message || 
    error?.errorMessage || 
    error?.data?.message || 
    error?.localizedDescription || 
    error?.toString?.() || 
    'Unknown error';
  return { code, message };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  currency: string;
}

export interface PurchaseResult {
  transactionId: string;
  productId: string;
  purchaseDate: Date;
  originalTransactionId?: string;
}

interface StoreKitPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  getProducts?(options: { productIdentifiers: string[] }): Promise<{ products: any[] }>;
  purchaseProduct?(options: { productIdentifier: string }): Promise<any>;
  restorePurchases?(): Promise<{ transactions: any[] }>;
}

// 2️⃣ Register the plugin with proper typing
const StoreKit = registerPlugin<StoreKitPlugin>('StoreKitPlugin');

class StoreKitService {
  private isInitialized = false;
  private storeKitPlugin: StoreKitPlugin | null = null;

  async initialize(): Promise<void> {
    if (!this.isIOSPlatform()) return;
    this.storeKitPlugin = StoreKit;
    if (!this.storeKitPlugin) return;
    this.isInitialized = true;
  }

  async getProducts(productIds: string[]): Promise<Product[]> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit not available. Restart the app.');
    }

    try {
      const products = await this.storeKitPlugin.getProducts!({ productIdentifiers: productIds });
      if (!products?.products?.length) throw new Error('No products available');
      return products.products.map((p: any) => ({
        id: p.productIdentifier,
        title: p.localizedTitle,
        description: p.localizedDescription,
        price: p.localizedPrice,
        priceValue: p.price,
        currency: p.priceLocale.currencyCode
      }));
    } catch (error: any) {
      const { message } = extractCapacitorError(error);
      throw new Error(message || 'Failed to fetch products');
    }
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit not available. Test on a real iOS device.');
    }

    try {
      const result = await this.storeKitPlugin.purchaseProduct!({ productIdentifier: productId });
      if (!result?.transactionIdentifier) throw new Error('Invalid transaction');
      return {
        transactionId: result.transactionIdentifier,
        productId: result.productIdentifier,
        purchaseDate: new Date(result.transactionDate),
        originalTransactionId: result.originalTransactionIdentifier
      };
    } catch (error: any) {
      const { code, message } = extractCapacitorError(error);

      if (code === 'E_USER_CANCELLED' || message.toLowerCase().includes('cancel')) throw new Error('CANCELLED');
      if (code === 'E_PAYMENT_INVALID') throw new Error('Invalid product identifier');
      if (code === 'E_PAYMENT_NOT_ALLOWED') throw new Error('Purchases not allowed on this device');
      if (code === 'E_PRODUCT_NOT_AVAILABLE') throw new Error('Product not available in App Store');
      if (code === 'E_NETWORK_ERROR') throw new Error('Network error. Check your connection');
      if (code === 'E_PERMISSION_DENIED') throw new Error('iCloud access denied');
      if (message.includes('not available') || message.includes('unavailable')) throw new Error('StoreKit not available on this device');

      throw new Error(message || 'Purchase failed');
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isInitialized || !this.storeKitPlugin) throw new Error('StoreKit not available');

    try {
      const result = await this.storeKitPlugin.restorePurchases!();
      if (!result?.transactions) return [];
      return result.transactions.map((t: any) => ({
        transactionId: t.transactionIdentifier,
        productId: t.productIdentifier,
        purchaseDate: new Date(t.transactionDate),
        originalTransactionId: t.originalTransactionIdentifier
      }));
    } catch (error: any) {
      const { code, message } = extractCapacitorError(error);
      if (code === 'E_RESTORE_CANCELLED') throw new Error('Restore cancelled by user');
      if (code === 'E_NETWORK_ERROR') throw new Error('Network error. Check your connection');
      if (code === 'E_PERMISSION_DENIED') throw new Error('iCloud access denied');
      throw new Error(message || 'Restore failed');
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && !!this.storeKitPlugin;
  }

  isIOSPlatform(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }
}

export const storeKitService = new StoreKitService();

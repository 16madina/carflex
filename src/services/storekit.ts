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
    console.log('[StoreKit] Initializing service...');
    console.log('[StoreKit] Platform:', Capacitor.getPlatform());
    console.log('[StoreKit] Is Native:', Capacitor.isNativePlatform());
    
    if (!this.isIOSPlatform()) {
      console.warn('[StoreKit] Not on iOS platform, skipping initialization');
      return;
    }
    
    this.storeKitPlugin = StoreKit;
    if (!this.storeKitPlugin) {
      console.error('[StoreKit] Plugin not available');
      return;
    }
    
    this.isInitialized = true;
    console.log('[StoreKit] Service initialized successfully ✅');
    
    try {
      // Test if the plugin is responsive
      console.log('[StoreKit] Testing plugin responsiveness...');
      const testProducts = await this.getProducts(['test_product_id']);
      console.log('[StoreKit] Plugin responsive, test result:', testProducts);
    } catch (error) {
      console.warn('[StoreKit] Plugin test failed (expected for test product):', error);
    }
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
    console.log('[StoreKit] ====== PURCHASE START ======');
    console.log('[StoreKit] Product ID:', productId);
    console.log('[StoreKit] Service initialized:', this.isInitialized);
    console.log('[StoreKit] Plugin available:', !!this.storeKitPlugin);
    
    if (!this.isInitialized || !this.storeKitPlugin) {
      console.error('[StoreKit] Service not ready');
      throw new Error('Les achats ne sont pas disponibles. Redémarrez l\'app.');
    }

    try {
      console.log('[StoreKit] Calling native purchaseProduct...');
      console.log('[StoreKit] Timestamp:', new Date().toISOString());
      
      const result = await this.storeKitPlugin.purchaseProduct!({ productIdentifier: productId });
      
      console.log('[StoreKit] ====== PURCHASE SUCCESS ======');
      console.log('[StoreKit] Result:', JSON.stringify(result, null, 2));
      
      if (!result?.transactionIdentifier) {
        console.error('[StoreKit] Missing transaction identifier in result:', result);
        throw new Error('Transaction invalide - contactez le support');
      }
      
      return {
        transactionId: result.transactionIdentifier,
        productId: result.productIdentifier,
        purchaseDate: new Date(result.transactionDate),
        originalTransactionId: result.originalTransactionIdentifier
      };
    } catch (error: any) {
      console.error('[StoreKit] ====== PURCHASE ERROR ======');
      console.error('[StoreKit] Full error:', serializeError(error));
      const { code, message } = extractCapacitorError(error);
      console.error('[StoreKit] Extracted - Code:', code, 'Message:', message);

      // Gestion des erreurs spécifiques
      if (code === 'E_USER_CANCELLED' || message.toLowerCase().includes('cancel')) {
        console.log('[StoreKit] User cancelled purchase');
        throw new Error('CANCELLED');
      }
      if (code === 'E_PAYMENT_INVALID') throw new Error('Produit invalide - contactez le support');
      if (code === 'E_PAYMENT_NOT_ALLOWED') throw new Error('Les achats ne sont pas autorisés sur cet appareil');
      if (code === 'E_PRODUCT_NOT_AVAILABLE') throw new Error('Ce produit n\'est pas disponible dans l\'App Store');
      if (code === 'E_NETWORK_ERROR') throw new Error('Erreur réseau - vérifiez votre connexion');
      if (code === 'E_PERMISSION_DENIED') throw new Error('Accès iCloud refusé - vérifiez vos réglages');
      if (message.includes('not available') || message.includes('unavailable')) {
        throw new Error('StoreKit indisponible sur cet appareil');
      }

      throw new Error(message || 'Achat échoué - veuillez réessayer');
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

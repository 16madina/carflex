import { Capacitor } from '@capacitor/core';

/**
 * Service pour gérer les achats in-app iOS avec StoreKit natif
 * Compatible avec le fichier Products.storekit
 */

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

class StoreKitService {
  private isInitialized = false;
  private storeKitPlugin: any = null;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[StoreKit] Not on iOS platform, skipping initialization');
      return;
    }

    try {
      // Enregistrer le plugin StoreKit natif
      this.storeKitPlugin = (window as any).StoreKit;
      
      if (!this.storeKitPlugin) {
        console.warn('[StoreKit] Plugin non disponible - utiliser XCode pour tester');
        return;
      }

      console.log('[StoreKit] Service initialisé');
      this.isInitialized = true;
    } catch (error) {
      console.error('[StoreKit] Erreur initialisation:', error);
      throw error;
    }
  }

  async getProducts(productIds: string[]): Promise<Product[]> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      console.warn('[StoreKit] Service non initialisé');
      return [];
    }

    try {
      const products = await this.storeKitPlugin.getProducts({ 
        productIdentifiers: productIds 
      });
      
      return products.products.map((p: any) => ({
        id: p.productIdentifier,
        title: p.localizedTitle,
        description: p.localizedDescription,
        price: p.localizedPrice,
        priceValue: p.price,
        currency: p.priceLocale.currencyCode
      }));
    } catch (error) {
      console.error('[StoreKit] Erreur récupération produits:', error);
      return [];
    }
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit non disponible. Veuillez tester sur un appareil iOS réel ou simulateur XCode.');
    }

    try {
      console.log('[StoreKit] Achat du produit:', productId);
      
      const result = await this.storeKitPlugin.purchaseProduct({ 
        productIdentifier: productId 
      });
      
      console.log('[StoreKit] Achat réussi:', result);
      
      return {
        transactionId: result.transactionIdentifier,
        productId: result.productIdentifier,
        purchaseDate: new Date(result.transactionDate),
        originalTransactionId: result.originalTransactionIdentifier
      };
    } catch (error: any) {
      console.error('[StoreKit] Erreur achat:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
        throw new Error('Achat annulé');
      }
      
      throw error;
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit non disponible');
    }

    try {
      console.log('[StoreKit] Restauration des achats...');
      
      const result = await this.storeKitPlugin.restorePurchases();
      
      return result.transactions.map((t: any) => ({
        transactionId: t.transactionIdentifier,
        productId: t.productIdentifier,
        purchaseDate: new Date(t.transactionDate),
        originalTransactionId: t.originalTransactionIdentifier
      }));
    } catch (error) {
      console.error('[StoreKit] Erreur restauration:', error);
      throw error;
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

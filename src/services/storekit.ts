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
      throw new Error('StoreKit n\'est pas disponible. Veuillez redémarrer l\'application.');
    }

    try {
      console.log('[StoreKit] Récupération des produits:', productIds);
      const products = await this.storeKitPlugin.getProducts({ 
        productIdentifiers: productIds 
      });
      
      if (!products || !products.products || products.products.length === 0) {
        throw new Error('Aucun produit disponible');
      }

      console.log('[StoreKit] Produits récupérés:', products.products.length);
      return products.products.map((p: any) => ({
        id: p.productIdentifier,
        title: p.localizedTitle,
        description: p.localizedDescription,
        price: p.localizedPrice,
        priceValue: p.price,
        currency: p.priceLocale.currencyCode
      }));
    } catch (error: any) {
      console.error('[StoreKit] Erreur récupération produits:', error);
      throw new Error(error.message || 'Impossible de récupérer les produits disponibles');
    }
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit non disponible. Veuillez tester sur un appareil iOS réel ou simulateur XCode.');
    }

    try {
      console.log('[StoreKit] Démarrage de l\'achat:', productId);
      
      const result = await this.storeKitPlugin.purchaseProduct({ 
        productIdentifier: productId 
      });
      
      if (!result || !result.transactionIdentifier) {
        throw new Error('Transaction invalide');
      }
      
      console.log('[StoreKit] Achat réussi:', result);
      
      return {
        transactionId: result.transactionIdentifier,
        productId: result.productIdentifier,
        purchaseDate: new Date(result.transactionDate),
        originalTransactionId: result.originalTransactionIdentifier
      };
    } catch (error: any) {
      console.error('[StoreKit] Erreur achat:', error);
      
      if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
        throw new Error('CANCELLED');
      }
      
      if (error.code === 'E_PAYMENT_INVALID') {
        throw new Error('Méthode de paiement invalide');
      }
      
      if (error.code === 'E_NETWORK_ERROR') {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet');
      }
      
      throw new Error(error.message || 'Erreur lors de l\'achat');
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isInitialized || !this.storeKitPlugin) {
      throw new Error('StoreKit non disponible');
    }

    try {
      console.log('[StoreKit] Restauration des achats...');
      
      const result = await this.storeKitPlugin.restorePurchases();
      
      if (!result || !result.transactions) {
        return [];
      }

      console.log('[StoreKit] Achats restaurés:', result.transactions.length);
      
      return result.transactions.map((t: any) => ({
        transactionId: t.transactionIdentifier,
        productId: t.productIdentifier,
        purchaseDate: new Date(t.transactionDate),
        originalTransactionId: t.originalTransactionIdentifier
      }));
    } catch (error: any) {
      console.error('[StoreKit] Erreur restauration:', error);
      throw new Error(error.message || 'Erreur lors de la restauration des achats');
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

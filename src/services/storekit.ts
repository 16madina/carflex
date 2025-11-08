import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Service pour gérer les achats in-app iOS avec StoreKit natif
 * Compatible avec le fichier Products.storekit
 */

// Helper pour sérialiser les erreurs de manière lisible
function serializeError(error: any): string {
  if (!error) return 'Unknown error';
  
  const errorDetails: any = {
    message: error.message || 'No message',
    code: error.code || 'No code',
    name: error.name || 'Error',
  };
  
  // Extraire toutes les propriétés non-héritées
  Object.getOwnPropertyNames(error).forEach(key => {
    if (!errorDetails[key]) {
      errorDetails[key] = error[key];
    }
  });
  
  return JSON.stringify(errorDetails, null, 2);
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

// Interface TypeScript pour le plugin StoreKit
export interface StoreKitPlugin {
  getProducts(options: { productIdentifiers: string[] }): Promise<{ products: any[] }>;
  purchaseProduct(options: { productIdentifier: string }): Promise<any>;
  restorePurchases(): Promise<{ transactions: any[] }>;
}

// Enregistrer le plugin avec Capacitor
const StoreKit = registerPlugin<StoreKitPlugin>('StoreKit');

class StoreKitService {
  private isInitialized = false;
  private storeKitPlugin: StoreKitPlugin | null = null;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[StoreKit] Not on iOS platform, skipping initialization');
      return;
    }

    try {
      // Utiliser le plugin enregistré
      this.storeKitPlugin = StoreKit;
      
      if (!this.storeKitPlugin) {
        console.warn('[StoreKit] Plugin non disponible - utiliser XCode pour tester');
        return;
      }

      console.log('[StoreKit] Service initialisé avec registerPlugin');
      this.isInitialized = true;
    } catch (error: any) {
      console.error('[StoreKit] Erreur initialisation:', serializeError(error));
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
      console.error('[StoreKit] Erreur récupération produits:');
      console.error(serializeError(error));
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
      console.error('[StoreKit] Erreur achat - Détails complets:');
      console.error(serializeError(error));
      console.error('[StoreKit] Type d\'erreur:', typeof error);
      console.error('[StoreKit] Constructeur:', error?.constructor?.name);
      
      // Extraire le code et le message de l'erreur
      const errorCode = error?.code || error?.errorCode || 'UNKNOWN';
      const errorMessage = error?.message || error?.localizedDescription || error?.toString() || 'Erreur inconnue';
      
      console.error('[StoreKit] Code erreur extrait:', errorCode);
      console.error('[StoreKit] Message erreur extrait:', errorMessage);
      
      if (errorCode === 'E_USER_CANCELLED' || errorMessage.toLowerCase().includes('cancel')) {
        throw new Error('CANCELLED');
      }
      
      if (errorCode === 'E_PAYMENT_INVALID' || errorMessage.includes('payment')) {
        throw new Error('Méthode de paiement invalide');
      }
      
      if (errorCode === 'E_NETWORK_ERROR' || errorMessage.includes('network')) {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet');
      }
      
      // Si StoreKit n'est pas disponible
      if (errorMessage.includes('not available') || errorMessage.includes('unavailable')) {
        throw new Error('StoreKit non disponible. Veuillez tester sur un appareil iOS réel avec XCode.');
      }
      
      throw new Error(errorMessage || 'Erreur lors de l\'achat');
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
      console.error('[StoreKit] Erreur restauration:');
      console.error(serializeError(error));
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

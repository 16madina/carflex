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
  
  // Tenter d'extraire les propriétés Capacitor
  if (error.errorMessage) errorDetails.errorMessage = error.errorMessage;
  if (error.data) errorDetails.data = error.data;
  
  return JSON.stringify(errorDetails, null, 2);
}

// Helper pour extraire les informations d'erreur Capacitor
function extractCapacitorError(error: any): { code: string; message: string } {
  // Capacitor envoie les erreurs avec une structure spécifique
  const code = error?.code || error?.errorCode || error?.data?.code || 'UNKNOWN';
  const message = 
    error?.message || 
    error?.errorMessage || 
    error?.data?.message || 
    error?.localizedDescription || 
    error?.toString?.() || 
    'Erreur inconnue';
  
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
      console.error('[StoreKit] ===== ERREUR RÉCUPÉRATION PRODUITS =====');
      console.error('[StoreKit] Erreur brute:', error);
      console.error('[StoreKit] Erreur sérialisée:', serializeError(error));
      
      // Extraire les informations structurées de l'erreur Capacitor
      const { code, message } = extractCapacitorError(error);
      
      console.error('[StoreKit] Code extrait:', code);
      console.error('[StoreKit] Message extrait:', message);
      console.error('[StoreKit] =======================================');
      
      throw new Error(message || 'Impossible de récupérer les produits disponibles');
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
      console.error('[StoreKit] ===== ERREUR ACHAT =====');
      console.error('[StoreKit] Erreur brute:', error);
      console.error('[StoreKit] Erreur sérialisée:', serializeError(error));
      
      // Extraire les informations structurées de l'erreur Capacitor
      const { code, message } = extractCapacitorError(error);
      
      console.error('[StoreKit] Code extrait:', code);
      console.error('[StoreKit] Message extrait:', message);
      console.error('[StoreKit] ========================');
      
      // Gérer les différents types d'erreur
      if (code === 'E_USER_CANCELLED' || message.toLowerCase().includes('cancel')) {
        throw new Error('CANCELLED');
      }
      
      if (code === 'E_PAYMENT_INVALID') {
        throw new Error('L\'identifiant du produit est invalide');
      }
      
      if (code === 'E_PAYMENT_NOT_ALLOWED') {
        throw new Error('Les achats ne sont pas autorisés sur cet appareil. Vérifiez vos réglages iOS.');
      }
      
      if (code === 'E_PRODUCT_NOT_AVAILABLE') {
        throw new Error('Le produit n\'est pas disponible dans l\'App Store');
      }
      
      if (code === 'E_NETWORK_ERROR' || message.toLowerCase().includes('network')) {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet');
      }
      
      if (code === 'E_PERMISSION_DENIED') {
        throw new Error('Accès refusé aux informations du compte iCloud');
      }
      
      // Si StoreKit n'est pas disponible
      if (message.includes('not available') || message.includes('unavailable')) {
        throw new Error('StoreKit non disponible. Veuillez tester sur un appareil iOS réel avec XCode.');
      }
      
      // Erreur générique avec le message du système
      throw new Error(message || 'Erreur lors de l\'achat');
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
      console.error('[StoreKit] ===== ERREUR RESTAURATION =====');
      console.error('[StoreKit] Erreur brute:', error);
      console.error('[StoreKit] Erreur sérialisée:', serializeError(error));
      
      // Extraire les informations structurées de l'erreur Capacitor
      const { code, message } = extractCapacitorError(error);
      
      console.error('[StoreKit] Code extrait:', code);
      console.error('[StoreKit] Message extrait:', message);
      console.error('[StoreKit] ==============================');
      
      // Gérer les différents types d'erreur
      if (code === 'E_RESTORE_CANCELLED' || message.toLowerCase().includes('cancel')) {
        throw new Error('Restauration annulée par l\'utilisateur');
      }
      
      if (code === 'E_NETWORK_ERROR' || message.toLowerCase().includes('network')) {
        throw new Error('Erreur réseau. Vérifiez votre connexion internet');
      }
      
      if (code === 'E_PERMISSION_DENIED') {
        throw new Error('Accès refusé aux informations du compte iCloud');
      }
      
      // Erreur générique avec le message du système
      throw new Error(message || 'Erreur lors de la restauration des achats');
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

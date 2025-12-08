export interface StoreKitPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  getProducts(options: { productIdentifiers: string[] }): Promise<{ products: Product[] }>;
  purchaseProduct(options: { productIdentifier: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ transactions: Transaction[] }>;
}

export interface Product {
  productIdentifier: string;
  localizedTitle: string;
  localizedDescription: string;
  price: number;
  localizedPrice: string;
  priceLocale: {
    currencyCode: string;
  };
}

export interface PurchaseResult {
  transactionIdentifier: string;
  productIdentifier: string;
  transactionDate: number;
  originalTransactionIdentifier: string;
}

export interface Transaction {
  transactionIdentifier: string;
  productIdentifier: string;
  transactionDate: number;
  originalTransactionIdentifier: string;
}

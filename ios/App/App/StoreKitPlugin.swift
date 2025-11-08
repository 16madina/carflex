import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, SKProductsRequestDelegate, SKPaymentTransactionObserver {
    private var productsRequest: SKProductsRequest?
    private var productsCallbackId: String?
    private var purchaseCallbackId: String?
    
    @objc override public func load() {
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIdentifiers", String.self) else {
            call.reject("Invalid product identifiers")
            return
        }
        
        let productIdentifiers = Set(productIds)
        productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
        productsRequest?.delegate = self
        productsCallbackId = call.callbackId
        productsRequest?.start()
    }
    
    @objc func purchaseProduct(_ call: CAPPluginCall) {
        guard let productId = call.getString("productIdentifier") else {
            call.reject("Invalid product identifier")
            return
        }
        
        // Vérifier si les achats sont autorisés
        guard SKPaymentQueue.canMakePayments() else {
            call.reject("Purchases not allowed")
            return
        }
        
        purchaseCallbackId = call.callbackId
        
        // Récupérer le produit
        let productIdentifiers = Set([productId])
        productsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
        productsRequest?.delegate = self
        productsRequest?.start()
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        purchaseCallbackId = call.callbackId
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    // MARK: - SKProductsRequestDelegate
    
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        let products = response.products.map { product -> [String: Any] in
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = product.priceLocale
            
            return [
                "productIdentifier": product.productIdentifier,
                "localizedTitle": product.localizedTitle,
                "localizedDescription": product.localizedDescription,
                "price": product.price.doubleValue,
                "localizedPrice": formatter.string(from: product.price) ?? "",
                "priceLocale": [
                    "currencyCode": product.priceLocale.currencyCode ?? ""
                ]
            ]
        }
        
        if let callbackId = productsCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.resolve(["products": products])
            productsCallbackId = nil
        } else if let callbackId = purchaseCallbackId, let product = response.products.first {
            // Lancer l'achat
            let payment = SKPayment(product: product)
            SKPaymentQueue.default().add(payment)
        }
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        if let callbackId = productsCallbackId ?? purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.reject("Request failed: \(error.localizedDescription)")
            productsCallbackId = nil
            purchaseCallbackId = nil
        }
    }
    
    // MARK: - SKPaymentTransactionObserver
    
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .failed:
                handleFailed(transaction)
            case .restored:
                handleRestored(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        if let callbackId = purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.resolve([
                "transactionIdentifier": transaction.transactionIdentifier ?? "",
                "productIdentifier": transaction.payment.productIdentifier,
                "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0,
                "originalTransactionIdentifier": transaction.original?.transactionIdentifier ?? ""
            ])
            purchaseCallbackId = nil
        }
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        if let callbackId = purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            
            if let error = transaction.error as? SKError {
                if error.code == .paymentCancelled {
                    call?.reject("User cancelled", "E_USER_CANCELLED")
                } else {
                    call?.reject("Purchase failed: \(error.localizedDescription)")
                }
            } else {
                call?.reject("Purchase failed")
            }
            purchaseCallbackId = nil
        }
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    public func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        if let callbackId = purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            
            let transactions = queue.transactions.map { transaction -> [String: Any] in
                return [
                    "transactionIdentifier": transaction.transactionIdentifier ?? "",
                    "productIdentifier": transaction.payment.productIdentifier,
                    "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0,
                    "originalTransactionIdentifier": transaction.original?.transactionIdentifier ?? ""
                ]
            }
            
            call?.resolve(["transactions": transactions])
            purchaseCallbackId = nil
        }
    }
    
    public func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        if let callbackId = purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.reject("Restore failed: \(error.localizedDescription)")
            purchaseCallbackId = nil
        }
    }
}

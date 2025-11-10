//import Foundation
//import Capacitor
//import StoreKit
//
//@objc(StoreKitPlugin)
//public class StoreKitPlugin: CAPPlugin {
//    @objc func echo(_ call: CAPPluginCall) {
//        let value = call.getString("value") ?? ""
//        print("✅ StoreKit Plugin Echo:", value)
//        call.resolve(["value": "Native iOS StoreKit plugin connected successfully"])
//    }
//}


import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, SKProductsRequestDelegate, SKPaymentTransactionObserver {
    
    private var productsRequest: SKProductsRequest?
    private var productsCallbackId: String?
    private var purchaseCallbackId: String?
    
    // MARK: - Plugin Lifecycle
    
    @objc override public func load() {
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    // MARK: - Plugin Methods
    
    @objc func echo(_ call: CAPPluginCall) {
        call.resolve(["value": "Native iOS StoreKit plugin connected successfully"])
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIdentifiers", String.self) else {
            call.reject("Invalid product identifiers")
            return
        }
        
        productsRequest = SKProductsRequest(productIdentifiers: Set(productIds))
        productsRequest?.delegate = self
        productsCallbackId = call.callbackId
        productsRequest?.start()
    }
    
    @objc func purchaseProduct(_ call: CAPPluginCall) {
        guard let productId = call.getString("productIdentifier") else {
            call.reject("Invalid product identifier")
            return
        }
        
        guard SKPaymentQueue.canMakePayments() else {
            call.reject("Purchases not allowed")
            return
        }
        
        purchaseCallbackId = call.callbackId
        productsRequest = SKProductsRequest(productIdentifiers: Set([productId]))
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
                "priceLocale": ["currencyCode": product.priceLocale.currencyCode ?? ""]
            ]
        }
        
        if let callbackId = productsCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.resolve(["products": products])
            productsCallbackId = nil
        } else if let callbackId = purchaseCallbackId, let product = response.products.first {
            let payment = SKPayment(product: product)
            SKPaymentQueue.default().add(payment)
        }
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        if let callbackId = productsCallbackId ?? purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            call?.reject("StoreKit request failed: \(error.localizedDescription)", "E_REQUEST_FAILED", error)
            productsCallbackId = nil
            purchaseCallbackId = nil
        }
    }
    
    // MARK: - SKPaymentTransactionObserver
    
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased: handlePurchased(transaction)
            case .failed: handleFailed(transaction)
            case .restored: handleRestored(transaction)
            case .deferred, .purchasing: break
            @unknown default: break
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
                let (code, message): (String, String)
                switch error.code {
                case .paymentCancelled: (code, message) = ("E_USER_CANCELLED", "User cancelled the purchase")
                case .paymentInvalid: (code, message) = ("E_PAYMENT_INVALID", "Invalid purchase identifier")
                case .paymentNotAllowed: (code, message) = ("E_PAYMENT_NOT_ALLOWED", "Device not allowed to make purchases")
                case .storeProductNotAvailable: (code, message) = ("E_PRODUCT_NOT_AVAILABLE", "Product not available")
                case .cloudServiceNetworkConnectionFailed: (code, message) = ("E_NETWORK_ERROR", "Network error")
                case .cloudServicePermissionDenied: (code, message) = ("E_PERMISSION_DENIED", "Cloud service access denied")
                default: (code, message) = ("E_PURCHASE_FAILED", error.localizedDescription)
                }
                call?.reject(message, code, error)
            } else if let error = transaction.error {
                call?.reject("Purchase failed: \(error.localizedDescription)", "E_UNKNOWN_ERROR", error)
            } else {
                call?.reject("Purchase failed with unknown error", "E_UNKNOWN_ERROR", nil)
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
            let transactions = queue.transactions.map { t in
                [
                    "transactionIdentifier": t.transactionIdentifier ?? "",
                    "productIdentifier": t.payment.productIdentifier,
                    "transactionDate": t.transactionDate?.timeIntervalSince1970 ?? 0,
                    "originalTransactionIdentifier": t.original?.transactionIdentifier ?? ""
                ]
            }
            call?.resolve(["transactions": transactions])
            purchaseCallbackId = nil
        }
    }
    
    public func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        if let callbackId = purchaseCallbackId {
            let call = bridge?.savedCall(withID: callbackId)
            let (code, message): (String, String)
            if let skError = error as? SKError {
                switch skError.code {
                case .paymentCancelled: (code, message) = ("E_RESTORE_CANCELLED", "Restore cancelled by user")
                case .cloudServiceNetworkConnectionFailed: (code, message) = ("E_NETWORK_ERROR", "Network error during restore")
                case .cloudServicePermissionDenied: (code, message) = ("E_PERMISSION_DENIED", "Cloud service access denied")
                default: (code, message) = ("E_RESTORE_FAILED", "Restore failed: \(skError.localizedDescription)")
                }
            } else {
                (code, message) = ("E_RESTORE_FAILED", "Restore failed: \(error.localizedDescription)")
            }
            call?.reject(message, code, error)
            purchaseCallbackId = nil
        }
    }
}


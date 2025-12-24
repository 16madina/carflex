#import <Capacitor/Capacitor.h>

// Permet à Objective‑C de voir la classe Swift @objc(StoreKitPlugin)
#if __has_include("App-Swift.h")
#import "App-Swift.h"
#endif

// Register the StoreKit plugin with Capacitor
CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getProducts, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(purchaseProduct, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(restorePurchases, CAPPluginReturnPromise);
)

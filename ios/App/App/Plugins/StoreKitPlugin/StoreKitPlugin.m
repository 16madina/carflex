#import <Capacitor/Capacitor.h>

// Register the StoreKit plugin with Capacitor
// Note: Ne PAS importer App-Swift.h ici - CAP_PLUGIN gère l'enregistrement
CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getProducts, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(purchaseProduct, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(restorePurchases, CAPPluginReturnPromise);
)

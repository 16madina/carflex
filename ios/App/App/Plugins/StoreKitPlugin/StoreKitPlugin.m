//#import <Capacitor/Capacitor.h>
//
//CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
//           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
//)

#import <Capacitor/Capacitor.h>

// Register the StoreKit plugin with Capacitor
CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getProducts, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(purchaseProduct, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(restorePurchases, CAPPluginReturnPromise);
)


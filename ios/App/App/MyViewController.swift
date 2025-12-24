import UIKit
import Capacitor

@objc(MyViewController)
class MyViewController: CAPBridgeViewController {
    
    override open func capacitorDidLoad() {
        // Register the StoreKit plugin manually
        bridge?.registerPluginInstance(StoreKitPlugin())
        print("[MyViewController] StoreKitPlugin registered successfully ✅")
    }
}

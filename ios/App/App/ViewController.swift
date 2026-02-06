import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Register StoreKitPlugin after the bridge is ready
        registerCustomPlugins()
    }
    
    private func registerCustomPlugins() {
        // Register StoreKitPlugin instance
        if let bridge = self.bridge {
            let storeKitPlugin = StoreKitPlugin()
            bridge.registerPluginInstance(storeKitPlugin)
            print("[ViewController] StoreKitPlugin registered successfully ✅")
        } else {
            print("[ViewController] ⚠️ Bridge not available, will retry...")
            // Retry after a short delay if bridge is not ready
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                self?.registerCustomPlugins()
            }
        }
    }
}

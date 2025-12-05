# 🔧 StoreKit Sandbox - Issues & Fixes

## 🔍 Diagnostics Summary

After analyzing your StoreKit sandbox configuration, here are the issues preventing it from working:

### ❌ Critical Issues

1. **Missing Podspec File**
   - File: `ios/StoreKitPlugin.podspec`
   - Status: **NOT FOUND**
   - Impact: CocoaPods cannot find and link the StoreKit plugin

2. **Plugin Not in Podfile**
   - File: `ios/App/Podfile`
   - Status: Missing reference to StoreKitPlugin
   - Impact: Plugin won't be compiled into the app

3. **Pods Not Installed**
   - Directory: `ios/App/Pods/StoreKitPlugin`
   - Status: **MISSING**
   - Impact: Plugin code not linked to Xcode project

4. **Missing StoreKit Configuration File**
   - File: `*.storekit` configuration file for testing
   - Status: **NOT FOUND**
   - Impact: Cannot test in-app purchases locally in Xcode

### ✅ What's Working

- ✅ Plugin source files exist:
  - `ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift`
  - `ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m`
- ✅ Bridging header correctly configured
- ✅ Capacitor dependencies installed
- ✅ Plugin properly registered with Capacitor

---

## 🛠️ Fix Instructions (Run on macOS)

### Step 1: Run the Setup Script

The easiest way to fix everything is to run the provided setup script:

```bash
# Make the script executable
chmod +x setup-storekit-plugin.sh

# Run the setup script
./setup-storekit-plugin.sh
```

This script will:
1. ✅ Create the missing `ios/StoreKitPlugin.podspec` file
2. ✅ Update `ios/App/Podfile` to reference the plugin
3. ✅ Run `pod install` to integrate the plugin
4. ✅ Clean Xcode derived data

### Step 2: Create StoreKit Configuration File

You need to create a `.storekit` file for testing in Xcode:

1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode:
   - Go to **File** → **New** → **File...**
   - Search for **"StoreKit Configuration File"**
   - Name it: `CarFlexStoreKit.storekit` or `Products.storekit`
   - Save it in the `ios/App` directory
   - Make sure it's added to the **App** target

3. Add your products to the `.storekit` file:
   - Click **"+"** → **"Add Subscription Group"**
   - Add your subscription products with the correct Product IDs
   - Example: `com.missdee.carflextest.pro.monthly`

### Step 3: Enable StoreKit Testing in Xcode

1. In Xcode, go to **Product** → **Scheme** → **Edit Scheme...**
2. Select **Run** in the left sidebar
3. Go to the **Options** tab
4. Under **StoreKit Configuration**, select your `.storekit` file
5. Click **Close**

### Step 4: Sync and Build

```bash
# Sync Capacitor
npx cap sync ios

# Build and run
npx cap run ios
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "StoreKitPlugin plugin is not implemented on ios"

**Cause:** Plugin not properly linked via CocoaPods

**Solution:**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

### Issue 2: "Product not found" in StoreKit

**Cause:** Product IDs in `.storekit` don't match your code

**Solution:**
- Open the `.storekit` file in Xcode
- Verify Product IDs match exactly (e.g., `com.missdee.carflextest.pro.monthly`)
- Check that products are marked as **"Cleared for Sale"**

### Issue 3: "Unable to purchase" or crashes

**Cause:** StoreKit Testing not enabled in scheme

**Solution:**
- Edit Scheme → Run → Options
- Select your `.storekit` file under StoreKit Configuration

### Issue 4: CocoaPods errors

**Cause:** Corrupted pods or cache

**Solution:**
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod repo update
pod install
cd ../..
```

### Issue 5: Bridging header errors

**Cause:** Missing or incorrect bridging header

**Solution:**
The bridging header at `ios/App/App/App-Bridging-Header.h` should contain:
```objc
#import <Capacitor/Capacitor.h>
```

And in Xcode Build Settings:
- Search for "Bridging Header"
- Set to: `App/App-Bridging-Header.h`

---

## 📋 Verification Checklist

After running the fixes, verify everything works:

```bash
# Run the verification script
./verify-storekit-plugin.sh
```

You should see:
- ✅ All plugin files present
- ✅ Podspec exists and is valid
- ✅ Plugin referenced in Podfile
- ✅ Pods installed (Podfile.lock updated)
- ✅ CocoaPods installed
- ✅ @capacitor/ios installed

---

## 🧪 Testing StoreKit in Sandbox

Once everything is set up:

### Local Testing (Simulator)

1. **Launch the app:**
   ```bash
   npx cap run ios
   ```

2. **Test a purchase:**
   - Navigate to the subscription or premium features page
   - Click "Purchase" or "Subscribe"
   - A StoreKit dialog should appear
   - Click "Subscribe" (free in test mode)

3. **Check Xcode Console:**
   You should see logs like:
   ```
   [StoreKit] Service initialized
   [StoreKit] Starting purchase...
   [StoreKit] Purchase successful
   ```

4. **Manage Transactions:**
   - In Xcode: **Debug** → **StoreKit** → **Manage Transactions...**
   - View, refund, or expire test purchases

### Sandbox Testing (Real Device)

1. **Create Sandbox Tester:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - **Users and Access** → **Sandbox Testers**
   - Create a new tester

2. **On iOS Device:**
   - Sign out of App Store (Settings → App Store)
   - Launch your app
   - Attempt a purchase
   - Sign in with the sandbox tester account when prompted

3. **Verify Backend:**
   - Check that purchases are verified by your backend
   - Look at logs in your edge function `verify-ios-purchase`

---

## 📱 What to Check in Your Code

### Product IDs

Make sure your Product IDs are consistent everywhere:

**In your code** (e.g., `src/services/storekit.ts`):
```typescript
const PRODUCT_IDS = {
  PRO_MONTHLY: 'com.missdee.carflextest.pro.monthly',
  // ... other products
};
```

**In `.storekit` file:**
- Product ID must match exactly

**In App Store Connect (Production):**
- Create products with the same IDs

### Bundle Identifier

Verify your Bundle ID is consistent:

**In `capacitor.config.ts`:**
```typescript
appId: 'com.missdee.carflextest', // or your actual bundle ID
```

**In Xcode:**
- Target → General → Bundle Identifier

**In `.storekit` file:**
- Each product should use the same Bundle ID

---

## 🚀 Quick Fix Summary (TL;DR)

If you just want to fix it quickly on macOS:

```bash
# 1. Run setup script
./setup-storekit-plugin.sh

# 2. Sync Capacitor
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
#    - Create .storekit file (File → New → StoreKit Configuration)
#    - Add your products
#    - Enable in scheme (Product → Scheme → Edit → Options → StoreKit Configuration)

# 5. Build and run
npx cap run ios
```

---

## 📚 Additional Resources

- **Setup Guide:** `README_STOREKIT.md`
- **Testing Guide:** `STOREKIT_TESTING_GUIDE.md`
- **Native Setup:** `IOS_STOREKIT_NATIVE_SETUP.md`
- **Apple Docs:** [StoreKit Testing in Xcode](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)

---

## 🆘 Still Not Working?

If you've followed all steps and it's still not working:

1. **Check Xcode Console:** Look for error messages
2. **Check Logs:** 
   - Plugin logs: Search for `[StoreKit]` in console
   - Backend logs: Check your edge function logs
3. **Clean Everything:**
   ```bash
   # Clean iOS
   cd ios/App
   rm -rf Pods Podfile.lock
   rm -rf ~/Library/Developer/Xcode/DerivedData
   pod install
   cd ../..
   
   # Clean and rebuild
   npm run build
   npx cap sync ios
   npx cap run ios
   ```

4. **Verify in Transaction Manager:**
   - Xcode → Debug → StoreKit → Manage Transactions
   - Clear all transactions and try again

---

## ✅ Expected Result

After fixing everything, you should be able to:

- ✅ Launch the app without plugin errors
- ✅ See products loaded from StoreKit
- ✅ Complete test purchases in simulator
- ✅ See transactions in Xcode Transaction Manager
- ✅ Backend verification working (check logs)
- ✅ Subscriptions/premium features activated

Good luck! 🚀

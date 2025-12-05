# 🚀 Fix StoreKit Sandbox - Step by Step Guide

## ✅ Files I've Already Fixed

I've created/updated these files for you:

1. ✅ **Created:** `ios/StoreKitPlugin.podspec` - The missing podspec file
2. ✅ **Updated:** `ios/App/Podfile` - Added StoreKit plugin reference
3. ✅ **Created:** `STOREKIT_SANDBOX_FIX.md` - Detailed diagnostics and troubleshooting

---

## 🎯 What You Need to Do on Your Mac

### Step 1: Pull the Latest Changes

```bash
# Pull the changes with the fixed files
git pull origin main  # or your current branch

# Or if you're working on a different branch
git pull origin genspark_ai_developer
```

### Step 2: Install CocoaPods (If Not Already Installed)

```bash
# Check if CocoaPods is installed
pod --version

# If not installed, install it:
sudo gem install cocoapods

# If you get permission errors, try:
gem install cocoapods --user-install
```

### Step 3: Install the Pods

```bash
# Navigate to the iOS App directory
cd ios/App

# Clean any existing pods
rm -rf Pods Podfile.lock

# Install pods (this will integrate the StoreKit plugin)
pod install

# Go back to project root
cd ../..
```

You should see output like:
```
Installing StoreKitPlugin (1.0.0)
Installing Capacitor (...)
...
Pod installation complete!
```

### Step 4: Create StoreKit Configuration File

This is the **critical missing piece** for sandbox testing:

1. **Open Xcode:**
   ```bash
   npx cap open ios
   ```

2. **Create the StoreKit Configuration:**
   - In Xcode menu: **File** → **New** → **File...**
   - Type "storekit" in the search
   - Select **"StoreKit Configuration File"**
   - Click **Next**

3. **Name it:**
   - File name: `CarFlexStoreKit.storekit` (or `Products.storekit`)
   - Save location: `ios/App` directory
   - ✅ Check "Add to targets: App"
   - Click **Create**

4. **Add Your Products:**

   In the visual editor that opens:

   **For Subscription (Pro Monthly):**
   - Click **"+"** button at bottom left
   - Select **"Add Subscription Group"**
   - Group Name: `CarFlex Subscriptions`
   - Click **"+"** inside the group
   - Select **"Add Auto-Renewable Subscription"**
   
   Configure the subscription:
   ```
   Product ID: com.missdee.carflextest.pro.monthly
   Reference Name: Pro Monthly
   Price: 2.99 (or your price)
   Subscription Duration: 1 Month
   ```

   Add Localization (French):
   - Click **"+"** in Localizations
   - Select **French (fr)**
   - Display Name: `CarFlex Pro - Mensuel`
   - Description: `Abonnement mensuel au plan Pro`

   **For Premium Packages (if applicable):**
   - Click **"+"** → **"Add Consumable"** or **"Add Non-Consumable"**
   - Configure each package:
   ```
   Product ID: premium_package_1 (or your package IDs)
   Reference Name: Premium Package 1
   Price: (your price)
   ```

5. **Save the file** (⌘ + S)

### Step 5: Enable StoreKit Testing

1. **In Xcode:**
   - Menu: **Product** → **Scheme** → **Edit Scheme...**
   - Or press: **⌘ + <** (Command + Less Than)

2. **Configure the scheme:**
   - Select **"Run"** in the left sidebar
   - Click the **"Options"** tab
   - Find **"StoreKit Configuration"**
   - Select your file: **CarFlexStoreKit.storekit**
   - Click **"Close"**

### Step 6: Sync and Build

```bash
# Sync Capacitor with the latest changes
npx cap sync ios

# Build and run on simulator
npx cap run ios
```

Or build directly in Xcode:
- Press **⌘ + R** (Command + R) to build and run

---

## 🧪 Test That It Works

### Test 1: Check Console Logs

When you launch the app, look in the Xcode console (bottom panel) for:

```
✅ GOOD SIGNS:
[Capacitor] Loading app...
🛒 StoreKitPlugin loaded successfully!
[StoreKit] Service initialized
[StoreKit] Can make payments: true

❌ BAD SIGNS:
StoreKitPlugin plugin is not implemented on ios
Plugin StoreKitPlugin not found
```

### Test 2: Try a Purchase

1. Navigate to the subscription or premium features page in your app
2. Click "Subscribe" or "Purchase"
3. You should see a **StoreKit dialog** pop up (Apple's native purchase UI)
4. Click **"Subscribe"** or **"Buy"** (it's free in test mode)
5. Check that the purchase completes successfully

### Test 3: Verify in Transaction Manager

1. In Xcode menu: **Debug** → **StoreKit** → **Manage Transactions...**
2. You should see your test purchases listed
3. Try these actions:
   - **Refund** - Simulate a refund
   - **Expire Subscription** - Force expiration
   - **Clear Purchases** - Reset everything

---

## 🔍 Verify Everything is Set Up

Run the verification script:

```bash
./verify-storekit-plugin.sh
```

Expected output:
```
✅ ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift
✅ ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m
✅ ios/StoreKitPlugin.podspec
✅ ios/App/Podfile
✅ ios/App/App/App-Bridging-Header.h
✅ Podspec valid
✅ Plugin referenced in Podfile
✅ Plugin installed in Podfile.lock
✅ CocoaPods installed
```

---

## 🐛 Troubleshooting

### Problem: "StoreKitPlugin plugin is not implemented"

**Solution:**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
npx cap run ios
```

### Problem: "Unable to find pod named 'StoreKitPlugin'"

**Cause:** Podspec file not found or invalid

**Solution:**
```bash
# Verify the podspec exists
ls -la ios/StoreKitPlugin.podspec

# If missing, git pull the latest changes
git pull origin main

# Then reinstall
cd ios/App
pod install
cd ../..
```

### Problem: Products not appearing in app

**Cause:** Product IDs don't match or StoreKit config not selected

**Solution:**
1. Open `.storekit` file in Xcode
2. Verify Product IDs match exactly with your code
3. Edit Scheme → Options → Verify StoreKit Configuration is selected
4. Rebuild the app

### Problem: Xcode build errors about Swift bridging

**Solution:**
1. In Xcode, select the **App** target
2. Go to **Build Settings** (not Build Phases)
3. Search for: `Objective-C Bridging Header`
4. Set value to: `App/App-Bridging-Header.h`
5. Clean build: **Product** → **Clean Build Folder** (⌘ + Shift + K)
6. Rebuild: **Product** → **Build** (⌘ + B)

### Problem: CocoaPods errors during installation

**Solution:**
```bash
# Update CocoaPods repo
pod repo update

# Clean and reinstall
cd ios/App
rm -rf Pods Podfile.lock
pod deintegrate  # Remove all traces
pod install
cd ../..
```

---

## 📋 Quick Checklist

Before you can test StoreKit in sandbox, verify:

- [ ] CocoaPods is installed (`pod --version`)
- [ ] Podspec file exists: `ios/StoreKitPlugin.podspec`
- [ ] Podfile includes the plugin reference
- [ ] Ran `pod install` successfully
- [ ] Created `.storekit` configuration file in Xcode
- [ ] Added your products to the `.storekit` file
- [ ] Enabled StoreKit Configuration in the scheme
- [ ] Synced Capacitor (`npx cap sync ios`)
- [ ] Built and ran the app (`npx cap run ios`)

---

## 🎉 Expected Result

After completing all steps:

✅ App launches without "StoreKitPlugin not implemented" error
✅ You can navigate to subscription/premium pages
✅ Clicking purchase shows Apple's StoreKit dialog
✅ Purchases complete successfully
✅ Transactions appear in Xcode Transaction Manager
✅ Console shows StoreKit logs

---

## 📞 Need More Help?

If you're still stuck after following these steps:

1. **Check the detailed guide:** `STOREKIT_SANDBOX_FIX.md`
2. **Read the testing guide:** `STOREKIT_TESTING_GUIDE.md`
3. **Check Apple's docs:** [StoreKit Testing](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)

---

## 🚀 Next Steps After It Works

Once StoreKit is working in sandbox:

1. **Test all purchase flows:**
   - Initial purchase
   - Restore purchases
   - Subscription renewal
   - Cancellation handling

2. **Test backend verification:**
   - Check your edge function logs
   - Verify data is saved to Supabase
   - Confirm user status updates correctly

3. **Move to real Sandbox testing:**
   - Create Sandbox tester accounts in App Store Connect
   - Test on a real device with Sandbox account
   - Verify webhooks and notifications

4. **Prepare for production:**
   - Create real products in App Store Connect
   - Submit for App Review
   - Configure production environment

---

Good luck! The main missing piece was the `.storekit` configuration file. Once you create that and enable it in the scheme, everything should work! 🎉

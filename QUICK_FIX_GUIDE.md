# ⚡ StoreKit Sandbox - Quick Fix (5 Minutes)

## 🎯 The Problem
StoreKit not working because:
- ❌ Missing podspec file
- ❌ Plugin not in Podfile  
- ❌ No .storekit test configuration

## 🔧 The Fix (Run on macOS)

### 1. Get the Code (30 seconds)
```bash
git checkout genspark_ai_developer
git pull
```

### 2. Install Pods (2 minutes)
```bash
cd ios/App
pod install    # You should see "Installing StoreKitPlugin (1.0.0)"
cd ../..
```

### 3. Create .storekit File (3 minutes)
```bash
npx cap open ios
```

**In Xcode:**
1. **File** → **New** → **File...**
2. Search: "StoreKit Configuration"
3. Name: `CarFlexStoreKit.storekit`
4. Save in: `ios/App`
5. ✅ Add to target: App

**Add products:**
- Click **+** → **Add Subscription Group**
- Click **+** → **Add Auto-Renewable Subscription**
- Product ID: `com.missdee.carflextest.pro.monthly`
- Price: `2.99 EUR`

**Enable in scheme:**
- **Product** → **Scheme** → **Edit Scheme...**
- **Run** → **Options**
- Select: `CarFlexStoreKit.storekit`

### 4. Build & Test (1 minute)
```bash
npx cap sync ios
npx cap run ios
```

## ✅ Success Check

In Xcode console, you should see:
```
🛒 StoreKitPlugin loaded successfully!
[StoreKit] Service initialized
```

Try a purchase in the app - StoreKit dialog should appear!

## 🆘 Quick Troubleshooting

**Error: "StoreKitPlugin not implemented"**
```bash
cd ios/App && pod install && cd ../.. && npx cap sync ios
```

**Products don't show:**
- Edit Scheme → Options → Verify .storekit file selected
- Clean Build (⌘ + Shift + K)
- Rebuild (⌘ + B)

## 📚 Full Docs

- **Complete Guide:** `FIX_STOREKIT_NOW.md`
- **Summary:** `SUMMARY_STOREKIT_FIX.md`
- **Diagnostics:** `STOREKIT_SANDBOX_FIX.md`

## 🔗 Pull Request

**PR #7:** https://github.com/16madina/carflex/pull/7

---

**That's it!** 5 minutes and StoreKit will be working! 🚀

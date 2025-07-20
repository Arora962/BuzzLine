# Firebase FCM "SERVICE_NOT_AVAILABLE" Error Solutions

## ⚠️ You're getting this specific error: `java.io.IOException: SERVICE_NOT_AVAILABLE`

This error means Firebase Cloud Messaging cannot connect to Google's services. Here are the solutions in order of likelihood:

## 🔧 Immediate Solutions

### 1. **Google Play Services Issue (Most Common)**
- **Problem**: Your device doesn't have Google Play Services or it's outdated
- **Solution**: 
  - Update Google Play Services from Google Play Store
  - If using an emulator, use a Google Play-enabled AVD
  - If using a Chinese phone or custom ROM, install Google Play Services

### 2. **Network/Firewall Issues**
- **Problem**: Network blocking Firebase services
- **Solution**:
  - Try different network (mobile data vs WiFi)
  - Check if corporate firewall is blocking Firebase domains
  - Ensure these domains are accessible:
    - `fcm.googleapis.com`
    - `firebase.googleapis.com`

### 3. **Firebase Project Configuration**
- **Problem**: Incorrect project setup
- **Solution**:
  - Verify `google-services.json` has correct `package_name`: `com.buzzline`
  - Check Firebase Console > Project Settings > Cloud Messaging is enabled
  - Ensure Firebase project is active (not deleted/suspended)

### 4. **Device-Specific Issues**
- **Problem**: Emulator or device limitations
- **Solution**:
  - Test on physical device with Google Play Services
  - If using emulator, create new AVD with Google APIs
  - Enable Google Play Store in emulator settings

## 🏃‍♂️ Quick Test Steps

1. **Check Google Play Services**:
   ```bash
   # Run this on your Android device in Chrome browser
   # Go to: chrome://settings/content/googlePlayServices
   ```

2. **Test Network Connectivity**:
   ```bash
   # Try accessing Firebase from browser on same device
   # https://firebase.google.com/
   ```

3. **Verify App Installation**:
   ```bash
   cd /Users/kriti_arora/Downloads/BuzzLine
   # Clean and rebuild
   cd android && ./gradlew clean && cd ..
   npx react-native run-android
   ```

## 📱 Device Requirements

### Android
- ✅ Google Play Services installed and updated
- ✅ Google Play Store available
- ✅ Not a Chinese ROM (unless GMS installed)
- ✅ Internet connection
- ✅ API level 16+ (Android 4.1+)

### Testing Environment
- ✅ Use Google Play-enabled emulator image
- ✅ Or test on physical device
- ❌ Avoid AOSP emulator images

## 🔍 Advanced Debugging

If the issue persists, run the troubleshooting screen in your app:
1. Tap "Troubleshoot Issues" button when error appears
2. Run diagnostics to see exactly what's failing
3. Follow the specific recommendations provided

## 🆘 Last Resort Solutions

1. **Create new Firebase project** and reconfigure
2. **Use different device** with guaranteed Google Play Services
3. **Check Firebase usage quotas** in console
4. **Contact Firebase support** if project-level issue

---

**Most users resolve this by updating Google Play Services or switching to a device/emulator with Google Play Services installed.**

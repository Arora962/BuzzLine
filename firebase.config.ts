import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration check
export const checkFirebaseConfig = () => {
  try {
    const app = firebase.app();
    console.log('Firebase app initialized successfully:', app.name);
    console.log('Platform:', Platform.OS);
    
    // Check if Firebase is properly configured
    if (!app.options) {
      throw new Error('Firebase configuration is missing');
    }
    
    return true;
  } catch (error) {
    console.error('Firebase configuration error:', error);
    return false;
  }
};

// Initialize Firebase messaging with comprehensive error handling
export const initializeMessaging = async () => {
  try {
    // Check if Firebase is configured
    if (!checkFirebaseConfig()) {
      throw new Error('Firebase is not properly configured');
    }

    // Add delay to let services initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For iOS, register device for remote messages if needed
    if (Platform.OS === 'ios') {
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }
    }

    // Check if user has granted permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      throw new Error('Push messaging permission not granted');
    }

    // Retry logic for token retrieval with exponential backoff
    let token = null;
    let retries = 3;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempting to get FCM token (attempt ${i + 1}/${retries})`);
        token = await messaging().getToken();
        
        if (token) {
          console.log('FCM Token retrieved successfully:', token.substring(0, 50) + '...');
          return token;
        }
        
        throw new Error('Token is null');
      } catch (tokenError) {
        console.warn(`Token retrieval attempt ${i + 1} failed:`, tokenError);
        
        if (i === retries - 1) {
          throw tokenError; // Re-throw on final attempt
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error('Failed to get FCM registration token after all retries');

  } catch (error) {
    console.error('Error initializing messaging:', error);
    
    // Provide specific error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('SERVICE_NOT_AVAILABLE')) {
      throw new Error('Google Play Services not available. Please update Google Play Services and try again.');
    } else if (errorMessage.includes('NETWORK_ERROR')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Check various conditions that might prevent token generation
export const diagnosticCheck = async () => {
  const diagnostics = {
    platform: Platform.OS,
    firebaseConfigured: false,
    messagingAvailable: false,
    permissionsGranted: false,
    playServicesAvailable: false,
    networkConnected: true, // Assume true for now
  };

  try {
    // Check Firebase configuration
    diagnostics.firebaseConfigured = checkFirebaseConfig();

    // Check if messaging service is available
    try {
      await messaging().hasPermission();
      diagnostics.messagingAvailable = true;
    } catch {
      diagnostics.messagingAvailable = false;
    }

    // Check permissions
    const authStatus = await messaging().requestPermission();
    diagnostics.permissionsGranted = 
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // Test Google Play Services availability (Android only)
    if (Platform.OS === 'android') {
      try {
        // Try to get a token as a test for Play Services availability
        const testToken = await Promise.race([
          messaging().getToken(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        diagnostics.playServicesAvailable = !!testToken;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        diagnostics.playServicesAvailable = !errorMessage.includes('SERVICE_NOT_AVAILABLE');
        console.warn('Play Services check failed:', errorMessage);
      }
    } else {
      diagnostics.playServicesAvailable = true; // N/A for iOS
    }

  } catch (error) {
    console.error('Diagnostic check failed:', error);
  }

  console.log('Firebase Diagnostics:', diagnostics);
  return diagnostics;
};

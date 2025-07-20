// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, PermissionsAndroid, ScrollView, TouchableOpacity, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { initializeMessaging, diagnosticCheck } from './firebase.config';
import TroubleshootingScreen from './TroubleshootingScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationScreen from './screens/NotificationScreen';
import { navigationRef, navigate } from './utils/NavigationService'; 

const Stack = createNativeStackNavigator();

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted');
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('BuzzLine needs notification permission!');
    }
  }

  // Request system alert window permission for call overlay
  if (Platform.OS === 'android') {
    try {
      // Note: SYSTEM_ALERT_WINDOW permission needs to be handled differently
      // It requires user to manually enable it in system settings
      Alert.alert(
        'Permission Required',
        'To show incoming calls on lock screen, please enable "Display over other apps" permission in Settings > Apps > BuzzLine > Special app access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } catch (err) {
      console.warn('Error with system alert permission:', err);
    }
  }
}

function openAppNotificationSettings() {
  if (Platform.OS === 'android') {
    Linking.openSettings(); // Triggers app's notification settings
  } else {
    Alert.alert('Unsupported', 'This feature is only supported on Android.');
  }
}

function HomeScreen({ navigation }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const diagnostics = await diagnosticCheck();
        await requestUserPermission();
        const fcmToken = await initializeMessaging();

        if (fcmToken) {
          setToken(fcmToken);
          console.log('Successfully retrieved FCM token');
        } else {
          throw new Error('Token is null or undefined');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error initializing app:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title ?? 'BuzzLine',
        remoteMessage.notification?.body ?? ''
      );
    });

    return unsubscribe;
  }, []);

  if (showTroubleshooting) return <TroubleshootingScreen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📞 BuzzLine</Text>
      <Text style={styles.subtitle}>React Native Push Notification Demo</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={openAppNotificationSettings}
      >
        <Text style={styles.buttonText}>Manage App Permissions & Settings</Text>
      </TouchableOpacity>

      {error && (
        <TouchableOpacity 
          style={styles.troubleshootButton}
          onPress={() => setShowTroubleshooting(true)}
        >
          <Text style={styles.troubleshootButtonText}>🔧 Troubleshoot Issues</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.label}>Your FCM Token:</Text>
      {isLoading ? (
        <Text style={styles.loading}>Initializing Firebase...</Text>
      ) : error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.helpText}>
            Tap "Troubleshoot Issues" above for detailed diagnostics and solutions.
          </Text>
        </View>
      ) : (
        <Text selectable style={styles.token}>{token || 'No token available'}</Text>
      )}
    </ScrollView>
  );
}

export default function App() {
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage.notification);
      navigate('Notification');
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        navigate('Notification');
      }
    });
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 26, fontWeight: 'bold', color: '#1E88E5', marginBottom: 10
  },
  subtitle: {
    fontSize: 16, color: '#666', marginBottom: 30
  },
  label: {
    fontSize: 14, color: '#444', marginBottom: 10
  },
  token: {
    fontSize: 12, color: '#000', padding: 10, backgroundColor: '#f2f2f2', borderRadius: 6
  },
  error: {
    fontSize: 12, color: '#e53e3e', padding: 10, backgroundColor: '#fed7d7',
    borderRadius: 6, textAlign: 'center', marginBottom: 10
  },
  loading: {
    fontSize: 12, color: '#1E88E5', padding: 10, backgroundColor: '#e3f2fd',
    borderRadius: 6, textAlign: 'center'
  },
  troubleshootButton: {
    backgroundColor: '#ff9800', padding: 12, borderRadius: 6, marginBottom: 20
  },
  troubleshootButtonText: {
    color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center'
  },
  helpText: {
    fontSize: 12, 
    color: '#666', 
    textAlign: 'center', 
    fontStyle: 'italic'
  },
  button: {
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 6, 
    marginBottom: 20
  },
  buttonText: {
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600', 
    textAlign: 'center'
  }
});

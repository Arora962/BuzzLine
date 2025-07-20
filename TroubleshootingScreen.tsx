import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { diagnosticCheck, initializeMessaging } from './firebase.config';

export default function TroubleshootingScreen() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await diagnosticCheck();
      setDiagnostics(results);
    } catch (error) {
      Alert.alert('Diagnostic Error', error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  };

  const testTokenRetrieval = async () => {
    try {
      const token = await initializeMessaging();
      Alert.alert('Success!', `Token retrieved: ${token.substring(0, 50)}...`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Token Retrieval Failed', errorMessage);
    }
  };

  const getSolutionForIssue = () => {
    if (!diagnostics) return null;

    const issues = [];
    const solutions = [];

    if (!diagnostics.firebaseConfigured) {
      issues.push('Firebase not configured');
      solutions.push('Check google-services.json file and Firebase project setup');
    }

    if (!diagnostics.messagingAvailable) {
      issues.push('Firebase Messaging not available');
      solutions.push('Ensure Firebase Messaging is properly installed and initialized');
    }

    if (!diagnostics.permissionsGranted) {
      issues.push('Notification permissions not granted');
      solutions.push('Grant notification permissions in device settings');
    }

    if (Platform.OS === 'android' && !diagnostics.playServicesAvailable) {
      issues.push('Google Play Services not available');
      solutions.push('Update Google Play Services from Play Store or use a device with Play Services');
    }

    return { issues, solutions };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 FCM Troubleshooting</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runDiagnostics}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testTokenRetrieval}
      >
        <Text style={styles.buttonText}>Test Token Retrieval</Text>
      </TouchableOpacity>

      {diagnostics && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Diagnostic Results:</Text>
          
          <View style={styles.diagnosticItem}>
            <Text style={styles.label}>Platform:</Text>
            <Text style={styles.value}>{diagnostics.platform}</Text>
          </View>

          <View style={styles.diagnosticItem}>
            <Text style={styles.label}>Firebase Configured:</Text>
            <Text style={[styles.value, diagnostics.firebaseConfigured ? styles.success : styles.error]}>
              {diagnostics.firebaseConfigured ? '✓' : '✗'}
            </Text>
          </View>

          <View style={styles.diagnosticItem}>
            <Text style={styles.label}>Messaging Available:</Text>
            <Text style={[styles.value, diagnostics.messagingAvailable ? styles.success : styles.error]}>
              {diagnostics.messagingAvailable ? '✓' : '✗'}
            </Text>
          </View>

          <View style={styles.diagnosticItem}>
            <Text style={styles.label}>Permissions Granted:</Text>
            <Text style={[styles.value, diagnostics.permissionsGranted ? styles.success : styles.error]}>
              {diagnostics.permissionsGranted ? '✓' : '✗'}
            </Text>
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.diagnosticItem}>
              <Text style={styles.label}>Play Services Available:</Text>
              <Text style={[styles.value, diagnostics.playServicesAvailable ? styles.success : styles.error]}>
                {diagnostics.playServicesAvailable ? '✓' : '✗'}
              </Text>
            </View>
          )}

          {getSolutionForIssue() && (
            <View style={styles.solutionsContainer}>
              <Text style={styles.sectionTitle}>Issues Found:</Text>
              {getSolutionForIssue()?.issues.map((issue, index) => (
                <Text key={index} style={styles.issue}>• {issue}</Text>
              ))}
              
              <Text style={styles.sectionTitle}>Recommended Solutions:</Text>
              {getSolutionForIssue()?.solutions.map((solution, index) => (
                <Text key={index} style={styles.solution}>• {solution}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1E88E5',
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  diagnosticItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  success: {
    color: '#4caf50',
  },
  error: {
    color: '#f44336',
  },
  solutionsContainer: {
    marginTop: 20,
  },
  issue: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 5,
  },
  solution: {
    fontSize: 14,
    color: '#1E88E5',
    marginBottom: 5,
  },
});

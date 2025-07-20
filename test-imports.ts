// Simple test file to verify imports
import { initializeMessaging, diagnosticCheck } from './firebase.config';
import TroubleshootingScreen from './TroubleshootingScreen';

console.log('Imports working correctly');
console.log('initializeMessaging:', typeof initializeMessaging);
console.log('diagnosticCheck:', typeof diagnosticCheck);
console.log('TroubleshootingScreen:', typeof TroubleshootingScreen);

export default {};

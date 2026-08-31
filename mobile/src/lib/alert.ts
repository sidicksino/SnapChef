import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a complete no-op (an empty function —
// see node_modules/react-native-web/src/exports/Alert/index.js) — every
// error/confirmation dialog in the app would silently do nothing on web.
// Falls back to window.alert there so something always shows.
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSMSImport } from '../hooks/useSMSImport';
import { useTheme } from '../theme/useTheme';

export const SMSImportButton = () => {
  const C = useTheme();
  const { importTransactions, isImporting } = useSMSImport();

  // Optionally hide entirely on iOS, or show with alert (as per requirements: show alert on iOS).
  // The requirement says: "On tap: Show alert 'SMS import is only supported on Android'".
  // So we render it everywhere, but the hook handles the Platform difference.

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: C.accent },
        Platform.OS === 'ios' && { opacity: 0.7 } // minor visual indicate
      ]}
      onPress={importTransactions}
      disabled={isImporting}
      activeOpacity={0.8}
    >
      {isImporting ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 190,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  }
});

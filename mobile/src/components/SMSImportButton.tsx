import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSMSImport } from '../hooks/useSMSImport';
import { useTheme } from '../theme/useTheme';

export const SMSImportButton = () => {
  const C = useTheme();
  const { importTransactions, isImporting } = useSMSImport();
  
  const [modalVisible, setModalVisible] = useState(false);
  
  // Default to last 7 days
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  const [startDate, setStartDate] = useState(weekAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Alert.alert('Not Supported', 'SMS import is only supported on Android');
    } else {
      setModalVisible(true);
    }
  };

  const handleConfirm = () => {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      Alert.alert('Invalid Date', 'Ensure dates are YYYY-MM-DD');
      return;
    }
    
    if (sDate > eDate) {
      Alert.alert('Invalid Range', 'Start date must be on or before end date');
      return;
    }

    setModalVisible(false);
    importTransactions(startDate, endDate);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: C.accent },
          Platform.OS === 'ios' && { opacity: 0.7 }
        ]}
        onPress={handlePress}
        disabled={isImporting}
        activeOpacity={0.8}
      >
        {isImporting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: C.surface, padding: 25, borderRadius: 20, elevation: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: C.text }}>Import SMS</Text>
            
            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 5 }}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: C.border, padding: 12, borderRadius: 10, marginBottom: 15, color: C.text, backgroundColor: C.bg }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.placeholder}
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 5 }}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: C.border, padding: 12, borderRadius: 10, marginBottom: 25, color: C.text, backgroundColor: C.bg }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.placeholder}
              value={endDate}
              onChangeText={setEndDate}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, padding: 15, alignItems: 'center' }}>
                <Text style={{ color: C.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={{ flex: 1, backgroundColor: C.accent, padding: 15, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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

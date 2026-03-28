import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import api from '../../services/api';
import Button from '../../components/Button';

const DashboardScreen = () => {
  const { user, wallets, logout, toggleTheme, isDark } = useStore();
  const C = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchDashboard = async () => {
        try {
          const res = await api.get('/analytics');
          setSummary(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchDashboard();
    }, [])
  );

  const handleSetBudget = async () => {
    if (!budgetAmount) return;
    try {
      const today = new Date();
      await api.post('/budgets/', {
        total_budget: parseFloat(budgetAmount),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      });
      setBudgetModalVisible(false);
      setBudgetAmount('');
      const res = await api.get('/analytics');
      setSummary(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to set budget');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Sticky Header */}
      <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bg }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: C.text }}>Hello, {user?.email.split('@')[0]}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={C.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout }
          ])}>
            <Text style={{ color: C.danger, fontWeight: 'bold', fontSize: 15 }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}>
        {/* Balance Card */}
        <View style={{ backgroundColor: C.cardBg, padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 5 }}>Total Balance</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>₹{summary?.total_wallet_balance || '0.00'}</Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 12, width: '48%', elevation: 2 }}>
            <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 5 }}>Spent This Month</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>₹{summary?.current_month_spending || '0.00'}</Text>
          </View>
          <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 12, width: '48%', elevation: 2 }}>
            <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 5 }}>Remaining Budget</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>₹{summary?.remaining_monthly_budget || '0.00'}</Text>
            <TouchableOpacity onPress={() => setBudgetModalVisible(true)} style={{ marginTop: 8 }}>
              <Text style={{ color: C.accent, fontSize: 12, fontWeight: 'bold' }}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallets */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: C.text }}>Your Wallets</Text>
          {wallets.length === 0 ? (
            <Text style={{ color: C.textSecondary, fontStyle: 'italic' }}>No wallets found. Add one in the Wallets tab.</Text>
          ) : (
            wallets.map(w => (
              <View key={w.id} style={{ backgroundColor: C.surface, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{w.name}</Text>
                  <Text style={{ fontSize: 12, color: C.textSecondary }}>{w.type || 'Standard'}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.accent }}>₹{w.balance}</Text>
              </View>
            ))
          )}
        </View>

        {/* Set Budget Modal */}
        <Modal animationType="slide" transparent visible={budgetModalVisible}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: C.surface, padding: 20, borderRadius: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: C.text }}>Set Monthly Budget</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: C.border, padding: 12, borderRadius: 8, marginBottom: 15, color: C.text, backgroundColor: C.bg }}
                placeholder="Amount (e.g. 5000)"
                placeholderTextColor={C.placeholder}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <Button style={{ width: '45%' }} variant="secondary" title="Cancel" onPress={() => setBudgetModalVisible(false)} />
                <Button style={{ width: '45%' }} title="Save" onPress={handleSetBudget} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

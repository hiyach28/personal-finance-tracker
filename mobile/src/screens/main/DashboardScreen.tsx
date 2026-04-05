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

  const totalBudget = parseFloat(summary?.total_monthly_budget || '0');
  const spent = parseFloat(summary?.current_month_spending || '0');
  const remaining = parseFloat(summary?.remaining_monthly_budget || '0');
  const spentPercentage = totalBudget > 0 ? Math.min(spent / totalBudget, 1) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Sticky Header */}
      <View style={{ paddingTop: 45, paddingHorizontal: 20, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bg }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: C.text }}>Hi, {user?.email.split('@')[0]}!</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={C.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout }
          ])}>
            <Text style={{ color: C.danger, fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}>
        {/* Balance Card */}
        <View style={{ backgroundColor: C.cardBg, padding: 25, borderRadius: 16, marginBottom: 20, alignItems: 'center', elevation: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>Total Balance</Text>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold', marginTop: 5 }}>₹{summary?.total_wallet_balance || '0.00'}</Text>
        </View>

        {/* Monthly Budget Card */}
        <View style={{ backgroundColor: C.surface, padding: 20, borderRadius: 16, marginBottom: 20, elevation: 2, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pie-chart" size={20} color={C.accent} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>Monthly Budget</Text>
            </View>
            <TouchableOpacity onPress={() => setBudgetModalVisible(true)} style={{ backgroundColor: C.accent + '20', padding: 6, borderRadius: 8 }}>
              <Ionicons name="pencil" size={16} color={C.accent} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 2 }}>Monthly Goal</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: C.text }}>₹{totalBudget.toFixed(2)}</Text>
            </View>
          </View>

          {/* Progress Bar Container */}
          <View style={{ height: 10, backgroundColor: C.border, borderRadius: 5, width: '100%', overflow: 'hidden' }}>
            <View style={{
              height: '100%',
              backgroundColor: spentPercentage >= 1 ? C.exceeded : spentPercentage > 0.8 ? '#ff8400ff' : C.accent,
              width: `${spentPercentage * 100}%`
            }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: C.textSecondary, fontWeight: '600' }}>
              Spent: ₹{spent.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, color: C.textSecondary, fontWeight: '600' }}>
              {Math.round(spentPercentage * 100)}% Used
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
          <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 9, width: '48%', elevation: 1, borderLeftWidth: 4, borderLeftColor: '#f97123d6' }}>
            <Text style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>Spent this Month</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>₹{spent.toFixed(2)}</Text>
          </View>
          <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 9, width: '48%', elevation: 1, borderLeftWidth: 4, borderLeftColor: '#0cb90cc3' }}>
            <Text style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>Remaining Budget</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>₹{remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Wallets */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>My Wallets</Text>
            <Text style={{ fontSize: 12, color: C.accent }}>View All</Text>
          </View>
          {wallets.length === 0 ? (
            <View style={{ padding: 20, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.textSecondary, fontStyle: 'italic' }}>No wallets found.</Text>
            </View>
          ) : (
            wallets.map(w => (
              <View key={w.id} style={{ backgroundColor: C.surface, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, elevation: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="wallet-outline" size={20} color={C.accent} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: C.text }}>{w.name}</Text>
                    <Text style={{ fontSize: 12, color: C.textSecondary }}>{w.type || 'Standard'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.text }}>₹{parseFloat(w.balance).toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Set Budget Modal */}
        <Modal animationType="fade" transparent visible={budgetModalVisible}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: C.surface, padding: 25, borderRadius: 20, elevation: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: C.text }}>Monthly Goal</Text>
              <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', marginBottom: 20 }}>Set your total spending limit for this month.</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: C.border, padding: 15, borderRadius: 12, marginBottom: 20, color: C.text, backgroundColor: C.bg, fontSize: 18 }}
                placeholder="₹ 0.00"
                placeholderTextColor={C.placeholder}
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="numeric"
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={{ flex: 1, padding: 15, alignItems: 'center' }}>
                  <Text style={{ color: C.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSetBudget} style={{ flex: 2, backgroundColor: C.accent, padding: 15, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

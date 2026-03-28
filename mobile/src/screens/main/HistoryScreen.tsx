import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import api from '../../services/api';
import { useStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';

const HistoryScreen = () => {
  const C = useTheme();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { categories } = useStore();

  const loadExpenses = async () => {
    try {
      const res = await api.get('/expenses/?limit=100');
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(React.useCallback(() => { loadExpenses(); }, []));

  const getCategoryName = (id: number) => {
    const cat = categories.find((c: any) => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const displayedExpenses = expenses.filter(item =>
    selectedCategory ? item.category_id.toString() === selectedCategory : true
  );
  const totalExpense = displayedExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.text }}>{item.description || 'Expense'}</Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>{item.expense_date} • {getCategoryName(item.category_id)}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.danger }}>-₹{item.amount}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingHorizontal: 20, paddingBottom: 100 }}>
      <View style={{ paddingTop: 50, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, backgroundColor: C.bg }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: C.text }}>Expense History</Text>
      </View>

      <View style={{ height: 50, marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          <TouchableOpacity
            style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: !selectedCategory ? C.accent : C.surface2, marginRight: 10, alignSelf: 'center' }}
            onPress={() => setSelectedCategory(null)}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: !selectedCategory ? '#fff' : C.text }}>All</Text>
          </TouchableOpacity>
          {categories.map(c => (
            <TouchableOpacity
              key={c.id}
              style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: selectedCategory === c.id.toString() ? C.accent : C.surface2, marginRight: 10, alignSelf: 'center' }}
              onPress={() => setSelectedCategory(c.id.toString())}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: selectedCategory === c.id.toString() ? '#fff' : C.text }}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayedExpenses}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ flex: 1 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: C.textSecondary }}>No expenses found.</Text>}
      />
      <View style={{ padding: 15, backgroundColor: C.surface, borderRadius: 10, marginTop: 0, alignItems: 'center', elevation: 2 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>Total Displayed: ₹{totalExpense.toFixed(2)}</Text>
      </View>
    </View>
  );
};

export default HistoryScreen;

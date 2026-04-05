import React, { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated, LayoutAnimation, Platform, UIManager, InteractionManager, Modal, StyleSheet, Dimensions, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import { SMSImportButton } from '../../components/SMSImportButton';

const SCREEN_HEIGHT = Dimensions.get('window').height;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'category';

const getCategoryIcon = (name: string): any => {
  const n = name.toLowerCase();
  if (n.includes('food')) return 'restaurant';
  if (n.includes('transport')) return 'car';
  if (n.includes('shopping')) return 'cart';
  if (n.includes('health')) return 'medical';
  if (n.includes('utility')) return 'flash';
  if (n.includes('entertainment')) return 'film';
  if (n.includes('education')) return 'book';
  if (n.includes('personal') || n.includes('transfer')) return 'swap-horizontal';
  return 'apps';
};

const HistoryScreen = () => {
  const C = useTheme();
  const [expenses, setExpenses] = useState<any[]>([]);
  const { categories } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [pendingCategorization, setPendingCategorization] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<any>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const positions = useRef<{ [key: string]: number }>({}).current;

  const toggleSortMenu = (visible: boolean) => {
    if (visible) {
      setShowSortMenu(true);
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => setShowSortMenu(false));
    }
  };

  const processedExpenses = useMemo(() => {
    const getCatName = (id: number) => categories.find(c => c.id === id)?.name || '';
    return [...expenses]
      .filter(item => activeFilter ? item.category_id.toString() === activeFilter : true)
      .sort((a, b) => {
        switch (sortOption) {
          case 'amount_desc': return parseFloat(b.amount) - parseFloat(a.amount);
          case 'amount_asc': return parseFloat(a.amount) - parseFloat(b.amount);
          case 'category': return getCatName(a.category_id).localeCompare(getCatName(b.category_id));
          case 'date_asc': return new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
          default: return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
        }
      });
  }, [expenses, activeFilter, sortOption, categories]);

  const totalExpense = useMemo(() => {
    return processedExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  }, [processedExpenses]);

  const loadExpenses = async () => {
    try {
      const [expRes, txRes] = await Promise.all([
        api.get('/expenses/?limit=100'),
        api.get('/wallets/transactions/all')
      ]);
      
      const mixed = [
        ...expRes.data.map((e: any) => ({ ...e, is_income: false })),
        ...txRes.data.filter((t: any) => t.type === 'income').map((t: any) => ({
          ...t,
          is_income: true,
          expense_date: t.transaction_date,
          category_id: 99999, // default unmapped category for incomes
        }))
      ];
      setExpenses(mixed);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(React.useCallback(() => { loadExpenses(); }, []));

  React.useEffect(() => {
    if (processedExpenses.length === 0 || categories.length === 0) return;
    const freq: Record<string, number> = {};
    const otherCategory = categories.find(c => c.name.toLowerCase().includes('other') || c.name.toLowerCase().includes('miscellaneous')) || categories[0];
    
    processedExpenses.forEach(exp => {
      if (!exp.is_income && exp.category_id === otherCategory.id && exp.description) {
         freq[exp.description] = (freq[exp.description] || 0) + 1;
      }
    });

    const repeated = Object.keys(freq).find(k => freq[k] >= 3);
    if (repeated) {
       AsyncStorage.getItem('merchant_category_map').then(val => {
          const map = val ? JSON.parse(val) : {};
          if (!map[repeated.toLowerCase()] && !map[`dismissed_${repeated.toLowerCase()}`]) {
             setPendingCategorization(repeated);
          }
       });
    }
  }, [processedExpenses, categories]);

  const handleCategoryPress = (id: string | null, xPosition: number = 0) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(id);
    if (!id) {
      setActiveFilter(null);
      return;
    }
    const targetLeft = 46; 
    const startOffset = xPosition - targetLeft;
    slideAnim.setValue(startOffset);
    textAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 140 }),
      Animated.timing(textAnim, { toValue: 1, duration: 250, useNativeDriver: true })
    ]).start();
    InteractionManager.runAfterInteractions(() => setActiveFilter(id));
  };

  const SortItem = ({ label, option }: any) => (
    <TouchableOpacity 
      style={styles.sheetOption} 
      onPress={() => {
        setSortOption(option);
        toggleSortMenu(false);
      }}
    >
      <Text style={{ 
        color: sortOption === option ? C.accent : C.text, 
        fontSize: 15, 
        fontWeight: sortOption === option ? '600' : '400' 
      }}>{label}</Text>
      {sortOption === option && <Ionicons name="checkmark" size={18} color={C.accent} />}
    </TouchableOpacity>
  );

  const getSortLabel = () => {
    if (sortOption.includes('date')) return 'Date';
    if (sortOption.includes('amount')) return 'Amount';
    return 'Category';
  };

  const handleDeleteSelected = () => {
    Alert.alert('Delete Transactions', `Delete ${selectedIds.size} transaction(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const promises = Array.from(selectedIds).map(async (idStr) => {
            const isInc = idStr.endsWith('-inc');
            const id = idStr.replace('-inc', '').replace('-exp', '');
            if (isInc) await api.delete(`/wallets/transactions/${id}`);
            else await api.delete(`/expenses/${id}`);
          });
          await Promise.all(promises);
          setSelectedIds(new Set());
          loadExpenses();
        } catch (e) { Alert.alert('Error', 'Failed to delete transactions'); }
      }}
    ]);
  };

  const handleEdit = () => {
    const idKey = Array.from(selectedIds)[0];
    const isInc = idKey.endsWith('-inc');
    const id = Number(idKey.replace('-inc', '').replace('-exp', ''));
    const item = processedExpenses.find(i => i.id === id && i.is_income === isInc);
    if (item) {
       setEditingItem({ 
         ...item, 
         editAmount: item.amount.toString(), 
         editDescription: item.description,
         editCategory: item.category_id 
       });
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingItem) return;
    try {
      const payload = {
        amount: parseFloat(editingItem.editAmount) || parseFloat(editingItem.amount),
        description: editingItem.editDescription || editingItem.description,
        wallet_id: editingItem.wallet_id || 1, // Will retain backend if omitted dynamically
        category_id: editingItem.editCategory || editingItem.category_id,
        subcategory_id: editingItem.subcategory_id,
        expense_date: editingItem.expense_date
      };

      if (editingItem.is_income) {
         await api.put(`/wallets/transactions/${editingItem.id}`, { amount: payload.amount, description: payload.description });
      } else {
         await api.put(`/expenses/${editingItem.id}`, payload);
      }
      setEditingItem(null);
      setSelectedIds(new Set());
      loadExpenses();
    } catch (e) {
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {selectedIds.size > 0 ? (
        <View style={{ paddingTop: 45, paddingHorizontal: 20, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: C.accent }}>{selectedIds.size} Selected</Text>
          <View style={{ flexDirection: 'row' }}>
            {selectedIds.size === 1 && (
              <TouchableOpacity onPress={handleEdit} style={{ padding: 8, marginRight: 10 }}>
                <Ionicons name="pencil" size={24} color={C.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDeleteSelected} style={{ padding: 8 }}>
              <Ionicons name="trash" size={24} color={C.danger} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedIds(new Set())} style={{ padding: 8, marginLeft: 10 }}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ paddingTop: 45, paddingHorizontal: 20, paddingBottom: 15 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: C.text }}>History</Text>
        </View>
      )}

      {/* Category Bar */}
      <View style={{ height: 45, marginBottom: 10, paddingHorizontal: 20, justifyContent: 'center' }}>
        {selectedCategory === null ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                onLayout={(e) => positions[c.id.toString()] = e.nativeEvent.layout.x}
                onPress={() => handleCategoryPress(c.id.toString(), positions[c.id.toString()])}
                activeOpacity={0.6}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name={getCategoryIcon(c.name)} size={16} color={C.text} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => handleCategoryPress(null)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Ionicons name="close" size={18} color={C.text} />
            </TouchableOpacity>
            <Animated.View style={{ height: 34, borderRadius: 17, backgroundColor: C.accent, transform: [{ translateX: slideAnim }] }}>
              <TouchableOpacity onPress={() => handleCategoryPress(null)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
                <Ionicons name={getCategoryIcon(categories.find(c => c.id.toString() === selectedCategory)?.name || '')} size={15} color="#fff" />
                <Animated.View style={{ opacity: textAnim, transform: [{ translateX: textAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] }}>
                  <Text style={{ color: '#fff', fontSize: 12, marginLeft: 6 }}>{categories.find(c => c.id.toString() === selectedCategory)?.name}</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>

      {/* Succinct Indicator Trigger */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => toggleSortMenu(true)}
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: C.textSecondary, marginRight: 4, fontWeight: '500' }}>
            {getSortLabel()}
          </Text>
          <Ionicons name="swap-vertical" size={14} color={C.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={processedExpenses}
        keyExtractor={i => i.id.toString() + (i.is_income ? '-inc' : '-exp')}
        renderItem={({ item }) => {
          const isEstimated = item.description?.includes('Inferred Income');
          const itemName = isEstimated ? 'Estimated Income' : (item.description || (item.is_income ? 'Income' : 'Expense'));
          const incomeColor = isEstimated ? '#81c784' : '#4caf50';
          const itemKey = item.id.toString() + (item.is_income ? '-inc' : '-exp');
          const isSelected = selectedIds.has(itemKey);
          
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              onLongPress={() => {
                const newSet = new Set(selectedIds);
                newSet.add(itemKey);
                setSelectedIds(newSet);
              }}
              onPress={() => {
                if (selectedIds.size > 0) {
                  const newSet = new Set(selectedIds);
                  if (newSet.has(itemKey)) newSet.delete(itemKey);
                  else newSet.add(itemKey);
                  setSelectedIds(newSet);
                } else {
                  // regular press could be ignored since learning happens passively now
                }
              }}
              style={{ backgroundColor: isSelected ? C.surface2 : C.surface, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginHorizontal: 20, elevation: 1, borderWidth: isSelected ? 2 : 0, borderColor: C.accent }}>
              <View style={{ flex: 1, paddingRight: 15 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.text, marginBottom: 6 }} numberOfLines={1}>{itemName}</Text>
                <Text style={{ fontSize: 15, color: item.is_income ? incomeColor : C.danger, fontWeight: '700' }}>
                  {item.is_income ? '+' : '-'}₹{item.amount}
                  <Text style={{ color: C.textSecondary, fontWeight: '400', fontSize: 13 }}>  •  {item.expense_date}</Text>
                </Text>
              </View>
              <View style={{ backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, maxWidth: 100 }}>
                 <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '700', textAlign: 'center' }} numberOfLines={1}>
                   {(item.is_income ? 'Income' : (categories.find(c => c.id === item.category_id)?.name || 'Unknown')).toUpperCase()}
                 </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 140 }}
        style={{ flex: 1 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: C.textSecondary, marginHorizontal: 20 }}>No expenses found.</Text>}
      />
      
      <View style={{ marginHorizontal: 20, position: 'absolute', bottom: 130, left: 0, right: 0, padding: 15, backgroundColor: C.surface, borderRadius: 12, alignItems: 'center', elevation: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>Total Displayed: ₹{totalExpense.toFixed(2)}</Text>
      </View>

      <Modal visible={showSortMenu} transparent animationType="none" onRequestClose={() => toggleSortMenu(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => toggleSortMenu(false)}>
          <Animated.View style={[styles.sheetContent, { backgroundColor: C.surface, transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={[styles.dragHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.sheetTitle, { color: C.text }]}>Sort by</Text>
            <View style={{ paddingBottom: 20 }}>
              <SortItem label="Date: Newest First" option="date_desc" />
              <SortItem label="Date: Oldest First" option="date_asc" />
              <SortItem label="Amount: High to Low" option="amount_desc" />
              <SortItem label="Amount: Low to High" option="amount_asc" />
              <SortItem label="Category" option="category" />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Smart Learning Modal (Task 18) */}
      <Modal visible={!!pendingCategorization} transparent animationType="slide" onRequestClose={() => setPendingCategorization(null)}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContent, { backgroundColor: C.surface, maxHeight: SCREEN_HEIGHT * 0.7 }]}>
            <View style={[styles.dragHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.sheetTitle, { color: C.text, fontSize: 18 }]}>Smart Categorization</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: C.textSecondary, paddingHorizontal: 20 }}>
              You often pay "{pendingCategorization}". Assign a generic category for future imports?
            </Text>
            <ScrollView style={{ marginBottom: 10 }}>
              {categories.map(c => (
                <TouchableOpacity key={c.id} style={[styles.sheetOption, { borderBottomWidth: 1, borderBottomColor: C.border }]} onPress={async () => {
                  const mapStr = await AsyncStorage.getItem('merchant_category_map');
                  const map = mapStr ? JSON.parse(mapStr) : {};
                  map[pendingCategorization!.toLowerCase()] = { catId: c.id, subId: c.subcategories?.[0]?.id || null };
                  await AsyncStorage.setItem('merchant_category_map', JSON.stringify(map));
                  setPendingCategorization(null);
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                      <Ionicons name={getCategoryIcon(c.name)} size={16} color={C.text} />
                    </View>
                    <Text style={{ color: C.text, fontSize: 16 }}>{c.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={{ marginTop: 5, padding: 15, backgroundColor: C.surface2, borderRadius: 12, marginBottom: 20 }} onPress={async () => {
                  const mapStr = await AsyncStorage.getItem('merchant_category_map');
                  const map = mapStr ? JSON.parse(mapStr) : {};
                  map[`dismissed_${pendingCategorization!.toLowerCase()}`] = true;
                  await AsyncStorage.setItem('merchant_category_map', JSON.stringify(map));
                  setPendingCategorization(null);
            }}>
               <Text style={{ textAlign: 'center', color: C.text, fontWeight: 'bold' }}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal (Task 19) */}
      <Modal visible={!!editingItem} transparent animationType="slide" onRequestClose={() => setEditingItem(null)}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContent, { backgroundColor: C.surface, maxHeight: SCREEN_HEIGHT * 0.8 }]}>
            <View style={[styles.dragHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.sheetTitle, { color: C.text }]}>Edit Transaction</Text>
            
            <ScrollView style={{ marginBottom: 15 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: C.textSecondary, marginBottom: 5 }}>Amount (₹)</Text>
              <TextInput 
                style={{ backgroundColor: C.surface2, color: C.text, padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 18 }} 
                keyboardType="numeric" 
                value={editingItem?.editAmount} 
                onChangeText={t => setEditingItem({ ...editingItem, editAmount: t })} 
              />
              
              <Text style={{ color: C.textSecondary, marginBottom: 5 }}>Description</Text>
              <TextInput 
                style={{ backgroundColor: C.surface2, color: C.text, padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 }} 
                value={editingItem?.editDescription} 
                onChangeText={t => setEditingItem({ ...editingItem, editDescription: t })} 
              />
              
              {!editingItem?.is_income && (
                <>
                  <Text style={{ color: C.textSecondary, marginBottom: 5 }}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                    {categories.map(c => (
                      <TouchableOpacity 
                        key={c.id} 
                        style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: editingItem?.editCategory === c.id ? C.accent : C.surface2, marginRight: 10 }}
                        onPress={() => setEditingItem({ ...editingItem, editCategory: c.id })}>
                        <Text style={{ color: editingItem?.editCategory === c.id ? '#fff' : C.text }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
              
              <TouchableOpacity style={{ backgroundColor: C.accent, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 }} onPress={handleUpdateTransaction}>
                 <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save Changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ padding: 15, alignItems: 'center', marginTop: 5 }} onPress={() => setEditingItem(null)}>
                 <Text style={{ color: C.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SMS Import Button */}
      <SMSImportButton />
    </View>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 10, minHeight: 330 },
  dragHandle: { width: 35, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
});

export default HistoryScreen;

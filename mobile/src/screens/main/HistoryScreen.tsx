import React, { useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated, LayoutAnimation, Platform, UIManager, InteractionManager, Modal, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      const res = await api.get('/expenses/?limit=100');
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(React.useCallback(() => { loadExpenses(); }, []));

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

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: 45, paddingHorizontal: 20, paddingBottom: 15 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: C.text }}>History</Text>
      </View>

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
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: C.surface, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginHorizontal: 20, elevation: 1 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.text }}>{item.description || 'Expense'}</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>{item.expense_date} • {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.danger }}>₹{item.amount}</Text>
          </View>
        )}
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

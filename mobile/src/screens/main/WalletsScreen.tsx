import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, Modal } from 'react-native';
import { useStore } from '../../store';
import Button from '../../components/Button';
import api from '../../services/api';
import { useTheme } from '../../theme/useTheme';

const WalletsScreen = () => {
  const C = useTheme();
  const { wallets, fetchInitialData } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank Account');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyDesc, setAddMoneyDesc] = useState('');
  const [addMoneyWalletId, setAddMoneyWalletId] = useState<number | null>(null);

  const handleAddMoneyPrompt = (item: any) => {
    setAddMoneyWalletId(item.id);
    setAddMoneyAmount('');
    setAddMoneyDesc('');
    setAddMoneyVisible(true);
  };

  const handleAddMoney = async () => {
    if (!addMoneyAmount || !addMoneyWalletId) return;
    try {
      await api.post(`/wallets/${addMoneyWalletId}/add-money`, {
        amount: parseFloat(addMoneyAmount),
        description: addMoneyDesc
      });
      await fetchInitialData();
      setAddMoneyVisible(false);
    } catch(e) {
      Alert.alert('Error', 'Failed to add money');
    }
  };

  const handleSave = async () => {
    if (!name) return;
    try {
      if (editingId) {
        await api.put(`/wallets/${editingId}`, { name, type, currency: 'INR' });
      } else {
        await api.post('/wallets/', { name, type, currency: 'INR' });
      }
      await fetchInitialData();
      setModalVisible(false);
      setName('');
      setEditingId(null);
    } catch(e) {
      Alert.alert('Error', 'Failed to save wallet');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Wallet', 'Are you sure you want to delete this wallet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/wallets/${id}`);
          await fetchInitialData();
        } catch(e) {
          Alert.alert('Error', 'Failed to delete wallet');
        }
      }}
    ]);
  };

  const handleEditPrompt = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setType(item.type);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.item, { backgroundColor: C.surface }]}>
      <View style={{flex: 1}}>
        <Text style={[styles.name, { color: C.text }]}>{item.name}</Text>
        <Text style={[styles.type, { color: C.textSecondary }]}>{item.type}</Text>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.balance, { color: C.accent }]}>₹{item.balance}</Text>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <Text onPress={() => handleAddMoneyPrompt(item)} style={{color: C.success, marginRight: 15, fontWeight: 'bold'}}>+ Money</Text>
          <Text onPress={() => handleEditPrompt(item)} style={{color: C.accent, marginRight: 15, fontWeight: 'bold'}}>Edit</Text>
          <Text onPress={() => handleDelete(item.id)} style={{color: C.danger, fontWeight: 'bold'}}>Delete</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { backgroundColor: C.bg }]}>
        <Text style={[styles.title, { color: C.text }]}>Wallets</Text>
        <Button title="+ Add" style={{ padding: 10, paddingHorizontal: 15 }} onPress={() => { setEditingId(null); setName(''); setType('Bank Account'); setModalVisible(true); }} />
      </View>
      
      <FlatList
        data={wallets}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 130 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: C.textSecondary }}>No wallets found.</Text>}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>{editingId ? 'Edit Wallet' : 'New Wallet'}</Text>
            <TextInput 
              style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.bg }]} 
              placeholder="Wallet Name" 
              placeholderTextColor={C.placeholder}
              value={name} 
              onChangeText={setName} 
            />
            <TextInput 
              style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.bg }]} 
              placeholder="Type (Bank, Cash...)" 
              placeholderTextColor={C.placeholder}
              value={type} 
              onChangeText={setType} 
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <Button style={{ width: '45%' }} variant="secondary" title="Cancel" onPress={() => setModalVisible(false)} />
              <Button style={{ width: '45%' }} title={editingId ? 'Save' : 'Create'} onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={addMoneyVisible}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: C.surface }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Add Money</Text>
            <TextInput 
              style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.bg }]} 
              placeholder="Amount (e.g. 500)" 
              placeholderTextColor={C.placeholder}
              value={addMoneyAmount} 
              onChangeText={setAddMoneyAmount} 
              keyboardType="numeric" 
            />
            <TextInput 
              style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.bg }]} 
              placeholder="Description (Optional)" 
              placeholderTextColor={C.placeholder}
              value={addMoneyDesc} 
              onChangeText={setAddMoneyDesc} 
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <Button style={{ width: '45%' }} variant="secondary" title="Cancel" onPress={() => setAddMoneyVisible(false)} />
              <Button style={{ width: '45%' }} title="Add" onPress={handleAddMoney} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 50, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  item: { backgroundColor: '#fff', padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  type: { fontSize: 14, color: '#888', marginTop: 5 },
  balance: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 15 }
});

export default WalletsScreen;

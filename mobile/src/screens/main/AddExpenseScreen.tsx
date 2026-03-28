import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useStore } from '../../store';
import { useTheme } from '../../theme/useTheme';
import api from '../../services/api';

const AddExpenseScreen = ({ navigation }: any) => {
  const C = useTheme();
  const { wallets, categories, fetchInitialData } = useStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceModal, setVoiceModal] = useState(false);
  const [voiceAmount, setVoiceAmount] = useState('');
  const [voiceCategoryId, setVoiceCategoryId] = useState('');
  const [voiceDate, setVoiceDate] = useState('');
  const [voiceDesc, setVoiceDesc] = useState('');
  const [transcript, setTranscript] = useState('');

  const handleAdd = async () => {
    if (!amount || !walletId || !categoryId) { Alert.alert('Error', 'Please fill all required fields'); return; }
    let finalSubcategoryId = subcategoryId;
    const selectedCategoryObj = categories.find(c => c.id.toString() === categoryId);
    if (!finalSubcategoryId && selectedCategoryObj) {
      const otherSub = selectedCategoryObj.subcategories.find(s => s.name.toLowerCase() === 'other');
      if (otherSub) finalSubcategoryId = otherSub.id.toString();
      else if (selectedCategoryObj.subcategories.length > 0) finalSubcategoryId = selectedCategoryObj.subcategories[0].id.toString();
    }
    if (!finalSubcategoryId) { Alert.alert('Error', 'Missing subcategory'); return; }
    try {
      await api.post('/expenses/', { amount: parseFloat(amount), description, wallet_id: parseInt(walletId), category_id: parseInt(categoryId), subcategory_id: parseInt(finalSubcategoryId), expense_date: new Date().toISOString().split('T')[0] });
      Alert.alert('Success', 'Expense saved!');
      setAmount(''); setDescription(''); setCategoryId(''); setSubcategoryId('');
      await fetchInitialData();
      navigation.navigate('Dashboard');
    } catch { Alert.alert('Error', 'Could not save expense'); }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec); setIsRecording(true);
    } catch { Alert.alert('Error', 'Could not start recording'); }
  };

  const stopAndProcess = async () => {
    if (!recording) return;
    setIsRecording(false); setIsProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); setRecording(null);
      const formData = new FormData();
      formData.append('audio', { uri, name: 'voice.m4a', type: 'audio/m4a' } as any);
      const res = await api.post('/voice-expense/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { transcript: t, amount: a, category_id: cid, expense_date: d } = res.data;
      setTranscript(t || ''); setVoiceAmount(a ? a.toString() : ''); setVoiceCategoryId(cid ? cid.toString() : '');
      setVoiceDate(d || new Date().toISOString().split('T')[0]); setVoiceDesc('');
      if (!walletId) { const upi = wallets.find(w => w.name.toLowerCase().includes('upi')); if (upi) setWalletId(upi.id.toString()); }
      setVoiceModal(true);
    } catch (e: any) { Alert.alert('Error', 'Voice processing failed: ' + (e?.response?.data?.detail || e.message)); }
    finally { setIsProcessing(false); }
  };

  const saveVoiceExpense = async () => {
    if (!voiceAmount || !walletId || !voiceCategoryId) { Alert.alert('Error', 'Fill Amount, Wallet, Category'); return; }
    const catObj = categories.find(c => c.id.toString() === voiceCategoryId);
    let subId = '';
    if (catObj) { const o = catObj.subcategories.find((s: any) => s.name.toLowerCase() === 'other'); subId = o ? o.id.toString() : catObj.subcategories[0]?.id?.toString() || ''; }
    if (!subId) { Alert.alert('Error', 'No subcategory'); return; }
    try {
      await api.post('/expenses/', { amount: parseFloat(voiceAmount), description: voiceDesc, wallet_id: parseInt(walletId), category_id: parseInt(voiceCategoryId), subcategory_id: parseInt(subId), expense_date: voiceDate });
      Alert.alert('Success', 'Voice expense saved!'); setVoiceModal(false);
      await fetchInitialData(); navigation.navigate('Dashboard');
    } catch { Alert.alert('Error', 'Could not save voice expense'); }
  };

  const selectedCategory = categories.find(c => c.id.toString() === categoryId);
  const inp = { borderWidth: 1, borderColor: C.border, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, color: C.text, backgroundColor: C.bg };
  const pick = { borderWidth: 1, borderColor: C.border, borderRadius: 8, marginBottom: 15, overflow: 'hidden' as const, backgroundColor: C.bg };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: C.bg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: C.text }}>Add Expense</Text>
        <TouchableOpacity onPress={isRecording ? stopAndProcess : startRecording} style={{ backgroundColor: isRecording ? C.danger : C.accent, padding: 10, borderRadius: 25, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} disabled={isProcessing}>
          {isProcessing ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color="#fff" />}
        </TouchableOpacity>
      </View>
      {isRecording && <View style={{ backgroundColor: '#FFF3CD', padding: 10, alignItems: 'center' }}><Text style={{ color: '#856404', fontWeight: '600' }}>🎙 Recording… tap to stop</Text></View>}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}>
        <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Amount (₹)*</Text>
        <TextInput style={inp} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={C.placeholder} />

        <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Wallet*</Text>
        <View style={pick}><Picker selectedValue={walletId} onValueChange={setWalletId} style={{ color: C.text }}>
          <Picker.Item label="Select Wallet" value="" color={C.placeholder} />
          {wallets.map(w => <Picker.Item key={w.id} label={w.name} value={w.id.toString()} color={C.text} />)}
        </Picker></View>

        <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Category*</Text>
        <View style={pick}><Picker selectedValue={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(''); }} style={{ color: C.text }}>
          <Picker.Item label="Select Category" value="" color={C.placeholder} />
          {categories.map(c => <Picker.Item key={c.id} label={c.name} value={c.id.toString()} color={C.text} />)}
        </Picker></View>

        {selectedCategory && (<>
          <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Subcategory</Text>
          <View style={pick}><Picker selectedValue={subcategoryId} onValueChange={setSubcategoryId} style={{ color: C.text }}>
            <Picker.Item label="Select Subcategory" value="" color={C.placeholder} />
            {selectedCategory.subcategories.map((sc: any) => <Picker.Item key={sc.id} label={sc.name} value={sc.id.toString()} color={C.text} />)}
          </Picker></View>
        </>)}

        <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Description</Text>
        <TextInput style={inp} value={description} onChangeText={setDescription} placeholder="Optional note" placeholderTextColor={C.placeholder} />
        <Button title="Save Expense" onPress={handleAdd} />
      </ScrollView>

      <Modal visible={voiceModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', backgroundColor: C.surface, borderRadius: 16, padding: 20, maxHeight: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: C.text }}>Voice Expense</Text>
            {transcript ? <Text style={{ fontSize: 13, color: C.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 15 }}>"{transcript}"</Text> : null}
            <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Amount (₹)*</Text>
            <TextInput style={inp} value={voiceAmount} onChangeText={setVoiceAmount} keyboardType="numeric" placeholderTextColor={C.placeholder} />
            <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Wallet*</Text>
            <View style={pick}><Picker selectedValue={walletId} onValueChange={setWalletId} style={{ color: C.text }}>
              <Picker.Item label="Select Wallet" value="" color={C.placeholder} />
              {wallets.map(w => <Picker.Item key={w.id} label={w.name} value={w.id.toString()} color={C.text} />)}
            </Picker></View>
            <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Category*</Text>
            <View style={pick}><Picker selectedValue={voiceCategoryId} onValueChange={setVoiceCategoryId} style={{ color: C.text }}>
              <Picker.Item label="Select Category" value="" color={C.placeholder} />
              {categories.map(c => <Picker.Item key={c.id} label={c.name} value={c.id.toString()} color={C.text} />)}
            </Picker></View>
            <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Date</Text>
            <TextInput style={inp} value={voiceDate} onChangeText={setVoiceDate} placeholder="YYYY-MM-DD" placeholderTextColor={C.placeholder} />
            <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 5, fontWeight: '600' }}>Description</Text>
            <TextInput style={inp} value={voiceDesc} onChangeText={setVoiceDesc} placeholder="Optional" placeholderTextColor={C.placeholder} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Button style={{ width: '45%' }} variant="secondary" title="Cancel" onPress={() => setVoiceModal(false)} />
              <Button style={{ width: '45%' }} title="Save" onPress={saveVoiceExpense} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddExpenseScreen;

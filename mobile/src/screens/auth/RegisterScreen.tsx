import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import Button from '../../components/Button';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../store';
import { useTheme } from '../../theme/useTheme';

const RegisterScreen = ({ navigation }: any) => {
  const C = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fetchInitialData = useStore((state) => state.fetchInitialData);

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password });
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const response = await api.post('/auth/login', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await AsyncStorage.setItem('token', response.data.access_token);
      await fetchInitialData();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      Alert.alert('Error', typeof detail === 'string' ? detail : 'Registration failed');
    }
  };

  const inp = { borderWidth: 1, borderColor: C.border, padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, color: C.text, backgroundColor: C.surface };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: C.bg }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: C.text }}>Register</Text>
      <TextInput style={inp} placeholder="Email" placeholderTextColor={C.placeholder} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={inp} placeholder="Password" placeholderTextColor={C.placeholder} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Register" onPress={handleRegister} />
      <Button title="Already have an account? Login" variant="secondary" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

export default RegisterScreen;

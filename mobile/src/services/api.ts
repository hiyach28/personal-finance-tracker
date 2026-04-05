import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/web
const BASE_URL = 'http://10.181.68.245:8080';


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5 second timeout so it doesn't freeze the app silently forever
});

api.interceptors.request.use(
  async (config) => {
    console.log(`[API REQUEST] => ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

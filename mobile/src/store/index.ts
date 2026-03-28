import { create } from 'zustand';
import { User, Wallet, Category } from '../types';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  user: User | null;
  wallets: Wallet[];
  categories: Category[];
  isDark: boolean;
  setUser: (user: User | null) => void;
  setWallets: (wallets: Wallet[]) => void;
  setCategories: (categories: Category[]) => void;
  fetchInitialData: () => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  wallets: [],
  categories: [],
  isDark: false,
  setUser: (user) => set({ user }),
  setWallets: (wallets) => set({ wallets }),
  setCategories: (categories) => set({ categories }),
  fetchInitialData: async () => {
    try {
      // Load saved theme preference
      const savedTheme = await AsyncStorage.getItem('isDark');
      if (savedTheme !== null) set({ isDark: savedTheme === 'true' });

      const [userRes, walletsRes, categoriesRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/wallets'),
        api.get('/categories')
      ]);
      set({
        user: userRes.data,
        wallets: walletsRes.data,
        categories: categoriesRes.data
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, wallets: [], categories: [] });
  },
  toggleTheme: async () => {
    const next = !get().isDark;
    set({ isDark: next });
    await AsyncStorage.setItem('isDark', String(next));
  },
}));

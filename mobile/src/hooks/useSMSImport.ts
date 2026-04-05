import { useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useStore } from '../store';
import { parseUPI_SMS, ParsedSMS } from '../utils/smsParser';

// In Expo Go this module is missing unless bare workflow/dev client is built
let SmsAndroid: any;
if (Platform.OS === 'android') {
  try {
    SmsAndroid = require('react-native-get-sms-android').default;
  } catch (e) {
    console.warn('react-native-get-sms-android not installed or linked');
  }
}

export const useSMSImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const wallets = useStore(state => state.wallets);
  const categories = useStore(state => state.categories);

  const importTransactions = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'SMS import is only supported on Android');
      return;
    }

    if (!SmsAndroid) {
      Alert.alert('Error', 'SMS module not available');
      return;
    }

    if (wallets.length === 0) {
      Alert.alert('Error', 'Please create a wallet first');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'Finance Tracker needs access to your SMS to import transactions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot read SMS without permissions');
        return;
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to request SMS permission');
      return;
    }

    setIsImporting(true);

    try {
      const filter = {
        box: 'inbox', 
        maxCount: 300,
      };

      SmsAndroid.list(JSON.stringify(filter), 
        (fail: string) => {
          console.warn('Failed with this error: ' + fail);
          Alert.alert('Error', 'Failed to read messages');
          setIsImporting(false);
        },
        async (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);
            const savedIdsStr = await AsyncStorage.getItem('imported_sms_ids');
            const savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
            const savedIdsSet = new Set(savedIds);

            const parsedTxns: ParsedSMS[] = [];
            for (const msg of messages) {
              const id = msg._id.toString();
              if (savedIdsSet.has(id)) continue;

              const parsed = parseUPI_SMS(msg.body || '', msg.date || Date.now(), id);
              if (parsed) {
                parsedTxns.push(parsed);
              }
            }

            if (parsedTxns.length === 0) {
              Alert.alert('No Transactions', 'No new UPI transactions found to import');
              setIsImporting(false);
              return;
            }

            // Fallback strategy: assign to "Bank Account" wallet or first wallet
            let defaultWalletId = wallets[0].id;
            const bankWallet = wallets.find(w => w.name.toLowerCase().includes('bank') || w.name.toLowerCase().includes('upi') || w.type.toLowerCase().includes('bank'));
            if (bankWallet) defaultWalletId = bankWallet.id;

            // Find an "Others" category
            let fallbackCategoryId: number | null = null;
            let fallbackSubcategoryId: number | null = null;
            
            if (categories.length > 0) {
              const otherCategory = categories.find(c => c.name.toLowerCase().includes('other') || c.name.toLowerCase().includes('miscellaneous'));
              if (otherCategory) {
                fallbackCategoryId = otherCategory.id;
                const otherSub = otherCategory.subcategories.find(s => s.name.toLowerCase() === 'other');
                fallbackSubcategoryId = otherSub ? otherSub.id : otherCategory.subcategories[0]?.id;
              } else {
                fallbackCategoryId = categories[0].id;
                fallbackSubcategoryId = categories[0].subcategories[0]?.id;
              }
            }

            let importCount = 0;
            const newImportedIds: string[] = [];

            for (const txn of parsedTxns) {
              try {
                if (txn.type === 'expense') {
                  if (fallbackCategoryId && fallbackSubcategoryId) {
                    await api.post('/expenses/', {
                      amount: txn.amount,
                      description: `SMS: ${txn.merchant}`,
                      wallet_id: defaultWalletId,
                      category_id: fallbackCategoryId,
                      subcategory_id: fallbackSubcategoryId,
                      expense_date: txn.date.toISOString().split('T')[0]
                    });
                    newImportedIds.push(txn.id);
                    importCount++;
                  }
                } else if (txn.type === 'income') {
                  await api.post(`/wallets/${defaultWalletId}/add-money`, {
                    amount: txn.amount,
                    description: `SMS Income: ${txn.merchant}`
                  });
                  newImportedIds.push(txn.id);
                  importCount++;
                }
              } catch (e) {
                console.warn('Failed to import a specific transaction', e);
                // Continue with next instead of failing entire process
              }
            }

            // Save new imported IDs
            const updatedIds = [...savedIds, ...newImportedIds];
            await AsyncStorage.setItem('imported_sms_ids', JSON.stringify(updatedIds));

            await fetchInitialData();
            Alert.alert('Success', `Imported ${importCount} new transactions`);
          } catch (err) {
            console.error('Error processing messages', err);
            Alert.alert('Error', 'Failed to process messages');
          } finally {
            setIsImporting(false);
          }
        }
      );

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An unexpected error occurred during import');
      setIsImporting(false);
    }
  };

  return { importTransactions, isImporting };
};

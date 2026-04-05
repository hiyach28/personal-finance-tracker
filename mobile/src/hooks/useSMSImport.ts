import { useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useStore } from '../store';
import { parseUPI_SMS, ParsedSMS } from '../utils/smsParser';

let SmsAndroid: any;
if (Platform.OS === 'android') {
  try {
    SmsAndroid = require('react-native-get-sms-android');
  } catch (e) {
    console.warn('react-native-get-sms-android not installed or linked');
  }
}

export const useSMSImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const wallets = useStore(state => state.wallets);
  const categories = useStore(state => state.categories);

  const importTransactions = async (startDateStr: string, endDateStr: string) => {
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
      // Date conversions
      const startMs = new Date(startDateStr).getTime();
      const endDateFull = new Date(endDateStr);
      endDateFull.setHours(23, 59, 59, 999);
      const endMs = endDateFull.getTime();

      let filter: any = {
        box: 'inbox', 
        maxCount: 300,
      };

      if (!isNaN(startMs) && !isNaN(endMs)) {
        filter.minDate = startMs;
        filter.maxDate = endMs;
      }

      // Fetch existing expenses for robust Deduplication
      let recentExpenses: any[] = [];
      try {
        const expensesRes = await api.get('/expenses/?limit=100');
        recentExpenses = expensesRes.data || [];
      } catch (e) {
        console.warn('Could not fetch recent expenses for deduplication');
      }

      SmsAndroid.list(JSON.stringify(filter), 
        (fail: string) => {
          console.warn('Failed with this error: ' + fail);
          Alert.alert('Error', 'Failed to read messages');
          setIsImporting(false);
        },
        async (count: number, smsList: string) => {
          try {
            const rawMessages = JSON.parse(smsList);
            const messages = rawMessages.sort((a: any, b: any) => (a.date || 0) - (b.date || 0)); // Ascending (Oldest first)
            const savedIdsStr = await AsyncStorage.getItem('imported_sms_ids');
            const savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
            const savedIdsSet = new Set(savedIds);

            const parsedTxns: ParsedSMS[] = [];
            const walletStates: Record<number, { lastBalance: number | null, exp: number, inc: number }> = {};
            
            wallets.forEach(w => {
              walletStates[w.id] = { lastBalance: null, exp: 0, inc: 0 };
            });

            // Fallback definitions
            let defaultWalletId = wallets[0].id;
            const bankWallet = wallets.find(w => w.name.toLowerCase().includes('bank') || w.type.toLowerCase().includes('bank'));
            if (bankWallet) defaultWalletId = bankWallet.id;

            for (const msg of messages) {
              const id = msg._id.toString();
              if (savedIdsSet.has(id)) continue;

              const msgDate = msg.date || Date.now();
              if (msgDate < startMs || msgDate > endMs) continue;

              const parsed = parseUPI_SMS(msg.body || '', msgDate, id);
              if (parsed) {
                // Dynamic Target Resolution
                let targetWalletId = defaultWalletId;
                const firstWordBank = parsed.bank.split(' ')[0].toLowerCase();
                const safeAccount = parsed.account.toLowerCase();
                const matchedWallet = wallets.find(w => {
                  const wName = w.name.toLowerCase();
                  const wType = w.type.toLowerCase();
                  return (
                    (firstWordBank.length > 2 && wName.includes(firstWordBank)) ||
                    (firstWordBank.length > 2 && wType.includes(firstWordBank)) ||
                    (safeAccount.length > 2 && wName.includes(safeAccount))
                  );
                });
                if (matchedWallet) targetWalletId = matchedWallet.id;

                const state = walletStates[targetWalletId];

                // Inference Calculation Logic (Task 26)
                if (parsed.balance !== undefined) {
                  if (state.lastBalance !== null && parsed.type === 'balance_snapshot') {
                    // Only triggers if completely unknown action but has clear balance drop
                    const delta = parsed.balance - state.lastBalance;
                    const inferredIncome = delta + state.exp - state.inc;
                    
                    if (inferredIncome > 50) {
                      parsedTxns.push({
                        amount: inferredIncome,
                        description: "Balance Adjustment",
                        type: "income",
                        bank: parsed.bank,
                        account: parsed.account,
                        source: "inferred",
                        date: parsed.date,
                        rawText: "Inferred from balance gap",
                        id: `inf-${id}`,
                        inferred: true
                      });
                    }
                  }
                  state.lastBalance = parsed.balance;
                  state.exp = 0;
                  state.inc = 0;
                }

                if (parsed.type === 'expense') {
                  state.exp += parsed.amount;
                } else if (parsed.type === 'income') {
                  state.inc += parsed.amount;
                }

                // Deduplication Logic Check (Task 7)
                let isDuplicate = false;
                if (parsed.type === 'expense') {
                   isDuplicate = recentExpenses.some(e => {
                     if (Math.abs(e.amount - parsed.amount) > 0.01) return false;
                     const eTime = new Date(e.expense_date).getTime();
                     if (Math.abs(eTime - parsed.date.getTime()) > 86400000) return false;
                     if (e.description?.toLowerCase().includes(parsed.description.toLowerCase()) || 
                         parsed.description.toLowerCase().includes(e.description?.toLowerCase() || '')) {
                       return true;
                     }
                     return false;
                   });
                }
                
                if (!isDuplicate && parsed.type !== 'balance_snapshot') {
                  parsedTxns.push(parsed);
                }
                
                // Add the regular ID anyway if it parsed correctly so it won't loop it again
                if (parsed.type === 'balance_snapshot' && parsedTxns.length === 0) {
                   // Ensure pseudo id marking so it doesn't parse every single time 
                   // (Wait if push is missing, loop won't save ID)
                   // We don't push balance_snapshot into parsedTxns, handled inherently downstream.
                }
              }
            }

            if (parsedTxns.length === 0) {
              Alert.alert('No Transactions', 'No new UPI transactions or inferred balances found.');
              setIsImporting(false);
              return;
            }

            let fallbackCategoryId: number | null = null;
            let fallbackSubcategoryId: number | null = null;
            
            if (categories.length > 0) {
              const otherCategory = categories.find(c => c.name.toLowerCase().includes('other') || c.name.toLowerCase().includes('miscellaneous'));
              if (otherCategory) {
                fallbackCategoryId = otherCategory.id;
                const otherSub = otherCategory.subcategories?.find((s: any) => s.name.toLowerCase() === 'other');
                fallbackSubcategoryId = otherSub ? otherSub.id : (otherCategory.subcategories?.[0]?.id || null);
              } else {
                fallbackCategoryId = categories[0].id;
                fallbackSubcategoryId = categories[0].subcategories?.[0]?.id || null;
              }
            }

            const merchantMapStr = await AsyncStorage.getItem('merchant_category_map');
            const merchantMap: Record<string, { catId: number, subId: number | null }> = merchantMapStr ? JSON.parse(merchantMapStr) : {};

            let importCount = 0;
            const newImportedIds: string[] = [];

            const results = await Promise.allSettled(parsedTxns.map(async (txn) => {
              let targetWalletId = defaultWalletId;
              const firstWordBank = txn.bank.split(' ')[0].toLowerCase();
              const safeAccount = txn.account.toLowerCase();
              
              const matchedWallet = wallets.find(w => {
                const wName = w.name.toLowerCase();
                const wType = w.type.toLowerCase();
                return (
                  (firstWordBank.length > 2 && wName.includes(firstWordBank)) ||
                  (firstWordBank.length > 2 && wType.includes(firstWordBank)) ||
                  (safeAccount.length > 2 && wName.includes(safeAccount))
                );
              });
              
              if (matchedWallet) {
                targetWalletId = matchedWallet.id;
              }

              if (txn.type === 'expense') {
                let activeCat = fallbackCategoryId;
                let activeSubCat = fallbackSubcategoryId;
                
                // Task 23: P2P Native Rule overrides Fallbacks
                if (txn.description.startsWith('Paid to ')) {
                  const p2pCat = categories.find(c => c.name.toLowerCase().includes('personal') || c.name.toLowerCase().includes('transfer'));
                  if (p2pCat) {
                    activeCat = p2pCat.id;
                    const p2pSub = p2pCat.subcategories?.find((s: any) => s.name.toLowerCase() === 'paid to friend');
                    activeSubCat = p2pSub ? p2pSub.id : (p2pCat.subcategories?.[0]?.id || null);
                  }
                }

                const savedMap = merchantMap[txn.description.toLowerCase()];
                if (savedMap) {
                  activeCat = savedMap.catId;
                  activeSubCat = savedMap.subId;
                }

                if (activeCat) {
                  await api.post('/expenses/', {
                    amount: txn.amount,
                    description: `SMS: ${txn.description}`,
                    wallet_id: targetWalletId,
                    category_id: activeCat,
                    subcategory_id: activeSubCat,
                    expense_date: txn.date.toISOString().split('T')[0]
                  });
                }
              } else if (txn.type === 'income') {
                await api.post(`/wallets/${targetWalletId}/add-money`, {
                  amount: txn.amount,
                  description: txn.inferred ? `Inferred Income: Balance Adjustment` : `SMS Income: ${txn.description}`
                });
              }
              
              return txn.id;
            }));

            for (const res of results) {
              if (res.status === 'fulfilled') {
                newImportedIds.push(res.value);
                importCount++;
              } else {
                console.warn('Failed to import transaction via Promise');
              }
            }

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


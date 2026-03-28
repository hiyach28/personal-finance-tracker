import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import DashboardScreen from '../screens/main/DashboardScreen';
import AddExpenseScreen from '../screens/main/AddExpenseScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import WalletsScreen from '../screens/main/WalletsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const C = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.tabActive,
        tabBarInactiveTintColor: C.tabInactive,
        tabBarStyle: { 
          paddingBottom: 5, 
          paddingTop: 5, 
          height: 60,
          position: 'absolute',
          bottom: 50,
          left: 15,
          right: 15,
          borderRadius: 15,
          elevation: 5,
          backgroundColor: C.tabBg,
          borderTopWidth: 0,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            'Dashboard': 'home-outline',
            'Wallets': 'wallet-outline',
            'Add Expense': 'add-circle-outline',
            'History': 'time-outline',
            'Analytics': 'bar-chart-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Wallets" component={WalletsScreen} />
      <Tab.Screen name="Add Expense" component={AddExpenseScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;


import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import api from '../../services/api';
import { useStore } from '../../store';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const { isDark } = useStore();
  const C = useTheme();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const chartConfig = {
    backgroundGradientFrom: C.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: C.surface,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => isDark ? `rgba(77, 163, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => C.textSecondary,
  };

  const getPieData = () => {
    if (!data?.category_spending_summary) return [];
    const colors = ['#eebcb9ff', '#d65b84ff', '#872d97ff', '#7da6edff', '#5d9266ff', '#2196f3', '#03a9f4', '#4caf50', '#ff9800'];
    return data.category_spending_summary.map((item: any, idx: number) => ({
      name: item.category,
      population: parseFloat(item.spent),
      color: colors[idx % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.headerBar, { backgroundColor: C.bg }]}>
        <Text style={[styles.title, { color: C.text }]}>Analytics</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}>

        {data ? (
          <>
            <View style={[styles.card, { backgroundColor: C.surface }]}>
              <Text style={[styles.chartTitle, { color: C.text }]}>Spending by Category</Text>
              {getPieData().length > 0 ? (
                <>
                  <PieChart
                    data={getPieData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={(screenWidth / 4 - 30).toString()}
                    absolute
                    hasLegend={false}
                  />
                  <View style={{ marginTop: 15, paddingHorizontal: 10 }}>
                    {getPieData().map((item: any, idx: number) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 10 }} />
                        <Text style={{ fontSize: 15, color: C.text, fontWeight: '500' }}>
                          ₹{item.population} : "{item.name}"
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No sufficient data for chart.</Text>
              )}
            </View>

            <View style={[styles.card, { backgroundColor: C.surface }]}>
              <Text style={[styles.chartTitle, { color: C.text }]}>Spending vs Budget</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.valueText, { color: C.accent }]}>₹{data.current_month_spending}</Text>
                  <Text style={[styles.labelText, { color: C.textSecondary }]}>Spent</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.valueText, { color: C.accent }]}>₹{data.total_monthly_budget}</Text>
                  <Text style={[styles.labelText, { color: C.textSecondary }]}>Budget</Text>
                </View>
              </View>
            </View>

            {data.habit_insights && data.habit_insights.length > 0 && (
              <View style={[styles.card, { backgroundColor: C.surface }]}>
                <Text style={[styles.chartTitle, { color: C.text }]}>Habit Insights</Text>
                {data.habit_insights.map((h: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ color: C.text }}>{h.habit} (x{h.frequency})</Text>
                    <Text style={{ fontWeight: 'bold', color: C.text }}>₹{h.total_spent}</Text>
                  </View>
                ))}
              </View>
            )}

          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading data...</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: { paddingTop: 45, paddingHorizontal: 20, paddingBottom: 25 },
  container: { paddingHorizontal: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, alignSelf: 'center' },
  valueText: { fontSize: 20, fontWeight: 'bold' },
  labelText: { marginTop: 5 }
});

export default AnalyticsScreen;

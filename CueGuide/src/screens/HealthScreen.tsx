import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore, DailyHealthSummary } from '../stores/healthStore';
import { useCompletionStore } from '../stores/completionStore';

export default function HealthScreen() {
  const { getWeeklySummary, isConnected, lastSync } = useHealthStore();
  const { getWeeklyStats } = useCompletionStore();
  
  const healthData = getWeeklySummary();
  const routineStats = getWeeklyStats();
  const todayData = healthData[healthData.length - 1];
  
  const getCorrelationInsight = () => {
    // Simple correlation logic
    if (todayData && todayData.steps > 5000 && todayData.sleepHours > 6) {
      return {
        text: 'Good day! Higher activity and sleep correlate with better routine completion.',
        color: '#22c55e',
      };
    } else if (todayData && todayData.sleepHours < 5) {
      return {
        text: 'Low sleep today may affect tomorrow\'s routine engagement.',
        color: '#f59e0b',
      };
    }
    return {
      text: 'Track health data to see patterns in routine completion.',
      color: '#6366f1',
    };
  };
  
  const insight = getCorrelationInsight();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Health & Activity</Text>
          <View style={styles.connectionBadge}>
            <View style={[styles.dot, { backgroundColor: isConnected ? '#22c55e' : '#f59e0b' }]} />
            <Text style={styles.connectionText}>
              {isConnected ? 'Connected' : 'Demo Mode'}
            </Text>
          </View>
        </View>

        {/* Today's Summary */}
        {todayData && (
          <View style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today</Text>
            <View style={styles.todayMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{todayData.steps.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Steps</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{todayData.sleepHours}h</Text>
                <Text style={styles.metricLabel}>Sleep</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{todayData.avgHeartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
              </View>
            </View>
          </View>
        )}

        {/* Correlation Insight */}
        <View style={[styles.insightCard, { borderLeftColor: insight.color }]}>
          <Text style={styles.insightTitle}>💡 Insight</Text>
          <Text style={styles.insightText}>{insight.text}</Text>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartContainer}>
            {healthData.map((day, index) => {
              const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
              const heightPercent = Math.min((day.steps / 10000) * 100, 100);
              
              return (
                <View key={day.date} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { height: `${heightPercent}%` },
                        day.steps > 5000 ? styles.barGood : day.steps > 2000 ? styles.barOk : styles.barLow
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{dayName}</Text>
                  <Text style={styles.barValue}>{Math.round(day.steps / 1000)}k</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Health vs Routine Correlation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health-Routine Correlation</Text>
          <View style={styles.correlationCard}>
            <View style={styles.correlationRow}>
              <Text style={styles.correlationLabel}>Avg Daily Steps</Text>
              <Text style={styles.correlationValue}>
                {Math.round(healthData.reduce((a, b) => a + b.steps, 0) / 7).toLocaleString()}
              </Text>
            </View>
            <View style={styles.correlationRow}>
              <Text style={styles.correlationLabel}>Avg Sleep</Text>
              <Text style={styles.correlationValue}>
                {(healthData.reduce((a, b) => a + b.sleepHours, 0) / 7).toFixed(1)}h
              </Text>
            </View>
            <View style={styles.correlationRow}>
              <Text style={styles.correlationLabel}>Routine Completion</Text>
              <Text style={styles.correlationValue}>
                {routineStats.total > 0 
                  ? Math.round((routineStats.completed / routineStats.total) * 100) 
                  : 0}%
              </Text>
            </View>
          </View>
          <Text style={styles.correlationNote}>
            Higher activity and sleep correlate with better routine adherence for dementia patients.
          </Text>
        </View>

        {/* Connect Health App */}
        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectButtonText}>🔗 Connect Apple Health</Text>
        </TouchableOpacity>

        {/* Last Sync */}
        {lastSync && (
          <Text style={styles.lastSync}>
            Last synced: {new Date(lastSync).toLocaleString()}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  todayCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  todayMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#2a2a3e',
    marginHorizontal: 10,
  },
  insightCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    width: 24,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barGood: {
    backgroundColor: '#22c55e',
  },
  barOk: {
    backgroundColor: '#f59e0b',
  },
  barLow: {
    backgroundColor: '#ef4444',
  },
  barLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
  },
  barValue: {
    fontSize: 8,
    color: '#6b7280',
  },
  correlationCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
  },
  correlationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  correlationLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  correlationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  correlationNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  connectButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lastSync: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
});
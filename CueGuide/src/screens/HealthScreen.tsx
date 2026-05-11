import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore, DailyHealthSummary } from '../stores/healthStore';
import { usePatientStore } from '../stores/patientStore';
import { format } from 'date-fns';

export default function HealthScreen() {
  const {
    metrics,
    isConnected,
    lastSync,
    permissionsGranted,
    isLoading,
    requestPermissions,
    syncHealthData,
    getWeeklySummary,
  } = useHealthStore();
  const { profile } = usePatientStore();

  const weekly = getWeeklySummary();
  const today = weekly[weekly.length - 1];

  const handleConnectHealth = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await syncHealthData();
    }
  };

  const healthLabel = 'Apple Health';
  const healthIcon = '🍎';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {!isConnected && (
          <View style={styles.connectBanner}>
            <View style={styles.connectRow}>
              <Text style={styles.connectIcon}>{healthIcon}</Text>
              <View style={styles.connectText}>
                <Text style={styles.connectTitle}>Connect {healthLabel}</Text>
                <Text style={styles.connectDesc}>Track activity, sleep, and heart rate alongside care routines</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.connectBtn} onPress={handleConnectHealth}>
              <Text style={styles.connectBtnText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}

        {isConnected && (
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Connected · Last sync: {lastSync ? format(new Date(lastSync), 'h:mm a') : 'Never'}</Text>
          </View>
        )}

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.metricCard, { backgroundColor: '#6366f1' + '20' }]}>
              <Text style={styles.metricIcon}>👟</Text>
              <Text style={styles.metricValue}>{today?.steps?.toLocaleString() ?? '—'}</Text>
              <Text style={styles.metricLabel}>Steps</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#8b5cf6' + '20' }]}>
              <Text style={styles.metricIcon}>😴</Text>
              <Text style={styles.metricValue}>{today?.sleepHours ?? '—'}</Text>
              <Text style={styles.metricLabel}>Hours sleep</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#ec4899' + '20' }]}>
              <Text style={styles.metricIcon}>❤️</Text>
              <Text style={styles.metricValue}>{today?.avgHeartRate ?? '—'}</Text>
              <Text style={styles.metricLabel}>Avg HR</Text>
            </View>
          </View>
        </View>

        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyChart}>
            {weekly.map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: day.steps > 0 ? Math.max(8, (day.steps / 10000) * 80) : 4,
                        backgroundColor: i === weekly.length - 1 ? '#6366f1' : '#4b5563',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>
                  {format(new Date(day.date), 'EEE').charAt(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { flex: 1, padding: 20 },
  connectBanner: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  connectRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  connectIcon: { fontSize: 28 },
  connectText: { flex: 1 },
  connectTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  connectDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 18 },
  connectBtn: { backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  connectBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  syncText: { fontSize: 12, color: '#9ca3af' },
  todaySection: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  cardsRow: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  metricIcon: { fontSize: 24, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  metricLabel: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  weeklySection: {},
  weeklyChart: { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 8, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 },
  dayCol: { flex: 1, alignItems: 'center' },
  barWrapper: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  dayLabel: { fontSize: 11, color: '#6b7280', marginTop: 8, fontWeight: '600' },
});
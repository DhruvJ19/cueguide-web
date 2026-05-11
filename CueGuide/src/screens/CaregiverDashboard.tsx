import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore } from '../stores/routineStore';
import { usePatientStore } from '../stores/patientStore';
import { useCompletionStore } from '../stores/completionStore';
import { format } from 'date-fns';

interface Props {
  onStartRoutine: (id: string) => void;
  onNavigateToPatient: () => void;
}

export default function CaregiverDashboard({ onStartRoutine, onNavigateToPatient }: Props) {
  const { routines, adjustments } = useRoutineStore();
  const { profile } = usePatientStore();
  const { completions, getWeeklyStats } = useCompletionStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = completions.filter(c => c.date === today);
  const weeklyStats = getWeeklyStats();
  
  const getRoutineStatus = (routineId: string) => {
    const completion = todayCompletions.find(c => c.routineId === routineId);
    if (!completion) return 'upcoming';
    return completion.status;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'partial': return '#f59e0b';
      case 'missed': return '#ef4444';
      default: return '#6366f1';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.caregiverName}>{profile?.primaryCaregiverName || 'Caregiver'}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Patient</Text>
            <Text style={styles.patientName}>{profile?.name || 'Patient'}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.partial}</Text>
            <Text style={styles.statLabel}>Partial</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Today's Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Routines</Text>
          {routines.filter(r => r.isActive).map((routine) => {
            const status = getRoutineStatus(routine.id);
            const completion = todayCompletions.find(c => c.routineId === routine.id);
            
            return (
              <TouchableOpacity 
                key={routine.id}
                style={[styles.routineCard, { borderLeftColor: getStatusColor(status) }]}
                onPress={() => onStartRoutine(routine.id)}
              >
                <View style={styles.routineHeader}>
                  <View style={styles.routineInfo}>
                    <Text style={styles.routineIcon}>{routine.steps[0]?.icon || '📋'}</Text>
                    <View>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineTime}>{routine.scheduledTime}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                {completion && (
                  <View style={styles.completionInfo}>
                    <Text style={styles.completionText}>
                      {completion.stepsCompleted}/{completion.stepsTotal} steps • {completion.minutes} min
                      {completion.mood && ` • ${completion.mood}`}
                    </Text>
                  </View>
                )}
                
                <View style={styles.stepsPreview}>
                  {routine.steps.slice(0, 3).map((step, idx) => (
                    <Text key={step.id} style={styles.stepPreview}>
                      {step.icon} {step.instruction.slice(0, 20)}...
                    </Text>
                  ))}
                  {routine.steps.length > 3 && (
                    <Text style={styles.moreSteps}>+{routine.steps.length - 3} more steps</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule Adjustments */}
        {adjustments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule Suggestions</Text>
            {adjustments.map((adj) => (
              <View key={adj.id} style={styles.adjustmentCard}>
                <Text style={styles.adjustmentTitle}>{adj.routineName}</Text>
                <Text style={styles.adjustmentText}>
                  Suggest changing from {adj.currentTime} to {adj.suggestedTime}
                </Text>
                <Text style={styles.adjustmentReason}>{adj.reason}</Text>
                <View style={styles.adjustmentActions}>
                  <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Text style={styles.rejectBtnText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Patient View Button */}
        <TouchableOpacity style={styles.patientViewBtn} onPress={onNavigateToPatient}>
          <Text style={styles.patientViewBtnText}>View as Patient →</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#9ca3af',
  },
  caregiverName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  patientInfo: {
    alignItems: 'flex-end',
  },
  patientLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  patientName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  routineCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routineIcon: {
    fontSize: 32,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  routineTime: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completionInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  completionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  stepsPreview: {
    marginTop: 12,
    gap: 6,
  },
  stepPreview: {
    fontSize: 13,
    color: '#6b7280',
  },
  moreSteps: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
  adjustmentCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  adjustmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  adjustmentText: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 8,
  },
  adjustmentReason: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
  adjustmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 14,
  },
  patientViewBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  patientViewBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
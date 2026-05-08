import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CaregiverDashboard from './src/screens/CaregiverDashboard';
import PatientFocusMode from './src/screens/PatientFocusMode';
import MedicationsScreen from './src/screens/MedicationsScreen';
import HealthScreen from './src/screens/HealthScreen';
import { useRoutineStore } from './src/stores/routineStore';
import { useCompletionStore } from './src/stores/completionStore';
import { useAuthStore } from './src/stores/authStore';

type Tab = 'dashboard' | 'medications' | 'health' | 'patient';

export default function App() {
  const { routines } = useRoutineStore();
  const { addCompletion } = useCompletionStore();
  const { role, setRole } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [isInRoutine, setIsInRoutine] = useState(false);
  
  const handleStartRoutine = (routineId: string) => {
    setActiveRoutineId(routineId);
    setIsInRoutine(true);
    setRole('patient');
  };
  
  const handleCompleteRoutine = (status: 'completed' | 'partial', minutes: number, stepsCompleted: number, mood?: string) => {
    if (activeRoutineId) {
      addCompletion({
        routineId: activeRoutineId,
        date: new Date().toISOString().split('T')[0],
        status,
        minutes,
        stepsCompleted,
        stepsTotal: routines.find(r => r.id === activeRoutineId)?.steps.length || 0,
        mood,
      });
    }
    setIsInRoutine(false);
    setActiveRoutineId(null);
    setRole('caregiver');
    setActiveTab('dashboard');
  };
  
  const handleExitRoutine = () => {
    setIsInRoutine(false);
    setActiveRoutineId(null);
    setRole('caregiver');
    setActiveTab('dashboard');
  };

  // If in routine mode, show only patient focus mode
  if (isInRoutine && activeRoutineId) {
    const routine = routines.find(r => r.id === activeRoutineId);
    if (!routine) return null;
    
    return (
      <PatientFocusMode 
        routine={routine}
        onComplete={handleCompleteRoutine}
        onExit={handleExitRoutine}
      />
    );
  }
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              Caregiver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'medications' && styles.activeTab]}
            onPress={() => setActiveTab('medications')}
          >
            <Text style={[styles.tabText, activeTab === 'medications' && styles.activeTabText]}>
              💊 Meds
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'health' && styles.activeTab]}
            onPress={() => setActiveTab('health')}
          >
            <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
              ❤️ Health
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'patient' && styles.activeTab]}
            onPress={() => setActiveTab('patient')}
          >
            <Text style={[styles.tabText, activeTab === 'patient' && styles.activeTabText]}>
              Patient
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        {activeTab === 'dashboard' ? (
          <CaregiverDashboard 
            onStartRoutine={handleStartRoutine}
            onNavigateToPatient={() => {
              if (routines.length > 0) {
                handleStartRoutine(routines[0].id);
              }
            }}
          />
        ) : activeTab === 'medications' ? (
          <MedicationsScreen />
        ) : activeTab === 'health' ? (
          <HealthScreen />
        ) : (
          <View style={styles.patientLanding}>
            <Text style={styles.patientTitle}>Patient View</Text>
            <Text style={styles.patientSubtitle}>Select a routine to begin</Text>
            <View style={styles.routineList}>
              {routines.filter(r => r.isActive).map((routine) => (
                <TouchableOpacity 
                  key={routine.id}
                  style={styles.routineBtn}
                  onPress={() => handleStartRoutine(routine.id)}
                >
                  <Text style={styles.routineBtnIcon}>{routine.steps[0]?.icon}</Text>
                  <Text style={styles.routineBtnText}>{routine.name}</Text>
                  <Text style={styles.routineBtnTime}>{routine.scheduledTime}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#fff',
  },
  patientLanding: {
    flex: 1,
    padding: 20,
  },
  patientTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  patientSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
  },
  routineList: {
    gap: 12,
  },
  routineBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  routineBtnIcon: {
    fontSize: 32,
  },
  routineBtnText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  routineBtnTime: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
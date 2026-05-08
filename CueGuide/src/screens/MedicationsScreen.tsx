import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicationStore } from '../stores/medicationStore';

export default function MedicationsScreen() {
  const { medications, toggleActive } = useMedicationStore();
  
  const activeMeds = medications.filter(m => m.isActive);
  const inactiveMeds = medications.filter(m => !m.isActive);
  
  const getPillColor = (color?: string) => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'white': return '#f3f4f6';
      case 'yellow': return '#fcd34d';
      case 'red': return '#ef4444';
      case 'green': return '#22c55e';
      default: return '#9ca3af';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Medications</Text>
          <Text style={styles.subtitle}>{activeMeds.length} active medications</Text>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {['08:00', '12:00', '18:00', '21:00'].map((time) => {
            const medsAtTime = activeMeds.filter(m => m.times.includes(time));
            if (medsAtTime.length === 0) return null;
            
            return (
              <View key={time} style={styles.timeBlock}>
                <Text style={styles.timeLabel}>{time}</Text>
                <View style={styles.medsRow}>
                  {medsAtTime.map((med) => (
                    <View key={med.id} style={styles.medCard}>
                      <View style={[styles.pillDot, { backgroundColor: getPillColor(med.pillColor) }]} />
                      <View style={styles.medInfo}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDosage}>{med.dosage}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* All Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Medications</Text>
          {activeMeds.map((med) => (
            <TouchableOpacity 
              key={med.id}
              style={styles.medItem}
              onPress={() => toggleActive(med.id)}
            >
              <View style={styles.medItemLeft}>
                <View style={[styles.pillIcon, { backgroundColor: getPillColor(med.pillColor) + '30' }]}>
                  <View style={[styles.pillShape, { backgroundColor: getPillColor(med.pillColor) }]} />
                </View>
                <View>
                  <Text style={styles.medItemName}>{med.name}</Text>
                  <Text style={styles.medItemDetails}>
                    {med.dosage} • {med.frequency}
                  </Text>
                  <Text style={styles.medItemTimes}>
                    Times: {med.times.join(', ')}
                  </Text>
                </View>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {inactiveMeds.map((med) => (
            <TouchableOpacity 
              key={med.id}
              style={[styles.medItem, styles.inactiveMed]}
              onPress={() => toggleActive(med.id)}
            >
              <View style={styles.medItemLeft}>
                <View style={[styles.pillIcon, { backgroundColor: '#f3f4f6' }]}>
                  <View style={[styles.pillShape, { backgroundColor: '#9ca3af' }]} />
                </View>
                <View>
                  <Text style={[styles.medItemName, styles.inactiveText]}>{med.name}</Text>
                  <Text style={styles.medItemDetails}>
                    {med.dosage} • {med.frequency}
                  </Text>
                </View>
              </View>
              <Text style={styles.inactiveBadge}>Inactive</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Medication Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Medication</Text>
        </TouchableOpacity>

        {/* Refill Reminders */}
        {activeMeds.filter(m => m.refillDate).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refill Reminders</Text>
            {activeMeds.filter(m => m.refillDate).map((med) => (
              <View key={med.id} style={styles.refillCard}>
                <Text style={styles.refillMed}>{med.name}</Text>
                <Text style={styles.refillDate}>Refill by: {med.refillDate}</Text>
              </View>
            ))}
          </View>
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
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
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
  timeBlock: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
  },
  medsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  medCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: '45%',
  },
  pillDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  medDosage: {
    fontSize: 12,
    color: '#9ca3af',
  },
  medItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inactiveMed: {
    opacity: 0.6,
  },
  medItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pillIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillShape: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  medItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveText: {
    color: '#9ca3af',
  },
  medItemDetails: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  medItemTimes: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#22c55e20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveBadge: {
    color: '#9ca3af',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refillCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  refillMed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  refillDate: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 4,
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

interface Props {
  onFinish: (caregiverId: string, patientId: string) => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const { role } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [caregiverName, setCaregiverName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [stage, setStage] = useState<'early' | 'moderate' | 'late'>('early');
  const [context, setContext] = useState('');

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated. Please sign in again.');
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('caregivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        onFinish(existing.id, '');
        return;
      }

      const { data: caregiver, error: caregiverError } = await supabase
        .from('caregivers')
        .insert({
          user_id: user.id,
          name: caregiverName.trim() || 'Sarah',
          email: user.email,
          patient_call_name: caregiverName.trim() || 'Sarah',
        })
        .select()
        .single();

      if (caregiverError) throw caregiverError;

      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          caregiver_id: caregiver.id,
          name: patientName.trim(),
          preferred_name: preferredName.trim() || patientName.trim(),
          stage,
          context: context.trim() || null,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
          patient_id: patient.id,
          name: 'Morning Routine',
          category: 'hygiene',
          scheduled_time: '08:00',
          recurrence: ['daily'],
          is_active: true,
        })
        .select()
        .single();

      if (routineError) throw routineError;

      const steps = [
        { routine_id: routine.id, position: 1, instruction: 'Wash your face with warm water', help_text: 'Use a soft washcloth and warm water from the tap.', icon: '🚿', estimated_seconds: 120 },
        { routine_id: routine.id, position: 2, instruction: 'Brush your teeth for 2 minutes', help_text: 'Use a pea-sized amount of toothpaste.', icon: '🪥', estimated_seconds: 120 },
        { routine_id: routine.id, position: 3, instruction: 'Comb your hair', help_text: 'A wide-toothed comb works best.', icon: '💇', estimated_seconds: 60 },
        { routine_id: routine.id, position: 4, instruction: 'Get dressed for the day', help_text: 'Lay out clothes the night before to make this easier.', icon: '👔', estimated_seconds: 300 },
      ];

      const { error: stepsError } = await supabase.from('steps').insert(steps);
      if (stepsError) console.error('Steps error:', stepsError);

      onFinish(caregiver.id, patient.id);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step + 1) / 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        {step === 0 && (
          <View>
            <Text style={styles.title}>Hi, I'm Sarah</Text>
            <Text style={styles.subtitle}>What should your loved one call you?</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                value={caregiverName}
                onChangeText={setCaregiverName}
                placeholder="Sarah"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              style={[styles.btn, !caregiverName.trim() && styles.btnDisabled]}
              onPress={() => caregiverName.trim() && setStep(1)}
              disabled={!caregiverName.trim()}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.title}>Who are you caring for?</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Robert Chen"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>What do they like to be called?</Text>
              <TextInput
                value={preferredName}
                onChangeText={setPreferredName}
                placeholder="Dad"
                placeholderTextColor="#6b7280"
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stage of dementia</Text>
              <View style={styles.stageRow}>
                {(['early', 'moderate', 'late'] as const).map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStage(s)}
                    style={[styles.stageBtn, stage === s && styles.stageBtnActive]}
                  >
                    <Text style={[styles.stageBtnText, stage === s && styles.stageBtnTextActive]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes about their daily life</Text>
              <TextInput
                value={context}
                onChangeText={setContext}
                placeholder="Lives with wife Margaret. Orange tabby cat named Ginger..."
                placeholderTextColor="#6b7280"
                multiline
                style={[styles.input, styles.textArea]}
              />
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(0)}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, !patientName.trim() && styles.btnDisabled, { flex: 1 }]}
                onPress={() => patientName.trim() && setStep(2)}
                disabled={!patientName.trim()}
              >
                <Text style={styles.btnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>You're all set, {caregiverName}</Text>
            <Text style={styles.subtitle}>We've created a sample morning routine for {preferredName || patientName}. You can customize it from your dashboard.</Text>

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.sampleCard}>
              <Text style={styles.sampleLabel}>Sample routine</Text>
              <View style={styles.sampleRow}>
                <Text style={styles.sampleIcon}>🚿</Text>
                <View>
                  <Text style={styles.sampleName}>Morning Routine</Text>
                  <Text style={styles.sampleMeta}>8:00 AM · 4 steps</Text>
                </View>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { flex: 1 }]}
                onPress={handleFinish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Go to dashboard</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  progressBar: { height: 4, backgroundColor: '#1a1a2e' },
  progressFill: { height: '100%', backgroundColor: '#6366f1' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9ca3af', marginBottom: 32 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  stageRow: { flexDirection: 'row', gap: 10 },
  stageBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#374151', alignItems: 'center', backgroundColor: '#1a1a2e' },
  stageBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  stageBtnText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  stageBtnTextActive: { color: '#fff' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  backBtnText: { fontSize: 16, fontWeight: '600', color: '#9ca3af' },
  sampleCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, marginTop: 16 },
  sampleLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  sampleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sampleIcon: { fontSize: 28 },
  sampleName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  sampleMeta: { fontSize: 13, color: '#9ca3af' },
  errorCard: { backgroundColor: '#450a0a', borderRadius: 12, padding: 16, marginBottom: 16 },
  errorText: { color: '#fca5a5', fontSize: 14 },
});
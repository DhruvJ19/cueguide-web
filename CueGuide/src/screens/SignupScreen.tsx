import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUpWithOtp } from '../services/supabase';

interface Props {
  onSignup: () => void;
  onLogin: () => void;
}

export default function SignupScreen({ onSignup, onLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing fields', 'Please enter your name and email address.');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithOtp(email.trim(), name.trim(), phone.trim() || undefined);

    if (error) {
      Alert.alert('Signup failed', error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CueGuide</Text>
            </View>
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>We sent a magic link to {email}</Text>
          <Text style={styles.desc}>Click the link to activate your account. It expires in 1 hour.</Text>
          <TouchableOpacity style={styles.linkBtn} onPress={onLogin}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CueGuide</Text>
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.desc}>Start caring for your loved one</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Sarah"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="sarah@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone <Text style={styles.optional}>(optional — for notifications)</Text></Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 555 000 1234"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={onLogin}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 56, height: 56, backgroundColor: '#6366f1', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 16, color: '#9ca3af', textAlign: 'center' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 },
  optional: { fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  input: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, color: '#9ca3af' },
  linkBold: { color: '#818cf8', fontWeight: '600' },
});
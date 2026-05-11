import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithOtp } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

interface Props {
  onLogin: () => void;
  onSignup: () => void;
}

export default function LoginScreen({ onLogin, onSignup }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await signInWithOtp(email.trim());

    if (error) {
      Alert.alert('Login failed', error.message);
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
          <Text style={styles.desc}>Click the link to sign in. It expires in 1 hour.</Text>
          <TouchableOpacity style={styles.linkBtn} onPress={() => setSent(false)}>
            <Text style={styles.linkText}>Use a different email</Text>
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.desc}>Sign in to check on your loved one</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleMagicLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send magic link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={onSignup}>
            <Text style={styles.linkText}>New to CueGuide? <Text style={styles.linkBold}>Create account</Text></Text>
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
  input: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff' },
  btn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, color: '#9ca3af' },
  linkBold: { color: '#818cf8', fontWeight: '600' },
});
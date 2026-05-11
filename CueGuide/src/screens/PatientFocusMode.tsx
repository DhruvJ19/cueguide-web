import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Routine, Step } from '../types';
import { usePatientStore } from '../stores/patientStore';
import { format } from 'date-fns';
import { speakGentle, stopSpeaking } from '../services/voice';

interface Props {
  routine: Routine;
  onComplete: (status: 'completed' | 'partial', minutes: number, stepsCompleted: number, mood?: string) => void;
  onExit: () => void;
}

export default function PatientFocusMode({ routine, onComplete, onExit }: Props) {
  const { profile } = usePatientStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime] = useState(new Date());
  const [showGreeting, setShowGreeting] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  
  const currentStep = routine.steps[currentStepIndex];
  const totalSteps = routine.steps.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';
    
    return `${timeGreeting}, ${profile?.preferredName || 'there'}. It's ${format(now, 'EEEE, MMMM d')}. Let's get started with your ${routine.name}.`;
  };
  
  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete
      const endTime = new Date();
      const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      setShowCompletion(true);
      setTimeout(() => {
        onComplete('completed', minutes, totalSteps, 'Great');
      }, 2000);
    }
  };
  
  const handleSkip = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      const endTime = new Date();
      const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      onComplete('partial', minutes, currentStepIndex + 1, 'Okay');
    }
  };
  
  if (showGreeting) {
    return (
      <View style={styles.greetingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <TouchableOpacity 
          style={styles.startBtn}
          onPress={() => setShowGreeting(false)}
        >
          <Text style={styles.startBtnText}>Let's begin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>Exit</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (showCompletion) {
    return (
      <View style={styles.completionContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.celebrationEmoji}>✨</Text>
        <Text style={styles.completionTitle}>All done!</Text>
        <Text style={styles.completionText}>
          Great job completing your {routine.name}, {profile?.preferredName || 'there'}!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.stepCounter}>Step {currentStepIndex + 1} of {totalSteps}</Text>
      
      {/* Main Content */}
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.voiceButton}
          onPress={() => speakGentle(currentStep.instruction)}
        >
          <Text style={styles.voiceButtonText}>🔊 Read aloud</Text>
        </TouchableOpacity>
        <Text style={styles.stepIcon}>{currentStep.icon}</Text>
        <Text style={styles.instruction}>{currentStep.instruction}</Text>
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleNext}
        >
          <Text style={styles.doneButtonText}>Done ✓</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => {}}
          >
            <Text style={styles.helpButtonText}>Help</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Exit button (subtle) */}
      <TouchableOpacity style={styles.smallExit} onPress={onExit}>
        <Text style={styles.smallExitText}>Exit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefdfb',
  },
  greetingContainer: {
    flex: 1,
    backgroundColor: '#fefdfb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  greetingText: {
    fontSize: 32,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 40,
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  exitBtn: {
    padding: 10,
  },
  exitBtnText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  completionContainer: {
    flex: 1,
    backgroundColor: '#fefdfb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 40,
    color: '#22c55e',
    fontWeight: '700',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 24,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 36,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  stepCounter: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  voiceButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 30,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 32,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 48,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  doneButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  helpButtonText: {
    color: '#4b5563',
    fontSize: 18,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  skipButtonText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '500',
  },
  smallExit: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  smallExitText: {
    color: '#d1d5db',
    fontSize: 14,
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Image, Linking, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
// Networking disabled: avoid external browser/payment flows
import { useApp } from '@/providers/app-provider';
import { apiService } from '@/services/api';

export default function LoginScreen() {
  const [mentorId, setMentorId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  // In-app modal (reliable on iOS Safari)
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [paymentVisible, setPaymentVisible] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const { setUser } = useApp();

  const handleProceed = async () => {
    if (!mentorId.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedMentor = mentorId.trim();
      const account = await apiService.authenticate({ email: trimmedEmail, mentor: trimmedMentor });

      // If user doesn't exist or hasn't paid: redirect to payment/shop page
      if (account.status === 'not_found' || !account.paid) {
        const url = `https://tradeportea.com/shop/?email=${encodeURIComponent(trimmedEmail)}&mentor=${encodeURIComponent(trimmedMentor)}`;
        setPaymentUrl(url);
        setPaymentVisible(true);
        return;
      }

      // If invalid mentor id is returned, block with message
      if ((account as any).invalidMentor === 1) {
        setModalTitle('Invalid Mentor ID');
        setModalMessage('The Mentor ID does not match our records for this email.');
        setModalVisible(true);
        return;
      }

      // If already used: show iOS-safe in-app modal and block
      if (account.used) {
        setModalTitle('Email Already Used');
        setModalMessage('This email has already been used on a device. Please contact support if you need assistance.');
        setModalVisible(true);
        return;
      }

      // Allow only existing + not used
      setUser({ mentorId: trimmedMentor, email: account.email });
      router.push('/license');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentFlow = async () => {
    // Offline mode: do nothing
    setIsPaymentProcessing(false);
    Alert.alert('Offline mode', 'Payments are disabled. Continuing locally.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.appIcon}
                resizeMode="contain"
              />
              <Text style={styles.title}>Login</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Mentor ID"
                placeholderTextColor="#999999"
                value={mentorId}
                onChangeText={setMentorId}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.proceedButton, (isLoading || isPaymentProcessing) && styles.proceedButtonDisabled]}
                onPress={handleProceed}
                disabled={isLoading || isPaymentProcessing}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.proceedButtonText}>Checking...</Text>
                  </View>
                ) : isPaymentProcessing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.proceedButtonText}>Processing Payment...</Text>
                  </View>
                ) : (
                  <Text style={styles.proceedButtonText}>Proceed</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {paymentVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { width: '100%', maxWidth: 800, height: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.modalTitle}>Complete Payment</Text>
              <TouchableOpacity onPress={() => setPaymentVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#000000' }]}>Close</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' ? (
              <View style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
                {/* On web, render the payment page inline via iframe inside the modal */}
                <iframe
                  src={paymentUrl}
                  style={{ width: '100%', height: '100%', border: '0' }}
                  loading="eager"
                  allow="payment *; clipboard-write;"
                />
              </View>
            ) : (
              <View style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
                <WebView source={{ uri: paymentUrl }} startInLoadingState />
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(255, 26, 26, 0.9) 0%, rgba(255, 26, 26, 0.5) 30%, rgba(255, 26, 26, 0.1) 65%, rgba(0, 0, 0, 0.95) 90%, rgba(0, 0, 0, 1) 100%)',
    }),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF1A1A',
    marginTop: 20,
    letterSpacing: 2,
    textShadowColor: '#FF1A1A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 0 10px rgba(255, 26, 26, 0.6))',
    }),
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.6)',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  proceedButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  proceedButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.6)',
    shadowColor: '#FF1A1A',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 20,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(20px)',
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 26, 26, 0.4)',
    shadowColor: '#FF1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
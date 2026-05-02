import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '../../stores/userStore';
import { isValidEmail, isValidPassword } from '../../utils/helpers';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signUp, isLoading, error, clearError } = useUserStore();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    clearError();
    if (!validate()) return;

    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Button
                mode="text"
                onPress={() => router.back()}
                icon="close"
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="book-open-page-variant" size={64} color="#6366F1" />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your learning journey today</Text>
            </View>

            {/* Form */}
            <Surface style={styles.form} elevation={2}>
              <TextInput
                label="Full Name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setErrors((prev) => ({ ...prev, displayName: undefined }));
                }}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                error={!!errors.displayName}
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              {errors.displayName && (
                <HelperText type="error" visible={!!errors.displayName}>
                  {errors.displayName}
                </HelperText>
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              {errors.email && (
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              )}

              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                mode="outlined"
                secureTextEntry={!showPassword}
                error={!!errors.password}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && (
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password}
                </HelperText>
              )}

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                mode="outlined"
                secureTextEntry={!showPassword}
                error={!!errors.confirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />
              {errors.confirmPassword && (
                <HelperText type="error" visible={!!errors.confirmPassword}>
                  {errors.confirmPassword}
                </HelperText>
              )}

              {error && (
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleSignup}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signupButton}
                contentStyle={styles.signupButtonContent}
              >
                Create Account
              </Button>
            </Surface>

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => router.replace('/auth/login')}
                compact
              >
                Sign In
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeButton: {
    marginLeft: -8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginBottom: 8,
  },
  signupButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  signupButtonContent: {
    paddingVertical: 8,
  },
  termsText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#6366F1',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#6B7280',
  },
});

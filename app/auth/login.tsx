import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '../../stores/userStore';
import { useGoogleAuth } from '../../hooks';
import { isValidEmail } from '../../utils/helpers';
import { NEO, BRUTAL, BRUTAL_SHADOW } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, sendPasswordReset, isLoading, error, clearError } = useUserStore();
  const { prompt: promptGoogle, ready: googleReady } = useGoogleAuth();
  const [isResetting, setIsResetting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleForgotPassword = async () => {
    clearError();
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Enter your email above to reset your password.',
      }));
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordReset(trimmed);
      Alert.alert(
        'Check your email',
        `If an account exists for ${trimmed}, we've sent a password-reset link.`
      );
    } catch (err: any) {
      Alert.alert('Could not send reset email', err?.message ?? 'Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Button
              mode="text"
              onPress={() => router.back()}
              icon="close"
              textColor={NEO.ink}
              labelStyle={styles.closeLabel}
            >
              CLOSE
            </Button>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="book-open-page-variant" size={36} color={NEO.ink} />
            </View>
            <Text style={styles.title}>WELCOME BACK</Text>
            <Text style={styles.subtitle}>Sign in to continue learning</Text>
          </View>

          <View style={styles.form}>
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
              outlineColor={NEO.ink}
              activeOutlineColor={NEO.ink}
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
              outlineColor={NEO.ink}
              activeOutlineColor={NEO.ink}
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

            {error && (
              <HelperText type="error" visible={!!error} style={styles.errorText}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              buttonColor={NEO.ink}
              textColor={NEO.white}
              labelStyle={styles.loginLabel}
            >
              SIGN IN
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="contained"
              onPress={() => promptGoogle()}
              disabled={!googleReady || isLoading}
              style={styles.googleButton}
              contentStyle={styles.loginButtonContent}
              buttonColor={NEO.white}
              textColor={NEO.ink}
              labelStyle={styles.googleLabel}
              icon="google"
            >
              CONTINUE WITH GOOGLE
            </Button>

            <Button
              mode="text"
              onPress={handleForgotPassword}
              loading={isResetting}
              disabled={isResetting}
              style={styles.forgotButton}
              textColor={NEO.ink}
              labelStyle={styles.forgotLabel}
            >
              FORGOT PASSWORD?
            </Button>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Button
              mode="text"
              onPress={() => router.replace('/auth/signup')}
              compact
              textColor={NEO.ink}
              labelStyle={styles.signupLink}
            >
              SIGN UP
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEO.cream,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  logoBadge: {
    width: 76,
    height: 76,
    backgroundColor: NEO.yellow,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    marginRight: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: NEO.ink,
    marginTop: 8,
    fontWeight: '600',
  },
  form: {
    borderRadius: BRUTAL.radius,
    padding: 22,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  input: {
    marginBottom: 8,
    backgroundColor: NEO.white,
  },
  errorText: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 14,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  loginButtonContent: {
    paddingVertical: 6,
  },
  loginLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: NEO.ink,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.4,
  },
  googleButton: {
    marginTop: 12,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  googleLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  forgotButton: {
    marginTop: 8,
  },
  forgotLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    color: NEO.ink,
    fontWeight: '600',
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

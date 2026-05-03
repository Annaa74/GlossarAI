import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '../../stores/userStore';
import { useGoogleAuth } from '../../hooks';
import { isValidEmail, isValidPassword } from '../../utils/helpers';
import { NEO, BRUTAL, BRUTAL_SHADOW } from '../../constants/theme';

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
  const { prompt: promptGoogle, ready: googleReady } = useGoogleAuth();

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
      // Error handled by store
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
              <Text style={styles.title}>CREATE ACCOUNT</Text>
              <Text style={styles.subtitle}>Start your learning journey today</Text>
            </View>

            <View style={styles.form}>
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
                outlineColor={NEO.ink}
                activeOutlineColor={NEO.ink}
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
                outlineColor={NEO.ink}
                activeOutlineColor={NEO.ink}
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
                buttonColor={NEO.pink}
                textColor={NEO.ink}
                labelStyle={styles.signupBtnLabel}
              >
                CREATE ACCOUNT
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
                contentStyle={styles.signupButtonContent}
                buttonColor={NEO.white}
                textColor={NEO.ink}
                labelStyle={styles.googleLabel}
                icon="google"
              >
                CONTINUE WITH GOOGLE
              </Button>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => router.replace('/auth/login')}
                compact
                textColor={NEO.ink}
                labelStyle={styles.loginLink}
              >
                SIGN IN
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
    backgroundColor: NEO.cream,
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
  closeLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  logoBadge: {
    width: 76,
    height: 76,
    backgroundColor: NEO.pink,
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
    fontSize: 28,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.8,
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
  signupButton: {
    marginTop: 14,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  signupButtonContent: {
    paddingVertical: 6,
  },
  signupBtnLabel: {
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
  termsText: {
    textAlign: 'center',
    color: NEO.ink,
    fontSize: 11,
    marginTop: 16,
    paddingHorizontal: 20,
    fontWeight: '600',
    lineHeight: 16,
  },
  termsLink: {
    color: NEO.ink,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: NEO.ink,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

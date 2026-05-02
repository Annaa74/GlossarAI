import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import { lightTheme, darkTheme } from '../constants/theme';
import { subscribeToAuthChanges, getCurrentUser } from '../services/auth';

export default function RootLayout() {
  const { settings } = useSettingsStore();
  const { setUser, isAuthenticated } = useUserStore();

  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      // Subscribe to auth state changes. Wrapped in try/catch because
      // Firebase may not be configured in dev/demo mode.
      unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
        if (firebaseUser) {
          const user = await getCurrentUser();
          setUser(user);
        } else {
          // Don't clobber a locally-set guest user when Firebase emits null.
          const current = useUserStore.getState().user;
          if (current?.id?.startsWith('guest-')) return;
          setUser(null);
        }
      });
    } catch (e) {
      console.warn('[auth] Firebase subscription unavailable, running offline.', e);
    }

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="vocab/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import { useVocabStore } from '../stores/vocabStore';
import { lightTheme, darkTheme } from '../constants/theme';
import { subscribeToAuthChanges, getCurrentUser } from '../services/auth';
import { runGrowthCycle } from '../services/growthEngine';
import { syncRemoteVocab } from '../services/vocabManifest';
import { syncWordOfTheDayWidget } from '../widgets/sync';

export default function RootLayout() {
  const { settings } = useSettingsStore();
  const { setUser, isAuthenticated } = useUserStore();
  const vocabularies = useVocabStore((s) => s.vocabularies);

  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;

  // Push today's word to the home-screen widget whenever the vocab list
  // changes (initial seed, growth cycle, etc.). The sync function no-ops on
  // platforms where the widget native module isn't available.
  useEffect(() => {
    syncWordOfTheDayWidget(vocabularies).catch((e) =>
      console.warn('[widget-sync] sync failed:', e)
    );
  }, [vocabularies]);

  useEffect(() => {
    // Weekly automatic vocabulary growth from the local pool.
    try {
      runGrowthCycle();
    } catch (e) {
      console.warn('[growth] cycle failed', e);
    }

    // Layer 1 freshness: pull any new approved terms from the remote manifest.
    // No-op when EXPO_PUBLIC_VOCAB_MANIFEST_URL isn't configured.
    syncRemoteVocab()
      .then((r) => {
        if (r.added > 0) {
          console.info(`[vocab-manifest] applied v${r.remoteVersion}, +${r.added} terms`);
        }
      })
      .catch((e) => console.warn('[vocab-manifest] sync failed', e));
  }, []);

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
      <SafeAreaProvider>
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
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

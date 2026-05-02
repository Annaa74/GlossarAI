import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import {
  Text,
  Surface,
  Button,
  Switch,
  Divider,
  List,
  Avatar,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StreakBadge, Gradient } from '../../components';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNotifications } from '../../hooks';

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut } = useUserStore();
  const { settings, notificationSettings, updateTheme, toggleSound, toggleHaptic, updateNotificationSettings } = useSettingsStore();
  const { hasPermission, toggleNotifications } = useNotifications();

  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [reminderTime, setReminderTime] = useState(notificationSettings.reminderTime);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleUpdateReminderTime = async () => {
    await updateNotificationSettings({ reminderTime });
    setShowTimeDialog(false);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#9CA3AF" />
          <Text style={styles.authTitle}>Welcome to GlosserAI</Text>
          <Text style={styles.authSubtitle}>Sign in to track your progress and sync across devices</Text>
          <Button
            mode="contained"
            onPress={() => router.push('/auth/login')}
            style={styles.authButton}
          >
            Sign In
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/auth/signup')}
            style={styles.authButtonOutlined}
          >
            Create Account
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileWrap}>
          <Gradient
            colors={['#6366F1', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileBanner}
            borderRadius={24}
          />
          <Surface style={styles.profileCard} elevation={2}>
            <Avatar.Text
              size={80}
              label={user?.displayName?.slice(0, 2).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <Text style={styles.displayName}>{user?.displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user && user.streak > 0 && (
              <View style={styles.streakContainer}>
                <StreakBadge streak={user.streak} size="medium" />
              </View>
            )}
          </Surface>
        </View>

        {/* Study Stats */}
        <Surface style={styles.statsCard} elevation={2}>
          <Text style={styles.sectionTitle}>Study Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.lastStudyDate
                  ? new Date(user.lastStudyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '-'}
              </Text>
              <Text style={styles.statLabel}>Last Study</Text>
            </View>
          </View>
        </Surface>

        {/* Notifications */}
        <Surface style={styles.settingsCard} elevation={2}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <List.Item
            title="Daily Reminders"
            description={hasPermission ? 'Enabled' : 'Permission required'}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationSettings.enabled && hasPermission}
                onValueChange={toggleNotifications}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Reminder Time"
            description={notificationSettings.reminderTime}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            onPress={() => setShowTimeDialog(true)}
            disabled={!notificationSettings.enabled}
          />
        </Surface>

        {/* App Settings */}
        <Surface style={styles.settingsCard} elevation={2}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <List.Item
            title="Theme"
            description={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              updateTheme(nextTheme);
            }}
          />
          <Divider />
          <List.Item
            title="Sound Effects"
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch value={settings.soundEnabled} onValueChange={toggleSound} />
            )}
          />
          <Divider />
          <List.Item
            title="Haptic Feedback"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch value={settings.hapticEnabled} onValueChange={toggleHaptic} />
            )}
          />
        </Surface>

        {/* About */}
        <Surface style={styles.settingsCard} elevation={2}>
          <Text style={styles.sectionTitle}>About</Text>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Surface>

        {/* Sign Out */}
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          textColor="#EF4444"
        >
          Sign Out
        </Button>
      </ScrollView>

      {/* Time Picker Dialog */}
      <Portal>
        <Dialog visible={showTimeDialog} onDismiss={() => setShowTimeDialog(false)}>
          <Dialog.Title>Set Reminder Time</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Time (HH:MM)"
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="09:00"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTimeDialog(false)}>Cancel</Button>
            <Button onPress={handleUpdateReminderTime}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileWrap: {
    marginBottom: 16,
  },
  profileBanner: {
    height: 80,
    marginBottom: -56,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    backgroundColor: '#6366F1',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  streakContainer: {
    marginTop: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  settingsCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    overflow: 'hidden',
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  signOutButton: {
    marginTop: 8,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  authButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
  },
  authButtonOutlined: {
    width: '100%',
    borderRadius: 12,
  },
});

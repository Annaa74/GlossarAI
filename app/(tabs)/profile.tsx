import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Pressable,
  Linking,
  Share,
} from 'react-native';
import { Text, Button, Switch, Avatar, Portal, Dialog, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StreakBadge } from '../../components';
import {
  useThemedColors,
  NEO,
  BRUTAL,
  BRUTAL_SHADOW,
  BRUTAL_SHADOW_SM,
} from '../../constants/theme';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNotifications } from '../../hooks';
import { exportUserDataJson } from '../../services/dataExport';

type EditField = 'displayName' | 'email' | 'password' | null;

export default function ProfileScreen() {
  const {
    user,
    isAuthenticated,
    signOut,
    deleteAccount,
    updateDisplayName,
    updateEmail,
    updatePassword,
  } = useUserStore();
  const c = useThemedColors();
  const {
    settings,
    notificationSettings,
    updateTheme,
    toggleSound,
    toggleHaptic,
    updateNotificationSettings,
  } = useSettingsStore();
  const { hasPermission, toggleNotifications } = useNotifications();

  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [reminderTime, setReminderTime] = useState(notificationSettings.reminderTime);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Account self-service edit dialog. One dialog reused for all three fields
  // — the active `field` decides which inputs render and which action runs.
  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirm, setEditConfirm] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const isGuest = !!user?.id?.startsWith('guest-');

  // External URLs are env-driven — set EXPO_PUBLIC_PRIVACY_POLICY_URL and
  // EXPO_PUBLIC_TERMS_OF_SERVICE_URL to your hosted pages. Rows are disabled
  // when unset so we never link to a placeholder.
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL;

  const openExternalUrl = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Could not open link', 'Try copying the URL manually.');
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user?.id || isExporting) return;
    setIsExporting(true);
    try {
      const json = await exportUserDataJson(user.id);
      await Share.share({
        title: 'GlosserAI data export',
        message: json,
      });
    } catch (err) {
      Alert.alert('Export failed', 'Could not assemble your data right now. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleUpdateReminderTime = async () => {
    await updateNotificationSettings({ reminderTime });
    setShowTimeDialog(false);
  };

  const openDeleteDialog = () => {
    setDeletePassword('');
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const openEdit = (field: Exclude<EditField, null>) => {
    setEditField(field);
    setEditValue(field === 'displayName' ? (user?.displayName ?? '') : '');
    setEditPassword('');
    setEditConfirm('');
    setEditError(null);
    setEditSuccess(null);
  };

  const closeEdit = () => {
    if (editBusy) return;
    setEditField(null);
  };

  const handleEditSave = async () => {
    if (!editField) return;
    setEditError(null);

    // Per-field validation.
    if (editField === 'displayName') {
      const name = editValue.trim();
      if (name.length < 2) {
        setEditError('Name must be at least 2 characters.');
        return;
      }
    } else if (editField === 'email') {
      const email = editValue.trim();
      if (!email.includes('@')) {
        setEditError('Enter a valid email address.');
        return;
      }
      if (!editPassword) {
        setEditError('Enter your current password to confirm.');
        return;
      }
    } else if (editField === 'password') {
      if (!editPassword) {
        setEditError('Enter your current password.');
        return;
      }
      if (editValue.length < 8 || !/\d/.test(editValue)) {
        setEditError('New password must be 8+ characters with a number.');
        return;
      }
      if (editValue !== editConfirm) {
        setEditError('New passwords do not match.');
        return;
      }
    }

    setEditBusy(true);
    try {
      if (editField === 'displayName') {
        await updateDisplayName(editValue.trim());
        setEditSuccess('Name updated.');
      } else if (editField === 'email') {
        await updateEmail(editPassword, editValue.trim());
        setEditSuccess(
          'Verification link sent to the new address. Email changes take effect after you click it.'
        );
      } else if (editField === 'password') {
        await updatePassword(editPassword, editValue);
        setEditSuccess('Password updated.');
      }
      // Auto-close after a brief moment so the user sees the confirmation.
      setTimeout(() => setEditField(null), 1500);
    } catch {
      setEditError(useUserStore.getState().error ?? 'Could not save changes.');
    } finally {
      setEditBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isGuest && deletePassword.length === 0) {
      setDeleteError('Enter your current password to confirm.');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteDialog(false);
      router.replace('/');
    } catch (err: any) {
      setDeleteError(useUserStore.getState().error ?? 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.authPrompt}>
          <View style={styles.authIconWrap}>
            <MaterialCommunityIcons name="account-circle" size={56} color={NEO.ink} />
          </View>
          <Text style={styles.authTitle}>WELCOME TO GLOSSERAI</Text>
          <Text style={styles.authSubtitle}>
            Sign in to track your progress and sync across devices.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/auth/login')}
            style={styles.authButton}
            buttonColor={NEO.ink}
            textColor={NEO.white}
            labelStyle={styles.authBtnLabel}
          >
            SIGN IN
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/auth/signup')}
            style={styles.authButtonOutlined}
            buttonColor={NEO.lime}
            textColor={NEO.ink}
            labelStyle={styles.authBtnLabel}
          >
            CREATE ACCOUNT
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Avatar.Text
            size={80}
            label={user?.displayName?.slice(0, 2).toUpperCase() || 'U'}
            style={styles.avatar}
            color={NEO.ink}
            labelStyle={{ fontWeight: '900', fontSize: 28 }}
          />
          <Text style={styles.displayName}>{user?.displayName?.toUpperCase()}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user && user.streak > 0 && (
            <View style={styles.streakContainer}>
              <StreakBadge streak={user.streak} size="medium" />
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>STUDY STATS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.streak || 0}</Text>
              <Text style={styles.statLabel}>DAY STREAK</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.lastStudyDate
                  ? new Date(user.lastStudyDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </Text>
              <Text style={styles.statLabel}>LAST STUDY</Text>
            </View>
          </View>
        </View>

        {!isGuest && (
          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <SettingRow
              icon="account-edit"
              title="Display name"
              subtitle={user?.displayName ?? '—'}
              onPress={() => openEdit('displayName')}
              chevron
            />
            <SettingRow
              icon="email-edit"
              title="Email"
              subtitle={user?.email ?? '—'}
              onPress={() => openEdit('email')}
              chevron
            />
            <SettingRow
              icon="lock-reset"
              title="Password"
              subtitle="CHANGE PASSWORD"
              onPress={() => openEdit('password')}
              chevron
            />
          </View>
        )}

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <SettingRow
            icon="bell"
            title="Daily Reminders"
            subtitle={hasPermission ? 'ENABLED' : 'PERMISSION REQUIRED'}
            right={
              <Switch
                value={notificationSettings.enabled && hasPermission}
                onValueChange={toggleNotifications}
                color={NEO.ink}
              />
            }
          />
          <SettingRow
            icon="clock-outline"
            title="Reminder Time"
            subtitle={notificationSettings.reminderTime}
            onPress={() => setShowTimeDialog(true)}
            disabled={!notificationSettings.enabled}
          />
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          <SettingRow
            icon="theme-light-dark"
            title="Theme"
            subtitle={settings.theme.toUpperCase()}
            onPress={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              updateTheme(nextTheme);
            }}
          />
          <SettingRow
            icon="volume-high"
            title="Sound Effects"
            right={
              <Switch value={settings.soundEnabled} onValueChange={toggleSound} color={NEO.ink} />
            }
          />
          <SettingRow
            icon="vibrate"
            title="Haptic Feedback"
            right={
              <Switch value={settings.hapticEnabled} onValueChange={toggleHaptic} color={NEO.ink} />
            }
          />
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>YOUR DATA</Text>
          <SettingRow
            icon="download"
            title="Download my data"
            subtitle={isExporting ? 'PREPARING…' : 'EXPORT AS JSON'}
            onPress={handleExportData}
            disabled={isExporting}
            chevron
          />
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <SettingRow icon="information" title="Version" subtitle="1.0.0" />
          <SettingRow
            icon="shield-check"
            title="Privacy Policy"
            subtitle={privacyUrl ? undefined : 'NOT CONFIGURED'}
            onPress={privacyUrl ? () => openExternalUrl(privacyUrl) : undefined}
            disabled={!privacyUrl}
            chevron={!!privacyUrl}
          />
          <SettingRow
            icon="file-document"
            title="Terms of Service"
            subtitle={termsUrl ? undefined : 'NOT CONFIGURED'}
            onPress={termsUrl ? () => openExternalUrl(termsUrl) : undefined}
            disabled={!termsUrl}
            chevron={!!termsUrl}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          buttonColor={NEO.red}
          textColor={NEO.ink}
          labelStyle={styles.signOutLabel}
        >
          SIGN OUT
        </Button>

        <Button
          mode="text"
          onPress={openDeleteDialog}
          style={styles.deleteAccountButton}
          textColor={NEO.ink}
          labelStyle={styles.deleteAccountLabel}
          icon="trash-can-outline"
        >
          DELETE ACCOUNT
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={editField !== null} onDismiss={closeEdit}>
          <Dialog.Title>
            {editField === 'displayName'
              ? 'Edit name'
              : editField === 'email'
                ? 'Change email'
                : 'Change password'}
          </Dialog.Title>
          <Dialog.Content>
            {editField === 'displayName' && (
              <TextInput
                label="Display name"
                value={editValue}
                onChangeText={(t) => {
                  setEditValue(t);
                  setEditError(null);
                }}
                mode="outlined"
                outlineColor={NEO.ink}
                activeOutlineColor={NEO.ink}
                disabled={editBusy}
              />
            )}
            {editField === 'email' && (
              <>
                <TextInput
                  label="New email"
                  value={editValue}
                  onChangeText={(t) => {
                    setEditValue(t);
                    setEditError(null);
                  }}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  outlineColor={NEO.ink}
                  activeOutlineColor={NEO.ink}
                  disabled={editBusy}
                />
                <TextInput
                  label="Current password"
                  value={editPassword}
                  onChangeText={(t) => {
                    setEditPassword(t);
                    setEditError(null);
                  }}
                  mode="outlined"
                  secureTextEntry
                  autoCapitalize="none"
                  style={{ marginTop: 8 }}
                  outlineColor={NEO.ink}
                  activeOutlineColor={NEO.ink}
                  disabled={editBusy}
                />
              </>
            )}
            {editField === 'password' && (
              <>
                <TextInput
                  label="Current password"
                  value={editPassword}
                  onChangeText={(t) => {
                    setEditPassword(t);
                    setEditError(null);
                  }}
                  mode="outlined"
                  secureTextEntry
                  autoCapitalize="none"
                  outlineColor={NEO.ink}
                  activeOutlineColor={NEO.ink}
                  disabled={editBusy}
                />
                <TextInput
                  label="New password"
                  value={editValue}
                  onChangeText={(t) => {
                    setEditValue(t);
                    setEditError(null);
                  }}
                  mode="outlined"
                  secureTextEntry
                  autoCapitalize="none"
                  style={{ marginTop: 8 }}
                  outlineColor={NEO.ink}
                  activeOutlineColor={NEO.ink}
                  disabled={editBusy}
                />
                <TextInput
                  label="Confirm new password"
                  value={editConfirm}
                  onChangeText={(t) => {
                    setEditConfirm(t);
                    setEditError(null);
                  }}
                  mode="outlined"
                  secureTextEntry
                  autoCapitalize="none"
                  style={{ marginTop: 8 }}
                  outlineColor={NEO.ink}
                  activeOutlineColor={NEO.ink}
                  disabled={editBusy}
                />
              </>
            )}
            {editError && (
              <Text style={{ color: NEO.red, marginTop: 10, fontWeight: '700' }}>{editError}</Text>
            )}
            {editSuccess && (
              <Text style={{ color: NEO.ink, marginTop: 10, fontWeight: '700' }}>
                {editSuccess}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEdit} textColor={NEO.ink} disabled={editBusy}>
              Cancel
            </Button>
            <Button
              onPress={handleEditSave}
              textColor={NEO.ink}
              loading={editBusy}
              disabled={editBusy}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showTimeDialog} onDismiss={() => setShowTimeDialog(false)}>
          <Dialog.Title>Set Reminder Time</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Time (HH:MM)"
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="09:00"
              mode="outlined"
              outlineColor={NEO.ink}
              activeOutlineColor={NEO.ink}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTimeDialog(false)} textColor={NEO.ink}>
              Cancel
            </Button>
            <Button onPress={handleUpdateReminderTime} textColor={NEO.ink}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => !isDeleting && setShowDeleteDialog(false)}
        >
          <Dialog.Title>Delete account?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: NEO.ink, marginBottom: 12 }}>
              {isGuest
                ? 'This clears your guest profile and all local progress on this device. It cannot be undone.'
                : 'This permanently deletes your account, profile, and all cloud data. This cannot be undone.'}
            </Text>
            {!isGuest && (
              <TextInput
                label="Current password"
                value={deletePassword}
                onChangeText={(t) => {
                  setDeletePassword(t);
                  setDeleteError(null);
                }}
                mode="outlined"
                secureTextEntry
                autoCapitalize="none"
                outlineColor={NEO.ink}
                activeOutlineColor={NEO.ink}
              />
            )}
            {deleteError && (
              <Text style={{ color: NEO.red, marginTop: 10, fontWeight: '700' }}>
                {deleteError}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              textColor={NEO.ink}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onPress={handleDeleteAccount}
              textColor={NEO.red}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const SettingRow: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  chevron?: boolean;
}> = ({ icon, title, subtitle, right, onPress, disabled, chevron }) => {
  const content = (
    <View style={[styles.row, disabled && { opacity: 0.4 }]}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon as any} size={20} color={NEO.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {right}
      {chevron && <MaterialCommunityIcons name="chevron-right" size={22} color={NEO.ink} />}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: BRUTAL.radius,
    padding: 22,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: NEO.yellow,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginBottom: 16,
    marginRight: 4,
  },
  avatar: {
    backgroundColor: NEO.lime,
    marginBottom: 14,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 13,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '600',
  },
  streakContainer: {
    marginTop: 16,
  },
  statsCard: {
    borderRadius: BRUTAL.radius,
    padding: 18,
    marginBottom: 16,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '900',
    color: NEO.ink,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    color: NEO.ink,
    marginTop: 4,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statDivider: {
    width: BRUTAL.border,
    height: 40,
    backgroundColor: NEO.ink,
  },
  settingsCard: {
    borderRadius: BRUTAL.radius,
    marginBottom: 16,
    backgroundColor: NEO.white,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    padding: 14,
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: NEO.ink,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.border,
    borderColor: NEO.ink,
    backgroundColor: NEO.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: NEO.ink,
  },
  rowSubtitle: {
    fontSize: 11,
    color: NEO.ink,
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  signOutButton: {
    marginTop: 8,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  signOutLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  deleteAccountButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  deleteAccountLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: NEO.ink,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authIconWrap: {
    width: 96,
    height: 96,
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    backgroundColor: NEO.yellow,
    boxShadow: BRUTAL_SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    marginRight: 4,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: NEO.ink,
    marginTop: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 13,
    color: NEO.ink,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    fontWeight: '600',
  },
  authButton: {
    width: '100%',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginBottom: 12,
    marginRight: 4,
  },
  authButtonOutlined: {
    width: '100%',
    borderRadius: BRUTAL.radius,
    borderWidth: BRUTAL.borderThick,
    borderColor: NEO.ink,
    boxShadow: BRUTAL_SHADOW,
    marginRight: 4,
  },
  authBtnLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

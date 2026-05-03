import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { NotificationSettings } from '../types';

// In Expo Go on SDK 53+, push notifications were removed and just *importing*
// expo-notifications eagerly registers a push-token listener that throws.
// Detect that environment and no-op every API call.
const isExpoGo = Constants.appOwnership === 'expo';

type Notif = typeof import('expo-notifications');

let notifPromise: Promise<Notif | null> | null = null;
const loadNotifications = (): Promise<Notif | null> => {
  if (isExpoGo || Platform.OS === 'web') return Promise.resolve(null);
  if (!notifPromise) {
    notifPromise = import('expo-notifications')
      .then(async (mod) => {
        // Configure once on first load.
        try {
          await mod.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
        } catch (e) {
          console.warn('[notifications] handler setup failed', e);
        }
        return mod;
      })
      .catch((e) => {
        console.warn('[notifications] expo-notifications unavailable', e);
        return null;
      });
  }
  return notifPromise;
};

// Request notification permissions
export const requestPermissions = async (): Promise<boolean> => {
  const N = await loadNotifications();
  if (!N) return false;

  const { status: existingStatus } = await N.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

// Get push notification token
export const getPushToken = async (): Promise<string | null> => {
  const N = await loadNotifications();
  if (!N) return null;
  try {
    const token = await N.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
};

// Schedule daily study reminder
export const scheduleDailyReminder = async (
  time: string,
  enabled: boolean
): Promise<string | null> => {
  const N = await loadNotifications();
  if (!N) return null;

  await cancelAllReminders();
  if (!enabled) return null;

  const [hours, minutes] = time.split(':').map(Number);
  return N.scheduleNotificationAsync({
    content: {
      title: 'Time to Study! 📚',
      body: 'Your vocabulary cards are waiting. Keep your streak going!',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
};

// Schedule streak warning notification
export const scheduleStreakWarning = async (currentStreak: number): Promise<string | null> => {
  if (currentStreak < 3) return null;
  const N = await loadNotifications();
  if (!N) return null;

  return N.scheduleNotificationAsync({
    content: {
      title: `Don't lose your ${currentStreak}-day streak! 🔥`,
      body: "You haven't studied today. Review a few cards to keep it going!",
      sound: true,
      data: { type: 'streak_warning' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
};

// Send immediate notification for new content
export const notifyNewContent = async (category: string, termCount: number): Promise<void> => {
  const N = await loadNotifications();
  if (!N) return;
  await N.scheduleNotificationAsync({
    content: {
      title: 'New Vocabulary Added! ✨',
      body: `${termCount} new ${category} terms are ready to learn.`,
      sound: true,
      data: { type: 'new_content', category },
    },
    trigger: null,
  });
};

// Send weekly progress summary
export const scheduleWeeklyProgress = async (): Promise<string | null> => {
  const N = await loadNotifications();
  if (!N) return null;
  return N.scheduleNotificationAsync({
    content: {
      title: 'Weekly Progress Summary 📊',
      body: "Check out how much you've learned this week!",
      sound: true,
      data: { type: 'weekly_summary' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 10,
      minute: 0,
    },
  });
};

export const cancelAllReminders = async (): Promise<void> => {
  const N = await loadNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
};

export const cancelReminder = async (identifier: string): Promise<void> => {
  const N = await loadNotifications();
  if (!N) return;
  await N.cancelScheduledNotificationAsync(identifier);
};

export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  if (!settings.enabled) {
    await cancelAllReminders();
    return;
  }
  await scheduleDailyReminder(settings.reminderTime, settings.enabled);
  await scheduleWeeklyProgress();
};

// A subscription stub that's safe to .remove() in Expo Go.
const noopSubscription = { remove: () => {} } as { remove: () => void };

export const addNotificationResponseListener = (
  callback: (response: any) => void
): { remove: () => void } => {
  if (isExpoGo || Platform.OS === 'web') return noopSubscription;
  let sub: { remove: () => void } | null = null;
  loadNotifications().then((N) => {
    if (N) sub = N.addNotificationResponseReceivedListener(callback);
  });
  return { remove: () => sub?.remove() };
};

export const addNotificationReceivedListener = (
  callback: (notification: any) => void
): { remove: () => void } => {
  if (isExpoGo || Platform.OS === 'web') return noopSubscription;
  let sub: { remove: () => void } | null = null;
  loadNotifications().then((N) => {
    if (N) sub = N.addNotificationReceivedListener(callback);
  });
  return { remove: () => sub?.remove() };
};

export const getBadgeCount = async (): Promise<number> => {
  const N = await loadNotifications();
  if (!N) return 0;
  return N.getBadgeCountAsync();
};

export const setBadgeCount = async (count: number): Promise<void> => {
  const N = await loadNotifications();
  if (!N) return;
  await N.setBadgeCountAsync(count);
};

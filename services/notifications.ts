import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// Get push notification token
export const getPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync({
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
  time: string, // HH:mm format
  enabled: boolean
): Promise<string | null> => {
  // Cancel existing reminders first
  await cancelAllReminders();

  if (!enabled) return null;

  const [hours, minutes] = time.split(':').map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to Study! 📚',
      body: 'Your vocabulary cards are waiting. Keep your streak going!',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return identifier;
};

// Schedule streak warning notification
export const scheduleStreakWarning = async (
  currentStreak: number
): Promise<string | null> => {
  if (currentStreak < 3) return null;

  // Schedule for 8 PM if user hasn't studied
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Don't lose your ${currentStreak}-day streak! 🔥`,
      body: 'You haven\'t studied today. Review a few cards to keep it going!',
      sound: true,
      data: { type: 'streak_warning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  return identifier;
};

// Send immediate notification for new content
export const notifyNewContent = async (
  category: string,
  termCount: number
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Vocabulary Added! ✨',
      body: `${termCount} new ${category} terms are ready to learn.`,
      sound: true,
      data: { type: 'new_content', category },
    },
    trigger: null, // Immediate
  });
};

// Send weekly progress summary
export const scheduleWeeklyProgress = async (): Promise<string | null> => {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Progress Summary 📊',
      body: 'Check out how much you\'ve learned this week!',
      sound: true,
      data: { type: 'weekly_summary' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Monday
      hour: 10,
      minute: 0,
    },
  });

  return identifier;
};

// Cancel all scheduled notifications
export const cancelAllReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Cancel specific notification
export const cancelReminder = async (identifier: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

// Update notification settings
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  if (!settings.enabled) {
    await cancelAllReminders();
    return;
  }

  await scheduleDailyReminder(settings.reminderTime, settings.enabled);
  await scheduleWeeklyProgress();
};

// Listen for notification interactions
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Listen for received notifications
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Get badge count
export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

// Set badge count
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

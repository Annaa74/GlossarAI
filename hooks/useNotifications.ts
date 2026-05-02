import { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';
import * as notificationService from '../services/notifications';

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const { notificationSettings, updateNotificationSettings } = useSettingsStore();
  const { user } = useUserStore();

  // Request permissions on mount
  useEffect(() => {
    const init = async () => {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);

      if (granted) {
        const token = await notificationService.getPushToken();
        setPushToken(token);
      }
    };

    init();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);

        // Handle different notification types
        switch (data?.type) {
          case 'daily_reminder':
            // Navigate to home screen
            break;
          case 'streak_warning':
            // Navigate to home screen
            break;
          case 'weekly_summary':
            // Navigate to progress screen
            break;
          default:
            break;
        }
      }
    );

    const receivedSubscription = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  // Schedule streak warning if user has a streak
  useEffect(() => {
    if (user?.streak && user.streak >= 3) {
      notificationService.scheduleStreakWarning(user.streak);
    }
  }, [user?.streak]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (!hasPermission) {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      if (!granted) return;
    }

    await updateNotificationSettings({
      enabled: !notificationSettings.enabled,
    });
  }, [hasPermission, notificationSettings.enabled, updateNotificationSettings]);

  // Update reminder time
  const setReminderTime = useCallback(
    async (time: string) => {
      await updateNotificationSettings({ reminderTime: time });
    },
    [updateNotificationSettings]
  );

  // Update frequency
  const setFrequency = useCallback(
    async (frequency: 'daily' | 'weekdays' | 'custom') => {
      await updateNotificationSettings({ frequency });
    },
    [updateNotificationSettings]
  );

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!hasPermission) return;

    await notificationService.notifyNewContent('Test', 1);
  }, [hasPermission]);

  return {
    hasPermission,
    pushToken,
    notificationSettings,
    toggleNotifications,
    setReminderTime,
    setFrequency,
    sendTestNotification,
  };
};

export default useNotifications;

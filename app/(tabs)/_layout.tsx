import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NEO, BRUTAL } from '../../constants/theme';
import { useUserStore } from '../../stores/userStore';

const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  focused: boolean;
}) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', height: 36 }}>
    <MaterialCommunityIcons name={name} size={focused ? 28 : 26} color={color} />
    <View
      style={{
        marginTop: 5,
        width: focused ? 18 : 0,
        height: 2,
        backgroundColor: NEO.ink,
      }}
    />
  </View>
);

export default function TabLayout() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: NEO.ink,
        tabBarInactiveTintColor: NEO.inkMuted,
        tabBarStyle: isAuthenticated
          ? {
              backgroundColor: NEO.white,
              borderTopWidth: BRUTAL.border,
              borderTopColor: NEO.ink,
              height: 68,
              paddingTop: 6,
              paddingBottom: 8,
              elevation: 0,
            }
          : { display: 'none' },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cards-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart-line" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="head-question-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="account-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

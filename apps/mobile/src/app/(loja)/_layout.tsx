import { Tabs } from 'expo-router'
import { Text } from 'react-native'

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  )
}

export default function LojaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D4ED8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: '#F3F4F6',
          paddingBottom: 8,
          paddingTop: 4,
          height: 72,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account/index"
        options={{
          title: 'Conta',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

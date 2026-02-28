import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return (
    <Ionicons
      name={name}
      size={focused ? 24 : 22}
      color={color}
    />
  )
}

export default function MotoboyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#089161',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#F3F4F6',
          paddingBottom: 8,
          paddingTop: 4,
          height: 72,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="receitas"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen name="veiculos" options={{ href: null }} />
      <Tabs.Screen name="documentos" options={{ href: null }} />
      <Tabs.Screen name="dados-bancarios" options={{ href: null }} />
      <Tabs.Screen name="avaliacoes" options={{ href: null }} />
      <Tabs.Screen name="notificacoes" options={{ href: null }} />
      <Tabs.Screen name="seguranca" options={{ href: null }} />
      <Tabs.Screen name="termos" options={{ href: null }} />
    </Tabs>
  )
}

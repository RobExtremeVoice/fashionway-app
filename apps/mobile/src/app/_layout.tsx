import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { View, ActivityIndicator } from 'react-native'

export default function RootLayout() {
  const { isLoading, isAuthenticated, user, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/(auth)/login')
      return
    }

    // Redireciona por role após autenticação
    switch (user?.role) {
      case 'MOTOBOY':
        router.replace('/(motoboy)/home')
        break
      case 'LOJA':
      case 'FABRICA':
      case 'INTERMEDIARIO':
        router.replace('/(loja)/home')
        break
      default:
        router.replace('/(auth)/login')
    }
  }, [isLoading, isAuthenticated, user?.role])

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1D4ED8' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(loja)" />
      <Stack.Screen name="(motoboy)" />
      <Stack.Screen name="coleta" />
    </Stack>
  )
}

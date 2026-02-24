import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../store/auth.store'

// Ponto de entrada — redireciona baseado no estado de autenticação
export default function Index() {
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

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1D4ED8' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  )
}

import { useEffect } from 'react'
import { View, Text, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { Button } from '../components/ui/Button'
import { colors } from '../theme/tokens'

export default function Index() {
  const { isLoading, isAuthenticated, user, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (isLoading || !isAuthenticated) return

    switch (user?.role) {
      case 'MOTOBOY':
        router.replace('/(motoboy)/home')
        break
      case 'LOJA':
      case 'FABRICA':
      case 'INTERMEDIARIO':
        router.replace('/(loja)/home')
        break
      case 'TRANSPORTADORA':
        router.replace('/(transportadora)/home')
        break
      default:
        router.replace('/(auth)/login')
    }
  }, [isLoading, isAuthenticated, user?.role])

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            backgroundColor: colors.primary600,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>FW</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingTop: 72, paddingBottom: 36 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={{ position: 'absolute', top: 90, right: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(37,99,235,0.35)' }} />
      <View style={{ position: 'absolute', bottom: 140, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(16,185,129,0.18)' }} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ width: 86, height: 86, borderRadius: 28, backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>FW</Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 42, fontWeight: '900', lineHeight: 44 }}>FashionWay</Text>
        <Text style={{ color: '#BFDBFE', fontSize: 17, marginTop: 10, lineHeight: 25 }}>
          Entrega premium para moda com experiência profissional de ponta.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 26 }}>
          {['Entrega rápida', 'Rastreamento ao vivo', 'Pix instantâneo'].map((label) => (
            <View key={label} style={{ borderWidth: 1, borderColor: 'rgba(191,219,254,0.35)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#DBEAFE', fontSize: 12, fontWeight: '700' }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Button label="Entrar" onPress={() => router.push('/(auth)/login')} accessibilityLabel="Entrar na sua conta" style={{ backgroundColor: colors.success, borderColor: colors.success }} />
        <Button label="Criar conta" variant="secondary" onPress={() => router.push('/(auth)/register')} accessibilityLabel="Criar nova conta" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.28)', }} />
      </View>
    </View>
  )
}

import { useEffect } from 'react'
import { View, Text, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { Button } from '../components/ui/Button'

const PRIMARY = '#059669'
const BG_LIGHT = '#F5F8F7'
const TEXT_MUTED = '#64748B'
const CARD_BORDER = '#E2E8F0'

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG_LIGHT }}>
        <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT} />
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            backgroundColor: PRIMARY,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: PRIMARY,
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>FW</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG_LIGHT, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 30 }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT} />

      <View style={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(5,150,105,0.12)' }} />
      <View style={{ position: 'absolute', bottom: 110, left: -65, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(2,132,199,0.08)' }} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            width: 86,
            height: 86,
            borderRadius: 26,
            backgroundColor: PRIMARY,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            shadowColor: PRIMARY,
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>FW</Text>
        </View>

        <Text style={{ color: '#0F172A', fontSize: 42, fontWeight: '900', lineHeight: 44 }}>FashionWay</Text>
        <Text style={{ color: TEXT_MUTED, fontSize: 17, marginTop: 10, lineHeight: 25 }}>
          Entrega premium para moda com experiência profissional e rastreio em tempo real.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
          {['Entrega rápida', 'Rastreamento ao vivo', 'Pix instantâneo'].map((label) => (
            <View key={label} style={{ borderWidth: 1, borderColor: CARD_BORDER, backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#334155', fontSize: 12, fontWeight: '700' }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Button
          label="Entrar"
          onPress={() => router.push('/(auth)/login')}
          accessibilityLabel="Entrar na sua conta"
          style={{ backgroundColor: PRIMARY, borderColor: PRIMARY, borderRadius: 12 }}
        />
        <Button
          label="Criar conta"
          variant="secondary"
          onPress={() => router.push('/(auth)/register')}
          accessibilityLabel="Criar nova conta"
          style={{ backgroundColor: '#FFFFFF', borderColor: CARD_BORDER, borderRadius: 12 }}
        />
      </View>
    </View>
  )
}

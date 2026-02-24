import { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'

const NEXT_STEPS = [
  { icon: '🔍', title: 'Procurando motoboy',   desc: 'Aguardando aceitação de um motoboy próximo' },
  { icon: '🏍️', title: 'Motoboy a caminho',    desc: 'O motoboy vai até o local de coleta' },
  { icon: '📦', title: 'Coleta realizada',      desc: 'Produtos coletados e embalados com cuidado' },
  { icon: '🚀', title: 'Entregue no destino',   desc: 'Entrega realizada com sucesso' },
]

export default function ColetaConfirmacaoScreen() {
  const { trackingCode, coletaId } = useLocalSearchParams<{
    trackingCode: string
    coletaId: string
  }>()

  const resetFlow   = useColetaStore((s) => s.resetFlow)
  const fetchActive = useColetaStore((s) => s.fetchActiveColetas)

  useEffect(() => {
    fetchActive()
    resetFlow()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success illustration */}
        <View style={{
          width: 110, height: 110,
          borderRadius: 55,
          backgroundColor: '#DCFCE7',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
          shadowColor: '#059669', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
        }}>
          <Text style={{ fontSize: 56 }}>✅</Text>
        </View>

        {/* Pulse ring */}
        <View style={{
          width: 150, height: 150, borderRadius: 75,
          borderWidth: 2, borderColor: '#A7F3D0',
          position: 'absolute', top: 60 - 20,
          opacity: 0.4,
        }} />

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginTop: 20 }}>
          Coleta confirmada! 🎉
        </Text>
        <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
          Estamos encontrando o motoboy mais próximo para você
        </Text>

        {/* Tracking code card */}
        <View style={{
          backgroundColor: '#1D4ED8', borderRadius: 22,
          paddingHorizontal: 32, paddingVertical: 24,
          width: '100%', alignItems: 'center', marginTop: 28,
          shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
        }}>
          <Text style={{ color: '#BFDBFE', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>
            CÓDIGO DE RASTREAMENTO
          </Text>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 4 }}>
            {trackingCode}
          </Text>
          <Text style={{ color: '#93C5FD', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Use este código para acompanhar sua coleta
          </Text>
        </View>

        {/* Next steps timeline */}
        <View style={{ width: '100%', marginTop: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
            O que acontece agora?
          </Text>
          {NEXT_STEPS.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14, marginBottom: 16 }}>
              {/* Timeline indicator */}
              <View style={{ alignItems: 'center', width: 40 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 14,
                  backgroundColor: i === 0 ? '#EFF6FF' : '#F9FAFB',
                  borderWidth: i === 0 ? 2 : 1,
                  borderColor: i === 0 ? '#BFDBFE' : '#E5E7EB',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                {i < NEXT_STEPS.length - 1 && (
                  <View style={{
                    width: 2, flex: 1, marginTop: 6,
                    backgroundColor: '#E5E7EB',
                    minHeight: 16,
                  }} />
                )}
              </View>
              <View style={{ flex: 1, paddingTop: 8 }}>
                <Text style={{
                  fontSize: 14, fontWeight: '700',
                  color: i === 0 ? '#1D4ED8' : '#374151',
                }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, lineHeight: 18 }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity
          onPress={() => router.push(`/coleta/tracking?id=${coletaId}` as any)}
          style={{
            backgroundColor: '#1D4ED8', borderRadius: 16,
            paddingVertical: 17, width: '100%', alignItems: 'center',
            marginTop: 8,
            shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            📍 Acompanhar ao vivo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(loja)/home')}
          style={{
            paddingVertical: 16, width: '100%', alignItems: 'center', marginTop: 4,
          }}
        >
          <Text style={{ color: '#1D4ED8', fontSize: 15, fontWeight: '600' }}>
            Voltar ao início
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

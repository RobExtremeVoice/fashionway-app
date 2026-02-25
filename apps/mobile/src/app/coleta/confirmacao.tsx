import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar,
  Animated, Easing,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { api } from '../../services/api'

interface MotoboyInfo {
  id: string
  nome: string
}

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

  const [motoboy, setMotoboy] = useState<MotoboyInfo | null>(null)

  // Animated value for the indeterminate progress bar (0 → 1, looping)
  const progressAnim = useRef(new Animated.Value(0)).current
  const loopRef      = useRef<Animated.CompositeAnimation | null>(null)
  const pollingRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchActive()
    resetFlow()
    startProgressLoop()
    startPolling()

    return () => {
      stopAll()
    }
  }, [])

  function startProgressLoop() {
    progressAnim.setValue(0)
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
    )
    loopRef.current.start()
  }

  function stopAll() {
    loopRef.current?.stop()
    loopRef.current = null
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  function startPolling() {
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/coletas/${coletaId}`)
        if (data.status === 'ACEITA' && data.motoboy) {
          setMotoboy({
            id:   data.motoboy.id,
            nome: data.motoboy.motoboyProfile?.nomeCompleto ?? 'Motoboy',
          })
          stopAll()
        }
      } catch {}
    }, 5000)
  }

  const barWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  })

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
                  <View style={{ width: 2, flex: 1, marginTop: 6, backgroundColor: '#E5E7EB', minHeight: 16 }} />
                )}
              </View>

              <View style={{ flex: 1, paddingTop: 4 }}>
                <Text style={{
                  fontSize: 14, fontWeight: '700',
                  color: i === 0 ? '#1D4ED8' : '#374151',
                }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, lineHeight: 18 }}>
                  {item.desc}
                </Text>

                {/* Step 0: animated search bar OR motoboy info */}
                {i === 0 && (
                  <View style={{ marginTop: 10 }}>
                    {motoboy === null ? (
                      /* Indeterminate progress bar */
                      <View style={{
                        height: 6, borderRadius: 3, backgroundColor: '#E5E7EB',
                        overflow: 'hidden', width: '100%',
                      }}>
                        <Animated.View style={{
                          height: 6, borderRadius: 3,
                          backgroundColor: '#1D4ED8',
                          width: barWidth,
                        }} />
                      </View>
                    ) : (
                      /* Motoboy accepted */
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: '#F0FDF4', borderRadius: 12,
                        paddingHorizontal: 12, paddingVertical: 10,
                        borderWidth: 1, borderColor: '#BBF7D0',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <Text style={{ fontSize: 20 }}>🏍️</Text>
                          <View>
                            <Text style={{ fontSize: 11, color: '#059669', fontWeight: '700' }}>
                              MOTOBOY ACEITO
                            </Text>
                            <Text style={{ fontSize: 13, color: '#065F46', fontWeight: '800' }}>
                              {motoboy.nome}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => router.push(`/chat/${coletaId}` as any)}
                          accessibilityLabel="Abrir chat com motoboy"
                          style={{
                            backgroundColor: '#059669', borderRadius: 10,
                            width: 38, height: 38,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
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
          style={{ paddingVertical: 16, width: '100%', alignItems: 'center', marginTop: 4 }}
        >
          <Text style={{ color: '#1D4ED8', fontSize: 15, fontWeight: '600' }}>
            Voltar ao início
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

import { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

const TIER_META: Record<string, { icon: string; color: string; bg: string; accent: string; badge?: string }> = {
  URGENTE:  { icon: '🚨', color: '#DC2626', bg: '#FEF2F2', accent: '#DC2626', badge: 'Mais rápido' },
  PADRAO:   { icon: '🏍️', color: '#1D4ED8', bg: '#EFF6FF', accent: '#1D4ED8' },
  AGENDADO: { icon: '📅', color: '#374151', bg: '#F9FAFB', accent: '#374151', badge: 'Mais barato' },
}

const STEPS = ['Origem', 'Destino', 'Serviço', 'Pagamento']

function StepBar({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 0, marginBottom: 24, alignItems: 'center' }}>
      {STEPS.map((step, i) => (
        <View key={step} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {i > 0 && <View style={{ flex: 1, height: 2, backgroundColor: i <= current ? '#1D4ED8' : '#E5E7EB' }} />}
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: i <= current ? '#1D4ED8' : '#E5E7EB',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: i === current ? 3 : 0, borderColor: '#93C5FD',
            }}>
              <Text style={{ color: i <= current ? '#fff' : '#9CA3AF', fontSize: 11, fontWeight: '700' }}>
                {i < current ? '✓' : String(i + 1)}
              </Text>
            </View>
            {i < STEPS.length - 1 && <View style={{ flex: 1, height: 2, backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB' }} />}
          </View>
          <Text style={{ fontSize: 10, fontWeight: '600', color: i <= current ? '#1D4ED8' : '#9CA3AF', textAlign: 'center' }}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  )
}

export default function ColetaServicoScreen() {
  const quotes       = useColetaStore((s) => s.quotes)
  const selectedTier = useColetaStore((s) => s.selectedTier)
  const fetchQuotes  = useColetaStore((s) => s.fetchQuotes)
  const selectTier   = useColetaStore((s) => s.selectTier)
  const origin       = useColetaStore((s) => s.originAddress)
  const destination  = useColetaStore((s) => s.destinationAddress)

  useEffect(() => { fetchQuotes() }, [])

  const distanciaKm = quotes[0]?.distanciaKm?.toFixed(1) ?? '...'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#93C5FD', fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Escolha o Serviço</Text>
            <Text style={{ color: '#93C5FD', fontSize: 13, marginTop: 2 }}>
              {distanciaKm} km de percurso
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <StepBar current={2} />

        {/* Route summary */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#1D4ED8',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1D4ED8' }}>A</Text>
              </View>
              <View style={{ width: 2, height: 20, backgroundColor: '#E5E7EB', marginVertical: 4 }} />
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#DC2626',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626' }}>B</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }} numberOfLines={1}>
                {origin?.logradouro}, {origin?.numero} — {origin?.cidade}
              </Text>
              <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }} numberOfLines={1}>
                {destination?.logradouro}, {destination?.numero} — {destination?.cidade}
              </Text>
            </View>
          </View>
        </View>

        {/* Service cards */}
        {quotes.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>Calculando preços...</Text>
          </View>
        ) : (
          quotes.map((q) => {
            const meta = TIER_META[q.serviceTier] ?? TIER_META.PADRAO
            const isSelected = selectedTier === q.serviceTier

            return (
              <TouchableOpacity
                key={q.serviceTier}
                onPress={() => selectTier(q.serviceTier)}
                style={{
                  backgroundColor: isSelected ? meta.color : '#fff',
                  borderRadius: 20, padding: 20, marginBottom: 12,
                  borderWidth: 2, borderColor: isSelected ? meta.color : '#F3F4F6',
                  shadowColor: isSelected ? meta.color : '#000',
                  shadowOffset: { width: 0, height: isSelected ? 8 : 2 },
                  shadowOpacity: isSelected ? 0.35 : 0.06,
                  shadowRadius: isSelected ? 16 : 8, elevation: isSelected ? 10 : 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 52, height: 52,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : meta.bg,
                    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 26 }}>{meta.icon}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{
                        fontSize: 17, fontWeight: '800',
                        color: isSelected ? '#fff' : '#111827',
                      }}>
                        {q.label}
                      </Text>
                      {meta.badge && (
                        <View style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : meta.bg,
                          borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                        }}>
                          <Text style={{
                            fontSize: 10, fontWeight: '700',
                            color: isSelected ? '#fff' : meta.color,
                          }}>
                            {meta.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={{
                      fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.75)' : '#6B7280',
                      marginTop: 3,
                    }}>
                      {(q as any).description}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      fontSize: 20, fontWeight: '800',
                      color: isSelected ? '#fff' : '#111827',
                    }}>
                      {formatBRL(q.valorFrete)}
                    </Text>
                    {q.etaMinutes > 0 && (
                      <Text style={{
                        fontSize: 11,
                        color: isSelected ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                        marginTop: 2,
                      }}>
                        ~{q.etaMinutes} min
                      </Text>
                    )}
                  </View>
                </View>

                {isSelected && (
                  <View style={{
                    marginTop: 14, paddingTop: 14,
                    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Distância</Text>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                        {q.distanciaKm.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Taxa plataforma</Text>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                        {formatBRL((q as any).taxaPlataforma ?? 0)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}

        {/* CTA */}
        <TouchableOpacity
          onPress={() => selectedTier && router.push('/coleta/pagamento')}
          disabled={!selectedTier}
          style={{
            backgroundColor: selectedTier ? '#1D4ED8' : '#E5E7EB',
            borderRadius: 16, paddingVertical: 17, alignItems: 'center',
            marginTop: 8,
            shadowColor: selectedTier ? '#1D4ED8' : 'transparent',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 14, elevation: selectedTier ? 8 : 0,
          }}
        >
          <Text style={{
            color: selectedTier ? '#fff' : '#9CA3AF',
            fontSize: 16, fontWeight: '700', letterSpacing: 0.3,
          }}>
            Continuar → Pagamento
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

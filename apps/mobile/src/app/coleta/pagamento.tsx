import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  Alert, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'
import { StepProgress } from '../../components/ui/StepProgress'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { Button } from '../../components/ui/Button'

const METHODS = [
  {
    id: 'pix',
    icon: '⚡',
    label: 'Pix',
    desc: 'Pagamento instantâneo • Sem taxas',
    badge: 'Recomendado',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    id: 'card',
    icon: '💳',
    label: 'Cartão',
    desc: 'Crédito ou débito',
    badge: null,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    id: 'boleto',
    icon: '📄',
    label: 'Boleto',
    desc: 'Confirmação em até 3 dias úteis',
    badge: 'Mais lento',
    badgeColor: '#D97706',
    badgeBg: '#FFFBEB',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
] as const

const STEPS = ['Origem', 'Destino', 'Serviço', 'Pagamento']

export default function ColetaPagamentoScreen() {
  const [loading, setLoading] = useState(false)
  const [method, setMethod]   = useState<'pix' | 'card' | 'boleto'>('pix')

  const quotes             = useColetaStore((s) => s.quotes)
  const selectedTier       = useColetaStore((s) => s.selectedTier)
  const originAddress      = useColetaStore((s) => s.originAddress)
  const destinationAddress = useColetaStore((s) => s.destinationAddress)
  const createColeta       = useColetaStore((s) => s.createColeta)

  const quote = quotes.find((q) => q.serviceTier === selectedTier)

  async function handleSolicitar() {
    if (!quote || !originAddress || !destinationAddress) return

    setLoading(true)
    try {
      const coleta = await createColeta({
        originAddress,
        destinationAddress,
        serviceTier: selectedTier as any,
        paymentMethod: method === 'pix' ? 'PIX' : method === 'card' ? 'CARTAO' : 'BOLETO',
      })

      const { data: payment } = await api.post('/payments', {
        coletaId: coleta.id,
        method,
      })

      if (method === 'pix') {
        router.replace({
          pathname: '/coleta/pix-qr',
          params: {
            coletaId: coleta.id,
            trackingCode: coleta.trackingCode,
            paymentIntentId: payment.stripePaymentIntentId,
          },
        })
      } else {
        router.replace({
          pathname: '/coleta/confirmacao',
          params: { coletaId: coleta.id, trackingCode: coleta.trackingCode },
        })
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar para seleção de serviço"
          style={{ marginBottom: 16, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: '#93C5FD', fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>💳</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Pagamento</Text>
            <Text style={{ color: '#93C5FD', fontSize: 13, marginTop: 2 }}>
              Escolha a forma de pagamento
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <StepProgress current={3} steps={STEPS} />
        <Breadcrumb
          items={[
            { label: 'Início', onPress: () => router.replace('/(loja)/home') },
            { label: 'Coleta', onPress: () => router.back() },
            { label: 'Pagamento' },
          ]}
        />

        {/* Order summary */}
        {quote && (
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5, marginBottom: 14, textTransform: 'uppercase' }}>
              Resumo do Pedido
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Serviço</Text>
              <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>{quote.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Distância</Text>
              <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>{quote.distanciaKm.toFixed(1)} km</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>ETA</Text>
              <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>~{quote.etaMinutes} min</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700' }}>Total</Text>
              <Text style={{ color: '#1D4ED8', fontSize: 24, fontWeight: '800' }}>
                {formatBRL(quote.valorFrete)}
              </Text>
            </View>
          </View>
        )}

        {/* Payment methods */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
          Forma de pagamento
        </Text>

        {METHODS.map((m) => {
          const isSelected = method === m.id
          return (
            <TouchableOpacity
              key={m.id}
              onPress={() => setMethod(m.id)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: isSelected ? m.bg : '#fff',
                borderRadius: 18, padding: 18, marginBottom: 10,
                borderWidth: 2, borderColor: isSelected ? m.border : '#F3F4F6',
                shadowColor: isSelected ? m.color : '#000',
                shadowOffset: { width: 0, height: isSelected ? 4 : 1 },
                shadowOpacity: isSelected ? 0.2 : 0.04,
                shadowRadius: isSelected ? 8 : 4, elevation: isSelected ? 4 : 1,
              }}
            >
              <View style={{
                width: 46, height: 46,
                backgroundColor: isSelected ? m.color : '#F9FAFB',
                borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 22 }}>{m.icon}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{
                    fontSize: 16, fontWeight: '700',
                    color: isSelected ? m.color : '#111827',
                  }}>
                    {m.label}
                  </Text>
                  {m.badge && (
                    <View style={{
                      backgroundColor: (m as any).badgeBg ?? m.bg,
                      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{
                        fontSize: 10, fontWeight: '700',
                        color: (m as any).badgeColor ?? m.color,
                      }}>
                        {m.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{m.desc}</Text>
              </View>

              {/* Radio button */}
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                borderWidth: 2, borderColor: isSelected ? m.color : '#D1D5DB',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && (
                  <View style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: m.color,
                  }} />
                )}
              </View>
            </TouchableOpacity>
          )
        })}

        {/* Boleto warning */}
        {method === 'boleto' && (
          <View style={{
            backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
            borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 8,
            flexDirection: 'row', gap: 10,
          }}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <Text style={{ color: '#92400E', fontSize: 13, flex: 1, lineHeight: 20 }}>
              Sua coleta será confirmada somente após a compensação do boleto (até 3 dias úteis).
            </Text>
          </View>
        )}

        {/* Security badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 20 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>🔒</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Pagamentos protegidos por</Text>
          <Text style={{ color: '#6366F1', fontSize: 12, fontWeight: '700' }}>Stripe</Text>
        </View>

        {/* CTA */}
        <Button
          onPress={handleSolicitar}
          disabled={loading}
          loading={loading}
          label={quote ? `Pagar ${formatBRL(quote.valorFrete)} e Solicitar 🚀` : 'Solicitar Coleta 🚀'}
          accessibilityLabel="Confirmar pagamento e solicitar coleta"
        />
      </ScrollView>
    </View>
  )
}

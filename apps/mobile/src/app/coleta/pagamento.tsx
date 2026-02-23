import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'

const METHODS = [
  {
    id: 'pix',
    icon: '🟢',
    label: 'Pix',
    desc: 'Pagamento instantâneo, sem taxas',
    badge: 'Recomendado',
  },
  {
    id: 'card',
    icon: '💳',
    label: 'Cartão',
    desc: 'Crédito ou débito',
    badge: null,
  },
  {
    id: 'boleto',
    icon: '📄',
    label: 'Boleto',
    desc: 'Confirmação em até 3 dias úteis',
    badge: '⚠️ Mais lento',
  },
]

export default function ColetaPagamentoScreen() {
  const [loading, setLoading]     = useState(false)
  const [method, setMethod]       = useState<'pix' | 'card' | 'boleto'>('pix')

  const quotes            = useColetaStore((s) => s.quotes)
  const selectedTier      = useColetaStore((s) => s.selectedTier)
  const originAddress     = useColetaStore((s) => s.originAddress)
  const destinationAddress = useColetaStore((s) => s.destinationAddress)
  const createColeta      = useColetaStore((s) => s.createColeta)

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

      // Cria payment intent no Stripe
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
      } else if (method === 'boleto') {
        router.replace({
          pathname: '/coleta/confirmacao',
          params: { coletaId: coleta.id, trackingCode: coleta.trackingCode },
        })
      } else {
        // Cartão → tela de cartão
        router.replace({
          pathname: '/coleta/confirmacao',
          params: { coletaId: coleta.id, trackingCode: coleta.trackingCode },
        })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao processar pagamento'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-700 px-5 pt-14 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-blue-200">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Pagamento</Text>
        <Text className="text-blue-200 text-sm">Escolha a forma de pagamento</Text>
      </View>

      <View className="px-5 pt-5">
        {/* Progresso */}
        <View className="flex-row gap-2 mb-6">
          {['Origem', 'Destino', 'Serviço', 'Pagamento'].map((step, i) => (
            <View key={step} className="flex-1 items-center">
              <View className="h-1.5 rounded-full w-full bg-blue-700" />
              <Text className="text-[10px] mt-1 text-blue-700 font-medium">{step}</Text>
            </View>
          ))}
        </View>

        {/* Resumo do pedido */}
        {quote && (
          <View className="bg-blue-50 rounded-2xl p-4 mb-5">
            <Text className="font-bold text-blue-800 text-base mb-2">Resumo</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Serviço</Text>
              <Text className="font-medium">{quote.label}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Distância</Text>
              <Text className="font-medium">{quote.distanciaKm.toFixed(1)} km</Text>
            </View>
            <View className="h-px bg-blue-100 my-2" />
            <View className="flex-row justify-between">
              <Text className="font-bold text-blue-800 text-base">Total</Text>
              <Text className="font-bold text-blue-800 text-xl">{formatBRL(quote.valorFrete)}</Text>
            </View>
          </View>
        )}

        {/* Métodos de pagamento */}
        <Text className="font-semibold text-gray-800 mb-3">Forma de pagamento</Text>

        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => setMethod(m.id as any)}
            className={`border-2 rounded-2xl p-4 mb-3 flex-row items-center gap-3 ${
              method === m.id ? 'border-blue-700 bg-blue-50' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <Text className="text-3xl">{m.icon}</Text>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className={`font-bold text-base ${method === m.id ? 'text-blue-700' : 'text-gray-800'}`}>
                  {m.label}
                </Text>
                {m.badge && (
                  <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text className="text-green-700 text-[10px] font-medium">{m.badge}</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-500 text-sm">{m.desc}</Text>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              method === m.id ? 'border-blue-700 bg-blue-700' : 'border-gray-300'
            }`}>
              {method === m.id && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Aviso boleto */}
        {method === 'boleto' && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex-row gap-2">
            <Text>⚠️</Text>
            <Text className="text-amber-700 text-sm flex-1">
              Sua coleta será confirmada após a compensação bancária do boleto (até 3 dias úteis).
            </Text>
          </View>
        )}

        {/* Nota Stripe */}
        <View className="flex-row items-center justify-center gap-2 mb-4">
          <Text className="text-gray-400 text-xs">🔒 Pagamento protegido por</Text>
          <Text className="text-gray-500 text-xs font-bold">Stripe</Text>
        </View>

        {/* Botão solicitar */}
        <TouchableOpacity
          className="bg-blue-700 rounded-xl py-4 items-center mb-10"
          onPress={handleSolicitar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {quote ? `Pagar ${formatBRL(quote.valorFrete)} e Solicitar` : 'Solicitar Coleta'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

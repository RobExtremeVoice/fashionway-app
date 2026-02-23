import { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

const TIER_META: Record<string, { icon: string; color: string; bgColor: string }> = {
  URGENTE: { icon: '🚨', color: 'text-red-700',   bgColor: 'bg-red-50 border-red-200' },
  PADRAO:  { icon: '⏱',  color: 'text-blue-700',  bgColor: 'bg-blue-50 border-blue-200' },
  AGENDADO:{ icon: '📅', color: 'text-gray-700',  bgColor: 'bg-gray-50 border-gray-200' },
}

export default function ColetaServicoScreen() {
  const quotes       = useColetaStore((s) => s.quotes)
  const selectedTier = useColetaStore((s) => s.selectedTier)
  const fetchQuotes  = useColetaStore((s) => s.fetchQuotes)
  const selectTier   = useColetaStore((s) => s.selectTier)
  const origin       = useColetaStore((s) => s.originAddress)
  const destination  = useColetaStore((s) => s.destinationAddress)

  useEffect(() => {
    fetchQuotes()
  }, [])

  function handleContinuar() {
    if (!selectedTier) return
    router.push('/coleta/pagamento')
  }

  const distanciaKm = quotes[0]?.distanciaKm?.toFixed(1) ?? '...'

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-700 px-5 pt-14 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-blue-200">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Escolha o Serviço</Text>
        <Text className="text-blue-200 text-sm">{distanciaKm} km de percurso</Text>
      </View>

      <View className="px-5 pt-5">
        {/* Progresso */}
        <View className="flex-row gap-2 mb-6">
          {['Origem', 'Destino', 'Serviço', 'Pagamento'].map((step, i) => (
            <View key={step} className="flex-1 items-center">
              <View className={`h-1.5 rounded-full w-full ${i <= 2 ? 'bg-blue-700' : 'bg-gray-200'}`} />
              <Text className={`text-[10px] mt-1 ${i <= 2 ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Resumo rota */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-5">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-blue-700 font-bold w-4">A</Text>
            <Text className="text-gray-700 flex-1" numberOfLines={1}>
              {origin?.logradouro}, {origin?.numero} — {origin?.cidade}
            </Text>
          </View>
          <View className="w-0.5 h-4 bg-gray-300 ml-2 mb-2" />
          <View className="flex-row items-center gap-2">
            <Text className="text-red-600 font-bold w-4">B</Text>
            <Text className="text-gray-700 flex-1" numberOfLines={1}>
              {destination?.logradouro}, {destination?.numero} — {destination?.cidade}
            </Text>
          </View>
        </View>

        {/* Opções de serviço */}
        {quotes.length === 0 ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text className="text-gray-400 mt-3">Calculando preços...</Text>
          </View>
        ) : (
          quotes.map((q) => {
            const meta = TIER_META[q.serviceTier]
            const isSelected = selectedTier === q.serviceTier

            return (
              <TouchableOpacity
                key={q.serviceTier}
                onPress={() => selectTier(q.serviceTier)}
                className={`border-2 rounded-2xl p-4 mb-3 ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50'
                    : `${meta.bgColor} border-transparent`
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-3xl">{meta.icon}</Text>
                    <View className="flex-1">
                      <Text className={`font-bold text-lg ${isSelected ? 'text-blue-700' : meta.color}`}>
                        {q.label}
                      </Text>
                      <Text className="text-gray-500 text-sm">{q.description}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`text-xl font-bold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                      {formatBRL(q.valorFrete)}
                    </Text>
                    {q.etaMinutes > 0 && (
                      <Text className="text-gray-400 text-xs">~{q.etaMinutes} min</Text>
                    )}
                  </View>
                </View>

                {isSelected && (
                  <View className="mt-3 pt-3 border-t border-blue-200">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Distância</Text>
                      <Text className="text-gray-700 text-sm font-medium">{q.distanciaKm.toFixed(1)} km</Text>
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-500 text-sm">Taxa plataforma</Text>
                      <Text className="text-gray-700 text-sm font-medium">{formatBRL(q.taxaPlataforma)}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}

        {/* Botão continuar */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-3 mb-10 ${
            selectedTier ? 'bg-blue-700' : 'bg-gray-200'
          }`}
          onPress={handleContinuar}
          disabled={!selectedTier}
        >
          <Text className={`font-semibold text-base ${selectedTier ? 'text-white' : 'text-gray-400'}`}>
            Continuar → Pagamento
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

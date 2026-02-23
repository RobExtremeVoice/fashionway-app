import { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'

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
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Ícone de sucesso */}
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">✅</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-800 text-center">
          Coleta confirmada!
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Estamos procurando o motoboy mais próximo para você
        </Text>

        {/* Código de rastreamento */}
        <View className="bg-blue-50 rounded-2xl px-6 py-4 mt-8 w-full items-center">
          <Text className="text-blue-500 text-sm mb-1">Código de rastreamento</Text>
          <Text className="text-blue-800 text-2xl font-bold tracking-widest">{trackingCode}</Text>
          <Text className="text-blue-400 text-xs mt-1">Use este código para acompanhar sua coleta</Text>
        </View>

        {/* Próximos passos */}
        <View className="w-full mt-6">
          <Text className="font-semibold text-gray-700 mb-3">O que acontece agora?</Text>
          {[
            { step: '1', icon: '🔍', text: 'Procurando motoboy disponível' },
            { step: '2', icon: '🏍️', text: 'Motoboy aceita e vai até você' },
            { step: '3', icon: '📦', text: 'Coleta os produtos' },
            { step: '4', icon: '🚀', text: 'Entrega no destino' },
          ].map((item) => (
            <View key={item.step} className="flex-row items-center gap-3 mb-3">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Text>{item.icon}</Text>
              </View>
              <Text className="text-gray-600 flex-1">{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Botões */}
        <TouchableOpacity
          className="bg-blue-700 rounded-xl py-4 w-full items-center mt-6"
          onPress={() => router.push(`/coleta/tracking?id=${coletaId}` as any)}
        >
          <Text className="text-white font-semibold text-base">📍 Acompanhar ao vivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-4 w-full items-center mt-2"
          onPress={() => router.replace('/(loja)/home')}
        >
          <Text className="text-blue-600 font-medium">Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

import { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

const SERVICES = [
  { icon: '📦', label: 'Enviar Produtos',   route: '/coleta/origem' },
  { icon: '🏪', label: 'Coletar na Loja',   route: '/coleta/origem' },
  { icon: '⚡', label: 'Coleta Now',         route: '/coleta/origem' },
  { icon: '📅', label: 'Agendada',           route: '/coleta/origem' },
]

export default function LojaHomeScreen() {
  const user          = useAuthStore((s) => s.user)
  const activeColetas = useColetaStore((s) => s.activeColetas)
  const pastColetas   = useColetaStore((s) => s.pastColetas)
  const fetchActive   = useColetaStore((s) => s.fetchActiveColetas)
  const fetchPast     = useColetaStore((s) => s.fetchPastColetas)
  const setOrigin     = useColetaStore((s) => s.setOrigin)
  const resetFlow     = useColetaStore((s) => s.resetFlow)

  useEffect(() => {
    fetchActive()
    fetchPast()
  }, [])

  function handleNewColeta() {
    resetFlow()
    router.push('/coleta/origem')
  }

  const STATUS_COLORS: Record<string, string> = {
    NOVA:           'bg-blue-100 text-blue-700',
    PENDENTE:       'bg-yellow-100 text-yellow-700',
    ACEITA:         'bg-indigo-100 text-indigo-700',
    EM_ROTA_COLETA: 'bg-orange-100 text-orange-700',
    COLETADO:       'bg-purple-100 text-purple-700',
    EM_TRANSITO:    'bg-orange-200 text-orange-800',
    ENTREGUE:       'bg-green-100 text-green-700',
    CANCELADA:      'bg-red-100 text-red-700',
    DISPUTA:        'bg-red-200 text-red-800',
  }

  const STATUS_LABELS: Record<string, string> = {
    NOVA:           '🔵 Nova',
    PENDENTE:       '🟡 Pendente',
    ACEITA:         '🟣 Aceita',
    EM_ROTA_COLETA: '🚗 A caminho',
    COLETADO:       '📦 Coletado',
    EM_TRANSITO:    '🚀 Em Trânsito',
    ENTREGUE:       '✅ Entregue',
    CANCELADA:      '❌ Cancelada',
    DISPUTA:        '⚠️ Disputa',
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-blue-700 px-5 pt-14 pb-6">
        <Text className="text-blue-200 text-sm">Olá, 👋</Text>
        <Text className="text-white text-2xl font-bold">
          {user?.lojaProfile?.nomeEmpresa ?? user?.email}
        </Text>
      </View>

      <View className="px-5">
        {/* Search "Para onde?" */}
        <TouchableOpacity
          onPress={handleNewColeta}
          className="bg-white rounded-2xl px-4 py-4 -mt-5 shadow-sm border border-gray-100 flex-row items-center gap-3"
        >
          <Text className="text-2xl">📍</Text>
          <Text className="text-gray-400 text-base flex-1">Para onde vai a coleta?</Text>
          <View className="bg-blue-700 w-8 h-8 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-lg">+</Text>
          </View>
        </TouchableOpacity>

        {/* Serviços rápidos */}
        <Text className="text-gray-800 font-semibold text-base mt-6 mb-3">Serviços</Text>
        <View className="flex-row justify-between">
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s.label}
              onPress={() => router.push(s.route as any)}
              className="items-center bg-white rounded-2xl p-3 w-[22%] shadow-sm"
            >
              <Text className="text-2xl mb-1">{s.icon}</Text>
              <Text className="text-gray-600 text-[10px] text-center leading-tight">{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coletas ativas */}
        {activeColetas.length > 0 && (
          <>
            <Text className="text-gray-800 font-semibold text-base mt-6 mb-3">Em andamento</Text>
            {activeColetas.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  <Text className="font-bold text-gray-800">{c.trackingCode}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${(STATUS_COLORS[c.status] ?? '').split(' ')[0]}`}>
                    <Text className={`text-xs font-medium ${(STATUS_COLORS[c.status] ?? '').split(' ')[1]}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  📍 {c.originAddress?.logradouro}, {c.originAddress?.numero}
                </Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  🏁 {c.destinationAddress?.logradouro}, {c.destinationAddress?.numero}
                </Text>
                <Text className="text-blue-700 font-bold mt-2">{formatBRL(c.valorFrete)}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Histórico */}
        {pastColetas.length > 0 && (
          <>
            <Text className="text-gray-800 font-semibold text-base mt-6 mb-3">
              Histórico recente
            </Text>
            {pastColetas.slice(0, 5).map((c) => (
              <View key={c.id} className="bg-white rounded-2xl p-4 mb-3 flex-row items-center gap-3">
                <Text className="text-2xl">{c.status === 'ENTREGUE' ? '✅' : '❌'}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{c.trackingCode}</Text>
                  <Text className="text-gray-400 text-xs" numberOfLines={1}>
                    {c.destinationAddress?.logradouro}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-gray-700">{formatBRL(c.valorFrete)}</Text>
                  <TouchableOpacity onPress={() => router.push('/coleta/origem' as any)}>
                    <Text className="text-blue-600 text-xs mt-1">Repetir →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View className="h-24" />
      </View>
    </ScrollView>
  )
}

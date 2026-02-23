import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'

export default function MotoboyHomeScreen() {
  const user        = useAuthStore((s) => s.user)
  const coletas     = useColetaStore((s) => s.activeColetas)
  const fetchActive = useColetaStore((s) => s.fetchActiveColetas)
  const [online, setOnline]     = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchActive()
    // Carrega status online do perfil
    api.get('/motoboys/me').then(({ data }) => {
      setOnline(data.onlineStatus ?? false)
    }).catch(() => {})
  }, [])

  async function toggleOnline(value: boolean) {
    setToggling(true)
    try {
      await api.patch('/motoboys/status', { online: value })
      setOnline(value)
      if (value) fetchActive()
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar seu status')
    } finally {
      setToggling(false)
    }
  }

  // Coletas disponíveis (NOVA) e as minhas (atribuídas a mim)
  const disponiveis = coletas.filter((c) => c.status === 'NOVA' && !c.motoboyId)
  const minhas      = coletas.filter((c) => c.motoboyId === user?.id)

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className={`px-5 pt-14 pb-6 ${online ? 'bg-green-600' : 'bg-gray-700'}`}>
        <Text className="text-white text-sm opacity-80">Olá, {user?.motoboyProfile?.nomeCompleto?.split(' ')[0]} 👋</Text>
        <Text className="text-white text-2xl font-bold mt-1">FashionWay Motoboy</Text>

        {/* Toggle online/offline */}
        <View className="flex-row items-center justify-between mt-4 bg-black/10 rounded-2xl px-4 py-3">
          <View>
            <Text className="text-white font-bold text-base">
              {online ? '🟢 Online — Aceitando corridas' : '⚫ Offline'}
            </Text>
            <Text className="text-white/70 text-xs mt-0.5">
              {online ? 'Você aparece para clientes' : 'Ative para receber corridas'}
            </Text>
          </View>
          <Switch
            value={online}
            onValueChange={toggleOnline}
            disabled={toggling}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View className="px-5 pt-4">
        {/* Stats do dia */}
        <View className="flex-row gap-3 mb-5">
          {[
            { label: 'Hoje', value: '3 corridas', icon: '🏍️' },
            { label: 'Ganhos', value: formatBRL(18900), icon: '💰' },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl mb-1">{stat.icon}</Text>
              <Text className="text-gray-400 text-xs">{stat.label}</Text>
              <Text className="font-bold text-gray-800 text-base">{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Minhas coletas em andamento */}
        {minhas.length > 0 && (
          <>
            <Text className="font-semibold text-gray-800 text-base mb-3">Em andamento</Text>
            {minhas.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                className="bg-blue-700 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row justify-between">
                  <Text className="text-white font-bold">{c.trackingCode}</Text>
                  <Text className="text-blue-200 text-sm">{c.status}</Text>
                </View>
                <Text className="text-blue-100 text-sm mt-2" numberOfLines={1}>
                  📍 {c.originAddress?.logradouro}, {c.originAddress?.numero}
                </Text>
                <Text className="text-blue-100 text-sm" numberOfLines={1}>
                  🏁 {c.destinationAddress?.logradouro}, {c.destinationAddress?.numero}
                </Text>
                <Text className="text-white font-bold text-lg mt-2">
                  {formatBRL(c.valorRepasse ?? 0)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Coletas disponíveis */}
        {online && (
          <>
            <Text className="font-semibold text-gray-800 text-base mb-3">
              Disponíveis perto de você ({disponiveis.length})
            </Text>

            {disponiveis.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-3xl mb-2">🔍</Text>
                <Text className="text-gray-500 text-center">
                  Aguardando novas coletas na sua região...
                </Text>
              </View>
            ) : (
              disponiveis.map((c) => (
                <View key={c.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-bold text-gray-800">{c.trackingCode}</Text>
                    <Text className="text-green-600 font-bold text-lg">
                      {formatBRL(c.valorRepasse ?? 0)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    📍 {c.originAddress?.logradouro}, {c.originAddress?.numero}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
                    🏁 {c.destinationAddress?.logradouro}, {c.destinationAddress?.numero}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {c.distanciaKm?.toFixed(1)} km • {c.serviceTier}
                  </Text>
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity className="flex-1 border border-gray-200 rounded-xl py-2.5 items-center">
                      <Text className="text-gray-500 font-medium">Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-2 flex-1 bg-green-600 rounded-xl py-2.5 items-center"
                      onPress={async () => {
                        await api.patch(`/coletas/${c.id}/status`, { status: 'ACEITA' })
                        fetchActive()
                      }}
                    >
                      <Text className="text-white font-bold">✓ Aceitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {!online && (
          <View className="bg-white rounded-2xl p-8 items-center mt-4">
            <Text className="text-4xl mb-3">😴</Text>
            <Text className="text-gray-700 font-medium text-center">
              Ative seu status para receber coletas
            </Text>
            <TouchableOpacity
              className="bg-green-600 px-8 py-3 rounded-full mt-4"
              onPress={() => toggleOnline(true)}
            >
              <Text className="text-white font-bold">Ficar Online</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </View>
    </ScrollView>
  )
}

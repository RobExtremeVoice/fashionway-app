import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  surface: '#F5F8F7',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#64748B',
  primary: '#089161',
}

const VIP_MOTOBOYS = [
  { id: '1', name: 'Lucas Elite', rating: 4.98, deliveries: 312, specialty: 'Alta Costura', online: true,  initials: 'LE' },
  { id: '2', name: 'Maria VIP',   rating: 4.96, deliveries: 287, specialty: 'Moda Praia',   online: true,  initials: 'MV' },
  { id: '3', name: 'Rafael Prem', rating: 4.99, deliveries: 156, specialty: 'Alta Costura', online: false, initials: 'RP' },
  { id: '4', name: 'Ana Gold',    rating: 4.95, deliveries: 203, specialty: 'Bijuteria',    online: true,  initials: 'AG' },
]

const QUICK_ACTIONS: { icon: IoniconName; label: string; color: string; route: string }[] = [
  { icon: 'bicycle-outline',   label: 'Reservar VIP',  color: C.gold,    route: '/vip/reservar' },
  { icon: 'time-outline',      label: 'Histórico',     color: C.primary, route: '/(intermediario)/historico' },
  { icon: 'star-outline',      label: 'Minha Frota',   color: '#8B5CF6', route: '/(intermediario)/frota' },
  { icon: 'headset-outline',   label: 'Suporte',       color: '#64748B', route: '/vip/suporte' },
]

export default function IntermediarioHomeScreen() {
  const { user } = useAuthStore()
  const { pastColetas } = useColetaStore()
  const [tipVisible, setTipVisible] = useState(true)

  const profileName = (user as any)?.name ?? user?.email?.split('@')[0] ?? 'Intermediário'
  const entregues   = pastColetas.filter((c) => c.status === 'ENTREGUE')
  const onlineCount = VIP_MOTOBOYS.filter((m) => m.online).length

  const STATS = [
    { label: 'VIPs Online',  value: String(onlineCount),         icon: 'bicycle-outline'   as IoniconName, color: C.gold    },
    { label: 'Avaliação',    value: '4.97★',                     icon: 'star-outline'       as IoniconName, color: '#FBBF24' },
    { label: 'Entregas',     value: String(entregues.length),     icon: 'cube-outline'       as IoniconName, color: C.primary },
    { label: 'Comissão',     value: 'R$ 1.240',                  icon: 'wallet-outline'     as IoniconName, color: '#A78BFA' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        backgroundColor: C.dark,
        paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
              FashionWay VIP
            </Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
              Olá, {profileName.split(' ')[0]}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/vip/reservar' as any)}
              style={{
                backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 9,
                borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
                shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
              }}
            >
              <Ionicons name="add" size={16} color="#111827" />
              <Text style={{ color: '#111827', fontSize: 13, fontWeight: '800' }}>Reservar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid 2×2 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 }}>
          {STATS.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${s.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={s.icon} size={17} color={s.color} />
                </View>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* VIP Tip */}
        {tipVisible && (
          <View style={{
            marginHorizontal: 16, marginTop: 16,
            backgroundColor: `${C.gold}14`, borderRadius: 16,
            borderWidth: 1, borderColor: `${C.gold}30`,
            padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <Ionicons name="information-circle-outline" size={22} color={C.gold} />
            <Text style={{ flex: 1, color: '#D4A013', fontSize: 12, lineHeight: 18 }}>
              Motoboys VIP têm SLA garantido de até 30 min e seguro de alto valor incluído.
            </Text>
            <TouchableOpacity onPress={() => setTipVisible(false)}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* VIP Motoboys Carousel */}
        <View style={{ paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Motoboys VIP</Text>
            <TouchableOpacity onPress={() => router.push('/(intermediario)/frota' as any)}>
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={VIP_MOTOBOYS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/vip/perfil?id=${item.id}` as any)}
                style={{
                  width: 140,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 18, padding: 14,
                  borderWidth: 1,
                  borderColor: item.online ? `${C.gold}50` : 'rgba(255,255,255,0.06)',
                  alignItems: 'center',
                }}
              >
                {/* Avatar */}
                <View style={{ position: 'relative', marginBottom: 10 }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: item.online ? `${C.gold}25` : 'rgba(255,255,255,0.08)',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: item.online ? C.gold : '#374151',
                  }}>
                    <Text style={{ color: item.online ? C.gold : '#9CA3AF', fontSize: 18, fontWeight: '800' }}>
                      {item.initials}
                    </Text>
                  </View>
                  <View style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: item.online ? '#10B981' : '#374151',
                    borderWidth: 2, borderColor: C.dark,
                  }} />
                </View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 2 }}>
                  {item.name}
                </Text>
                <Text style={{ color: C.gold, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                  {item.rating} ★
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 10, textAlign: 'center', marginBottom: 10 }}>
                  {item.specialty}
                </Text>
                {item.online ? (
                  <View style={{ backgroundColor: `${C.gold}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Online</Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Offline</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Quick Actions 2×2 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>Ações Rápidas</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => router.push(a.route as any)}
                style={{
                  width: '47%', backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 16, padding: 16, alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: `${a.color}20`,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                }}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>Entregas Recentes</Text>
          {entregues.length === 0 ? (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 32,
              alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <Ionicons name="cube-outline" size={36} color="#374151" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>Nenhuma entrega ainda</Text>
              <TouchableOpacity
                onPress={() => router.push('/vip/reservar' as any)}
                style={{ marginTop: 14, backgroundColor: C.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 }}
              >
                <Text style={{ color: '#111827', fontWeight: '800', fontSize: 13 }}>Fazer primeira reserva</Text>
              </TouchableOpacity>
            </View>
          ) : (
            entregues.slice(0, 3).map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/vip/detalhe?id=${c.id}` as any)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
                  borderWidth: 1, borderColor: `${C.gold}25`, marginBottom: 10,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-done-outline" size={20} color={C.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>#{c.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>VIP Entregue</Text>
                </View>
                <View style={{ backgroundColor: `${C.gold}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: C.gold, fontSize: 10, fontWeight: '800' }}>VIP</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/vip/reservar' as any)}
        style={{
          position: 'absolute', bottom: 88, right: 20,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: C.gold,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#111827" />
      </TouchableOpacity>
    </View>
  )
}

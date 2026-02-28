import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Switch, FlatList, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

const ELITE_MOTOBOYS = [
  { id: '1', name: 'Lucas Elite', rating: 4.98, initials: 'LE', online: true },
  { id: '2', name: 'Maria VIP',   rating: 4.96, initials: 'MV', online: true },
  { id: '3', name: 'Rafael P.',   rating: 4.99, initials: 'RP', online: false },
  { id: '4', name: 'Ana Gold',    rating: 4.95, initials: 'AG', online: true },
]

const SERVICES = [
  {
    id: 'EXPRESSA',
    label: 'VIP Expressa',
    sublabel: 'SLA garantido < 30 min',
    price: 'R$ 68',
    icon: 'flash-outline' as const,
    features: ['Prioridade máxima', 'Rastreamento em tempo real', 'Seguro incluído'],
  },
  {
    id: 'PADRAO',
    label: 'VIP Padrão',
    sublabel: 'SLA < 1h',
    price: 'R$ 45',
    icon: 'star-outline' as const,
    features: ['Alta prioridade', 'Rastreamento', 'Seguro parcial'],
  },
]

export default function ServicoVIPScreen() {
  const [vipMode,        setVipMode]        = useState(true)
  const [selectedService, setSelectedService] = useState('EXPRESSA')
  const [selectedMotoboy, setSelectedMotoboy] = useState('1')
  const [urgency,         setUrgency]         = useState(false)

  const service = SERVICES.find((s) => s.id === selectedService)!

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>VIP • Passo 2</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Seleção de Serviço</Text>
          </View>
          <View style={{ width: 40, height: 40, backgroundColor: `${C.gold}20`, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="star" size={20} color={C.gold} />
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* VIP Mode toggle card */}
        <View style={{
          backgroundColor: `${C.gold}14`, borderRadius: 18,
          borderWidth: 1, borderColor: `${C.gold}40`,
          padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24,
        }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${C.gold}25`, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="star" size={22} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Modo VIP Elite</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 1 }}>Motoboys com badge ouro, SLA garantido</Text>
          </View>
          <Switch
            value={vipMode}
            onValueChange={setVipMode}
            trackColor={{ false: '#374151', true: C.gold }}
            thumbColor="#fff"
          />
        </View>

        {/* Elite Motoboys horizontal scroll */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Motoboys Elite Disponíveis
        </Text>
        <FlatList
          horizontal
          data={ELITE_MOTOBOYS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, marginBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedMotoboy(item.id)}
              style={{
                width: 90, alignItems: 'center', padding: 12,
                backgroundColor: selectedMotoboy === item.id ? `${C.gold}18` : 'rgba(255,255,255,0.04)',
                borderRadius: 16, borderWidth: 2,
                borderColor: selectedMotoboy === item.id ? C.gold : 'rgba(255,255,255,0.06)',
              }}
            >
              <View style={{ position: 'relative', marginBottom: 6 }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 12,
                  backgroundColor: item.online ? `${C.gold}20` : 'rgba(255,255,255,0.06)',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: item.online ? C.gold : '#374151',
                }}>
                  <Text style={{ color: item.online ? C.gold : '#6B7280', fontSize: 14, fontWeight: '800' }}>{item.initials}</Text>
                </View>
                <View style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 12, height: 12, borderRadius: 6,
                  backgroundColor: item.online ? '#10B981' : '#374151',
                  borderWidth: 2, borderColor: C.dark,
                }} />
              </View>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>{item.name}</Text>
              <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700' }}>{item.rating} ★</Text>
            </TouchableOpacity>
          )}
        />

        {/* Service options */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Tipo de Serviço
        </Text>
        <View style={{ gap: 12, marginBottom: 24 }}>
          {SERVICES.map((s) => {
            const selected = selectedService === s.id
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedService(s.id)}
                style={{
                  backgroundColor: selected ? `${C.gold}14` : 'rgba(255,255,255,0.04)',
                  borderRadius: 18, padding: 16,
                  borderWidth: 2, borderColor: selected ? C.gold : 'rgba(255,255,255,0.06)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: selected ? `${C.gold}25` : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={s.icon} size={22} color={selected ? C.gold : '#6B7280'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>{s.label}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 1 }}>{s.sublabel}</Text>
                  </View>
                  <Text style={{ color: selected ? C.gold : '#9CA3AF', fontSize: 18, fontWeight: '900' }}>{s.price}</Text>
                </View>
                <View style={{ gap: 6 }}>
                  {s.features.map((f) => (
                    <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="checkmark-circle" size={14} color={selected ? C.gold : '#374151'} />
                      <Text style={{ color: selected ? '#D1D5DB' : '#4B5563', fontSize: 12 }}>{f}</Text>
                    </View>
                  ))}
                </View>
                {selected && (
                  <View style={{ position: 'absolute', top: 14, right: 14 }}>
                    <Ionicons name="checkmark-circle" size={22} color={C.gold} />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Urgency toggle */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
        }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="alarm-outline" size={20} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Urgência máxima</Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>Notifica todos os VIPs online + R$ 10</Text>
          </View>
          <Switch
            value={urgency}
            onValueChange={setUrgency}
            trackColor={{ false: '#374151', true: '#EF4444' }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.dark, borderTopWidth: 1, borderTopColor: `${C.gold}28`,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      }}>
        <TouchableOpacity
          onPress={() => router.push('/vip/pagamento' as any)}
          style={{
            backgroundColor: C.gold, borderRadius: 16, paddingVertical: 16,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
          }}
        >
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '900' }}>Continuar → Pagamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

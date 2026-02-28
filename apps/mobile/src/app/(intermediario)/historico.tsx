import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColetaStore } from '../../store/coleta.store'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

const FILTERS = ['Todos', 'Concluídas', 'Canceladas', 'Em andamento']

const MOCK_VIP = [
  { id: 'VIP-392', motoboy: 'Lucas Elite', initials: 'LE', origin: 'BellaModa – Jardins', destination: 'Itaim Bibi', status: 'ENTREGUE', commission: 'R$ 320', date: '27/02/26', pieces: 80 },
  { id: 'VIP-381', motoboy: 'Maria VIP',   initials: 'MV', origin: 'Ateliê Valentina',  destination: 'Moema',     status: 'ENTREGUE', commission: 'R$ 185', date: '26/02/26', pieces: 45 },
  { id: 'VIP-374', motoboy: 'Rafael Prem', initials: 'RP', origin: 'Studio Moderno',    destination: 'Vila Olímpia', status: 'CANCELADA', commission: '—',      date: '25/02/26', pieces: 20 },
  { id: 'VIP-360', motoboy: 'Lucas Elite', initials: 'LE', origin: 'BellaModa – Jardins', destination: 'Brooklin', status: 'ENTREGUE', commission: 'R$ 215', date: '24/02/26', pieces: 60 },
]

export default function HistoricoVIPScreen() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [search, setSearch]             = useState('')
  const { pastColetas }                 = useColetaStore()

  const totalComission = MOCK_VIP.filter((c) => c.status === 'ENTREGUE').reduce((acc) => acc + 1, 0)
  const totalStr = 'R$ 4.820'

  const filtered = MOCK_VIP.filter((c) => {
    const matchFilter =
      activeFilter === 0 ? true :
      activeFilter === 1 ? c.status === 'ENTREGUE' :
      activeFilter === 2 ? c.status === 'CANCELADA' :
      c.status === 'EM_ANDAMENTO'
    const matchSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.motoboy.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        backgroundColor: C.dark,
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Ionicons name="time-outline" size={22} color={C.gold} />
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Histórico VIP</Text>
        </View>
        <Text style={{ color: '#6B7280', fontSize: 12 }}>Todas as suas entregas VIP</Text>
      </View>

      {/* Metrics card */}
      <View style={{
        marginHorizontal: 16, marginTop: 16,
        backgroundColor: `${C.gold}14`, borderRadius: 16,
        borderWidth: 1, borderColor: `${C.gold}30`,
        padding: 16, flexDirection: 'row', justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Comissões</Text>
          <Text style={{ color: C.gold, fontSize: 26, fontWeight: '900', marginTop: 4 }}>{totalStr}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Entregas VIP</Text>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>{MOCK_VIP.filter((c) => c.status === 'ENTREGUE').length}</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(i)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              backgroundColor: activeFilter === i ? `${C.gold}18` : 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              borderColor: activeFilter === i ? `${C.gold}40` : 'rgba(255,255,255,0.08)',
            }}
          >
            <Text style={{ color: activeFilter === i ? C.gold : '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10,
        }}>
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por ID ou motoboy..."
            placeholderTextColor="#4B5563"
            style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 }}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, gap: 10 }} showsVerticalScrollIndicator={false}>
        {filtered.map((c) => {
          const isOk = c.status === 'ENTREGUE'
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push(`/vip/detalhe?id=${c.id}` as any)}
              style={{
                backgroundColor: '#1A2233', borderRadius: 18, padding: 14,
                borderWidth: 1, borderColor: isOk ? `${C.gold}30` : 'rgba(255,255,255,0.06)',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                {/* Motoboy avatar */}
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: isOk ? `${C.gold}20` : 'rgba(255,255,255,0.06)',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: isOk ? `${C.gold}40` : 'rgba(255,255,255,0.1)',
                }}>
                  <Text style={{ color: isOk ? C.gold : '#6B7280', fontSize: 14, fontWeight: '800' }}>{c.initials}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>#{c.id}</Text>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                      backgroundColor: isOk ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    }}>
                      <Text style={{ color: isOk ? '#10B981' : '#EF4444', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                        {isOk ? 'Entregue' : 'Cancelada'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#6B7280', fontSize: 11, marginBottom: 4 }}>
                    {c.motoboy} • {c.pieces} peças
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold }} />
                    <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{c.origin}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                    <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{c.destination}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: C.gold, fontSize: 15, fontWeight: '900' }}>{c.commission}</Text>
                  <Text style={{ color: '#4B5563', fontSize: 10, marginTop: 4 }}>{c.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

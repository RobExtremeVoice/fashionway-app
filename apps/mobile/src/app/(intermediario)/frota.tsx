import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Switch,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const MOTOBOYS = [
  {
    id: '1', name: 'Maria VIP', rating: 4.96, specialty: 'Moda Praia • SP Centro',
    deliveries: 28, success: '100%', online: true, initials: 'MV',
    lastDelivery: 'há 2h',
  },
  {
    id: '2', name: 'Rafael Premium', rating: 4.99, specialty: 'Alta Costura • Jardins',
    deliveries: 15, success: '100%', online: false, initials: 'RP',
    lastDelivery: 'há 5h',
  },
  {
    id: '3', name: 'Lucas Elite', rating: 4.98, specialty: 'Bijuteria • Centro',
    deliveries: 43, success: '98%', online: true, initials: 'LE',
    lastDelivery: 'há 30 min',
  },
]

const NOTIFICATIONS = [
  { id: '1', icon: 'person-outline' as IoniconName,        msg: 'Lucas Elite ficou online • Disponível agora', time: 'há 5 min',  action: 'Reservar',  color: C.gold    },
  { id: '2', icon: 'shield-checkmark-outline' as IoniconName, msg: 'Novo VIP cadastrado: Rafael Premium • Rating 4.99', time: 'há 1h', action: 'Ver perfil', color: C.primary },
  { id: '3', icon: 'checkmark-circle-outline' as IoniconName, msg: 'Entrega VIP concluída com sucesso • Comissão processada', time: 'há 3h', amount: 'R$ 185', color: C.gold },
]

const FILTERS = ['Online primeiro', 'Rating', 'Mais usado']

export default function FrotaVIPScreen() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [notifyOnline, setNotifyOnline] = useState(true)
  const [notifyUrgent, setNotifyUrgent] = useState(false)

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="star" size={22} color={C.gold} />
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Minha Frota VIP</Text>
          </View>
          <TouchableOpacity style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.06)',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>
          Motoboys elite salvos • Prioridade nas suas coletas
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, gap: 8 }}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(i)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeFilter === i ? `${C.gold}18` : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: activeFilter === i ? `${C.gold}40` : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{
                color: activeFilter === i ? C.gold : '#9CA3AF',
                fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{f}</Text>
              <Ionicons name="chevron-down" size={12} color={activeFilter === i ? C.gold : '#6B7280'} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Motoboy Cards */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
          {MOTOBOYS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => router.push(`/vip/perfil?id=${m.id}` as any)}
              style={{
                backgroundColor: '#1A2233',
                borderRadius: 20, padding: 16,
                borderWidth: 1,
                borderColor: m.online ? `${C.gold}40` : 'rgba(255,255,255,0.08)',
                opacity: m.online ? 1 : 0.8,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 14 }}>
                {/* Avatar */}
                <View style={{ position: 'relative', width: 64, height: 64 }}>
                  <View style={{
                    width: 64, height: 64, borderRadius: 14,
                    backgroundColor: m.online ? `${C.gold}20` : 'rgba(255,255,255,0.06)',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: m.online ? `${C.gold}60` : 'rgba(255,255,255,0.12)',
                  }}>
                    <Text style={{ color: m.online ? C.gold : '#9CA3AF', fontSize: 20, fontWeight: '800' }}>{m.initials}</Text>
                  </View>
                  {/* Gold star badge */}
                  <View style={{
                    position: 'absolute', bottom: -4, right: -4,
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: m.online ? C.gold : '#374151',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: '#1A2233',
                  }}>
                    <Ionicons name="star" size={9} color={m.online ? '#111827' : '#6B7280'} />
                  </View>
                  {/* Online dot */}
                  <View style={{
                    position: 'absolute', top: -4, left: -4,
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: m.online ? '#10B981' : '#374151',
                    borderWidth: 2, borderColor: '#1A2233',
                  }} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>
                      {m.name} • <Text style={{ color: C.gold }}>{m.rating} ★</Text>
                    </Text>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                      backgroundColor: m.online ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1, borderColor: m.online ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)',
                    }}>
                      <Text style={{ color: m.online ? '#10B981' : '#6B7280', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                        {m.online ? 'Online agora' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 8 }}>{m.specialty}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                      <Text style={{ color: '#4B5563', fontSize: 10 }}>Última entrega: {m.lastDelivery}</Text>
                      <Text style={{ color: C.gold, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                        Com você: {m.deliveries} entregas • {m.success} sucesso
                      </Text>
                    </View>
                    <Ionicons name="star" size={18} color={C.gold} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* VIP Notifications */}
        <View style={{ paddingHorizontal: 16, paddingTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Notificações VIP</Text>
              <View style={{ position: 'relative' }}>
                <Ionicons name="notifications-outline" size={20} color={C.gold} />
                <View style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: C.dark,
                }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>3</Text>
                </View>
              </View>
            </View>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>Ver todas</Text>
          </View>

          <View style={{ gap: 8 }}>
            {NOTIFICATIONS.map((n) => (
              <View key={n.id} style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 14, padding: 12,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
                flexDirection: 'row', alignItems: 'center', gap: 12,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${n.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={n.icon} size={18} color={n.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', flex: 1, lineHeight: 16 }}>{n.msg}</Text>
                    {n.amount && <Text style={{ color: C.gold, fontWeight: '800', fontSize: 14, marginLeft: 8 }}>{n.amount}</Text>}
                    {n.time && !n.amount && <Text style={{ color: '#4B5563', fontSize: 10, marginLeft: 8 }}>{n.time}</Text>}
                  </View>
                  {n.action && (
                    <TouchableOpacity style={{ marginTop: 6, alignSelf: 'flex-start', backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ color: '#111827', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>{n.action}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Toggles */}
          <View style={{ marginTop: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#CBD5E1', fontSize: 14 }}>Notificar quando VIP online</Text>
              <Switch
                value={notifyOnline}
                onValueChange={setNotifyOnline}
                trackColor={{ false: '#374151', true: C.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#CBD5E1', fontSize: 14 }}>Alertas urgentes (&lt;30 min)</Text>
              <Switch
                value={notifyUrgent}
                onValueChange={setNotifyUrgent}
                trackColor={{ false: '#374151', true: C.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {[
              { label: 'Buscar Mais VIP', icon: 'search-outline' as IoniconName, bg: C.primary, textColor: '#fff' },
              { label: 'Ver Disponíveis', icon: 'navigate-outline' as IoniconName, bg: C.gold, textColor: '#111827' },
              { label: 'Preferências VIP', icon: 'settings-outline' as IoniconName, bg: '#0D9488', textColor: '#fff' },
            ].map((a) => (
              <View key={a.label} style={{
                width: 120, height: 100,
                backgroundColor: a.bg, borderRadius: 18,
                padding: 14, alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Ionicons name={a.icon} size={28} color={a.textColor} />
                <Text style={{ color: a.textColor, fontSize: 10, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', lineHeight: 14 }}>
                  {a.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

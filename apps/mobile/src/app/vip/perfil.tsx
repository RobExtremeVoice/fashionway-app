import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

const STATS = [
  { label: 'Entregas', value: '312',   icon: 'cube-outline'     as IoniconName },
  { label: 'Rating',   value: '4.98★', icon: 'star-outline'     as IoniconName },
  { label: 'Sucesso',  value: '99.4%', icon: 'checkmark-circle-outline' as IoniconName },
  { label: 'SLA',      value: '28 min', icon: 'timer-outline'   as IoniconName },
]

const SPECIALTIES = ['Alta Costura', 'Bijuteria', 'Acessórios', 'Moda Rápida', 'Roupa Íntima']

const REVIEWS = [
  { name: 'BellaModa',    rating: 5, comment: 'Entrega impecável, peças chegaram perfeitas. Super recomendo!',     time: 'há 2 dias' },
  { name: 'Ateliê Valor', rating: 5, comment: 'Profissional exemplar. Pontual e cuidadoso com a mercadoria.',       time: 'há 5 dias' },
  { name: 'Studio 81',    rating: 4, comment: 'Muito bom! Pequeno atraso por trânsito, mas comunicou proativamente.', time: 'há 1 sem' },
]

export default function PerfilVIPScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 }}>Perfil VIP</Text>
        <Ionicons name="star" size={22} color={C.gold} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 120 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
        <View style={{
          backgroundColor: '#1A2233', paddingTop: 28, paddingBottom: 24, paddingHorizontal: 20,
          alignItems: 'center', borderBottomWidth: 1, borderBottomColor: `${C.gold}20`,
        }}>
          {/* Avatar */}
          <View style={{ position: 'relative', marginBottom: 14 }}>
            <View style={{
              width: 96, height: 96, borderRadius: 24,
              backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: C.gold,
            }}>
              <Text style={{ color: C.gold, fontSize: 36, fontWeight: '900' }}>LE</Text>
            </View>
            {/* Gold star badge */}
            <View style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: '#1A2233',
            }}>
              <Ionicons name="star" size={14} color="#111827" />
            </View>
            {/* Online dot */}
            <View style={{
              position: 'absolute', top: 4, left: 4,
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: '#10B981', borderWidth: 2, borderColor: '#1A2233',
            }} />
          </View>

          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Lucas Elite</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Text style={{ color: C.gold, fontSize: 14, fontWeight: '700' }}>4.98 ★</Text>
            <View style={{ backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: '#111827', fontSize: 10, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>ELITE VIP</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Online</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 }}>
          {STATS.map((s) => (
            <View key={s.label} style={{
              width: '47%', backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
            }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Ionicons name={s.icon} size={18} color={C.gold} />
              </View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{s.value}</Text>
              <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Specialties */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Especialidades</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALTIES.map((s) => (
              <View key={s} style={{
                backgroundColor: `${C.gold}15`, paddingHorizontal: 12, paddingVertical: 7,
                borderRadius: 20, borderWidth: 1, borderColor: `${C.gold}35`,
              }}>
                <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio + Vehicle */}
        <View style={{ marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20, gap: 14 }}>
          <View>
            <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Bio</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 20 }}>
              5 anos de experiência em entregas de moda de alto valor. Especialista em manuseio de peças delicadas e entregas em regiões nobres de São Paulo.
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="bicycle-outline" size={20} color={C.gold} />
            </View>
            <View>
              <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Veículo</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 }}>Honda CB 500 – 2023 (Baú XL)</Text>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Avaliações</Text>
          <View style={{ gap: 10 }}>
            {REVIEWS.map((r) => (
              <View key={r.name} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{r.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color={C.gold} />
                    ))}
                    <Text style={{ color: '#4B5563', fontSize: 10, marginLeft: 4 }}>{r.time}</Text>
                  </View>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 12, lineHeight: 18 }}>{r.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed action footer */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.dark, borderTopWidth: 1, borderTopColor: `${C.gold}28`,
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        flexDirection: 'row', gap: 12,
      }}>
        <TouchableOpacity style={{
          flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 14,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <Ionicons name="call-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Ligar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/vip/reservar' as any)}
          style={{
            flex: 2, backgroundColor: C.gold, borderRadius: 14, paddingVertical: 14,
            alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
            shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
          }}
        >
          <Ionicons name="star-outline" size={18} color="#111827" />
          <Text style={{ color: '#111827', fontSize: 14, fontWeight: '900' }}>Reservar este VIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

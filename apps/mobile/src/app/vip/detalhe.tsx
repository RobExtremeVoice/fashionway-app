import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

export default function DetalheVIPScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const orderId = id ?? 'VIP-392'

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        backgroundColor: `${C.dark}E8`,
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>
            Detalhe VIP <Text style={{ color: C.gold }}>#{orderId}</Text>
          </Text>
        </View>
        <Ionicons name="star" size={22} color={C.gold} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>

        {/* Status */}
        <View style={{ alignItems: 'center' }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: `${C.gold}15`, borderWidth: 1, borderColor: `${C.gold}40`,
            paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, marginBottom: 8,
          }}>
            <Ionicons name="checkmark-circle" size={18} color={C.gold} />
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Concluída VIP</Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>27 de Fevereiro, 2026 • 16:42</Text>
        </View>

        {/* Mini map placeholder */}
        <View style={{
          height: 160, borderRadius: 18, overflow: 'hidden',
          backgroundColor: '#1F2937', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          alignItems: 'center', justifyContent: 'flex-end',
        }}>
          {/* Dashed route visual */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '70%', height: 2, borderTopWidth: 3, borderColor: C.gold, borderStyle: 'dashed', transform: [{ rotate: '-8deg' }] }} />
          </View>
          <View style={{ position: 'absolute', top: 60, left: 80 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.gold }} />
          </View>
          <View style={{ position: 'absolute', top: 40, right: 60 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary }} />
          </View>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rota VIP Prioritária</Text>
          </View>
        </View>

        {/* Motoboy card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22,
          borderWidth: 1, borderColor: `${C.gold}25`,
          padding: 16, gap: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ position: 'relative' }}>
              <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold }}>
                <Text style={{ color: C.gold, fontSize: 22, fontWeight: '900' }}>LE</Text>
              </View>
              <View style={{ position: 'absolute', bottom: -3, right: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.dark }}>
                <Ionicons name="star" size={10} color="#111827" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>Lucas Elite</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700' }}>4.98 ★</Text>
                <View style={{ backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#111827', fontSize: 9, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' }}>ELITE VIP</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 12, borderRadius: 14,
            }}>
              <Ionicons name="call-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${orderId}` as any)}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                backgroundColor: C.gold, paddingVertical: 12, borderRadius: 14,
                shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#111827" />
              <Text style={{ color: '#111827', fontSize: 13, fontWeight: '800' }}>Chat VIP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery details */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 20, gap: 20 }}>
          {/* Address connector */}
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: C.gold }} />
              <View style={{ width: 1, height: 36, borderLeftWidth: 1, borderLeftColor: '#374151', borderStyle: 'dashed', marginVertical: 3 }} />
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />
            </View>
            <View style={{ gap: 24, flex: 1 }}>
              <View>
                <Text style={{ fontSize: 9, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Origem</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 14, fontWeight: '700', marginTop: 2 }}>BellaModa – Jardins, SP</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Destino</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 14, fontWeight: '700', marginTop: 2 }}>Residência Cliente – Itaim Bibi, SP</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

          {/* Items */}
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="bag-outline" size={18} color={C.gold} />
            </View>
            <View>
              <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Itens</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 }}>80 peças (Alta Costura)</Text>
              <Text style={{ color: '#6B7280', fontSize: 11, fontStyle: 'italic', marginTop: 1 }}>Vestidos de seda, Blazers</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="timer-outline" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Serviço</Text>
              <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', marginTop: 2 }}>VIP Expressa (SLA &lt; 30 min)</Text>
            </View>
          </View>
        </View>

        {/* Financial summary */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22,
          borderWidth: 1, borderColor: `${C.gold}30`, padding: 20,
        }}>
          <Text style={{ color: C.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Resumo Financeiro</Text>
          {[
            { label: 'Valor das Peças', value: 'R$ 12.450,00' },
            { label: 'Frete VIP',       value: 'R$ 68,00' },
            { label: 'Seguro Ouro',     value: 'R$ 15,00' },
          ].map((r) => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{r.label}</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{r.value}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>TOTAL PAGO</Text>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>R$ 12.533,00</Text>
          </View>
          {/* Commission */}
          <View style={{
            backgroundColor: `${C.gold}15`, borderRadius: 14, padding: 14,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            borderWidth: 1, borderColor: `${C.gold}30`,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold }} />
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Comissão VIP</Text>
            </View>
            <Text style={{ color: C.gold, fontSize: 22, fontWeight: '900' }}>R$ 320,00</Text>
          </View>
        </View>

        {/* Footer action */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.5, marginBottom: 4 }}>
          <Ionicons name="shield-checkmark-outline" size={14} color={C.primary} />
          <Text style={{ color: '#9CA3AF', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' }}>Assinado digitalmente por BellaModa</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/vip/comprovante' as any)}
          style={{
            backgroundColor: C.gold, borderRadius: 18, paddingVertical: 18,
            alignItems: 'center',
            shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
          }}
        >
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '900' }}>Ver Comprovante VIP</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

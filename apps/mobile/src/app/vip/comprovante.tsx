import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

export default function ComprovanteVIPScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Ionicons name="star" size={22} color={C.gold} />
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Comprovante VIP</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 160 : 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* White receipt card */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 28,
          borderWidth: 2, borderColor: C.gold,
          overflow: 'hidden',
          shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
        }}>
          {/* Status header */}
          <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 20, paddingHorizontal: 20 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
            }}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
            <Text style={{ color: '#111827', fontSize: 18, fontWeight: '900' }}>ENTREGA CONCLUÍDA</Text>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 4 }}>#VIP-392-FW</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
              27 de Fevereiro, 2026 • 16:42
            </Text>
          </View>

          {/* Dashed divider */}
          <View style={{ borderTopWidth: 2, borderColor: C.gold, borderStyle: 'dashed', marginHorizontal: 20, marginBottom: 20 }} />

          {/* Logistics */}
          <View style={{ paddingHorizontal: 20, gap: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, marginTop: 5 }} />
              <View>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Origem</Text>
                <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700', marginTop: 2 }}>BellaModa – Jardins, SP</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#111827', marginTop: 5 }} />
              <View>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Destino</Text>
                <Text style={{ color: '#111827', fontSize: 14, fontWeight: '700', marginTop: 2 }}>Residência Cliente – Itaim Bibi, SP</Text>
              </View>
            </View>

            {/* Item details */}
            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                <Ionicons name="bag-outline" size={18} color={C.gold} />
              </View>
              <View>
                <Text style={{ color: '#111827', fontSize: 12, fontWeight: '800' }}>80 peças (Alta Costura)</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 1, fontStyle: 'italic' }}>Vestidos de seda, Blazers</Text>
              </View>
            </View>
          </View>

          {/* Motoboy info */}
          <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: '#111827', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ position: 'relative' }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${C.gold}25`, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold }}>
                  <Text style={{ color: C.gold, fontSize: 13, fontWeight: '800' }}>LE</Text>
                </View>
                <View style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#111827' }}>
                  <Ionicons name="star" size={7} color="#111827" />
                </View>
              </View>
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Entregador VIP</Text>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 1 }}>Lucas Elite</Text>
              </View>
            </View>
            <View style={{ backgroundColor: `${C.gold}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: `${C.gold}40` }}>
              <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>BADGE GOLD</Text>
            </View>
          </View>
        </View>

        {/* Financial summary */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {[
            { label: 'Valor do Serviço', value: 'R$ 255,00' },
            { label: 'Taxa VIP Elite',   value: 'R$ 65,00'  },
          ].map((r) => (
            <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{r.label}</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{r.value}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#1F2937', marginTop: 4 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>TOTAL</Text>
            <Text style={{ color: C.gold, fontSize: 26, fontWeight: '900' }}>R$ 320,00</Text>
          </View>
        </View>

        {/* Security */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, opacity: 0.55 }}>
          <Ionicons name="lock-closed-outline" size={13} color={C.gold} />
          <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pagamento 100% seguro & criptografado</Text>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.dark, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        gap: 10,
      }}>
        <TouchableOpacity
          onPress={() => router.push('/vip/compartilhar' as any)}
          style={{
            backgroundColor: C.gold, borderRadius: 18, paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
          }}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Compartilhar Comprovante</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/vip/exportar' as any)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, paddingVertical: 15,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Ionicons name="download-outline" size={20} color="#9CA3AF" />
          <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '700' }}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

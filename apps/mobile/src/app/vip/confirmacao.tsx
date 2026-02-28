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

export default function ConfirmacaoVIPScreen() {
  const orderId = `VIP-${Math.floor(Math.random() * 900 + 100)}`

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Ionicons name="star" size={24} color={C.gold} />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Comprovante VIP</Text>
        <TouchableOpacity onPress={() => router.replace('/(intermediario)/home' as any)}>
          <Ionicons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: Platform.OS === 'ios' ? 48 : 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: C.gold,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
          }}>
            <Ionicons name="checkmark" size={44} color="#111827" />
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>Reserva Confirmada!</Text>
          <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 4 }}>#{orderId}-FW</Text>
          <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 6 }}>27 de Fevereiro, 2026 • 16:42</Text>
        </View>

        {/* Main receipt card */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 24,
          borderWidth: 2, borderColor: C.gold,
          overflow: 'hidden', marginBottom: 24,
        }}>
          {/* Status */}
          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 16 }}>
            <View style={{ backgroundColor: `${C.gold}20`, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: `${C.gold}40` }}>
              <Text style={{ color: C.gold, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>VIP Expressa Confirmada</Text>
            </View>
          </View>

          {/* Gold separator */}
          <View style={{ height: 1, backgroundColor: C.gold, opacity: 0.3, marginHorizontal: 16 }} />

          {/* Address connector */}
          <View style={{ padding: 20, flexDirection: 'row', gap: 16 }}>
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: C.gold }} />
              <View style={{ width: 1, height: 40, borderLeftWidth: 1, borderLeftColor: '#D1D5DB', borderStyle: 'dashed', marginVertical: 3 }} />
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />
            </View>
            <View style={{ gap: 20, flex: 1 }}>
              <View>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Origem</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 2 }}>BellaModa – Jardins, SP</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Destino</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 2 }}>Residência Cliente – Itaim Bibi, SP</Text>
              </View>
            </View>
          </View>

          {/* Motoboy info */}
          <View style={{ margin: 16, backgroundColor: '#111827', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: `${C.gold}25`, alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: C.gold,
            }}>
              <Text style={{ color: C.gold, fontSize: 14, fontWeight: '800' }}>LE</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Motoboy VIP</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Lucas Elite</Text>
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>4.98 ★</Text>
            </View>
            <View style={{ backgroundColor: `${C.gold}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: `${C.gold}40` }}>
              <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>ELITE VIP</Text>
            </View>
          </View>

          {/* Cargo + total grid */}
          <View style={{ flexDirection: 'row', margin: 16, marginTop: 0, gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${C.gold}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="cube-outline" size={14} color={C.gold} />
                </View>
                <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Carga</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>80 peças</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Alta Costura</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: `${C.gold}12`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${C.gold}30` }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${C.gold}30`, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="wallet-outline" size={14} color={C.gold} />
                </View>
                <Text style={{ fontSize: 9, color: '#6B4C00', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '900', color: C.gold }}>R$ 93,00</Text>
              <Text style={{ fontSize: 10, color: '#92680B' }}>Frete VIP pago</Text>
            </View>
          </View>
        </View>

        {/* CTA buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push(`/coleta/tracking?id=VIP` as any)}
            style={{
              backgroundColor: C.gold, borderRadius: 16, paddingVertical: 16,
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
              shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
            }}
          >
            <Ionicons name="navigate-outline" size={20} color="#111827" />
            <Text style={{ color: '#111827', fontSize: 16, fontWeight: '900' }}>Ir para Rastreamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/vip/comprovante' as any)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingVertical: 16,
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
              borderWidth: 1, borderColor: `${C.gold}30`,
            }}
          >
            <Ionicons name="document-text-outline" size={20} color={C.gold} />
            <Text style={{ color: C.gold, fontSize: 15, fontWeight: '700' }}>Ver Comprovante VIP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(intermediario)/home' as any)}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Platform, ActivityIndicator,
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

const PAYMENT_METHODS: { id: string; label: string; desc: string; icon: IoniconName }[] = [
  { id: 'PIX',     label: 'PIX',                 desc: 'Aprovação instantânea',       icon: 'flash-outline'          },
  { id: 'CREDITO', label: 'Cartão de Crédito',   desc: 'Parcelamento disponível',     icon: 'card-outline'           },
  { id: 'FATURA',  label: 'Fatura FashionWay',   desc: 'Limite de crédito aprovado',  icon: 'document-text-outline'  },
]

const STEPS = ['Reserva', 'Serviço', 'Pagamento']

export default function PagamentoVIPScreen() {
  const [method,  setMethod]  = useState('PIX')
  const [paying,  setPaying]  = useState(false)

  async function handlePay() {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 1500))
    setPaying(false)
    router.push('/vip/confirmacao' as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: `${C.gold}28`,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>VIP • Passo 3</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Pagamento VIP</Text>
          </View>
        </View>

        {/* Progress steps */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
          {STEPS.map((step, i) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: i <= 2 ? C.gold : 'rgba(255,255,255,0.1)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {i < 2 ? (
                    <Ionicons name="checkmark" size={14} color="#111827" />
                  ) : (
                    <Text style={{ color: '#111827', fontSize: 12, fontWeight: '800' }}>{i + 1}</Text>
                  )}
                </View>
                <Text style={{ color: i <= 2 ? C.gold : '#4B5563', fontSize: 9, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' }}>{step}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={{ flex: 1, height: 2, backgroundColor: i < 2 ? C.gold : 'rgba(255,255,255,0.1)', marginBottom: 16, marginHorizontal: 4 }} />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary glass card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20,
          borderWidth: 1, borderColor: `${C.gold}30`,
          padding: 18, marginBottom: 24,
        }}>
          <Text style={{ color: C.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Resumo VIP
          </Text>
          {[
            { label: 'Serviço VIP Expressa',   value: 'R$ 68,00' },
            { label: 'Seguro Ouro',             value: 'R$ 15,00' },
            { label: 'Taxa Urgência',           value: 'R$ 10,00' },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{row.label}</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{row.value}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>TOTAL</Text>
            <Text style={{ color: C.gold, fontSize: 24, fontWeight: '900' }}>R$ 93,00</Text>
          </View>

          {/* Comissão VIP highlight */}
          <View style={{
            marginTop: 14, backgroundColor: `${C.gold}15`, borderRadius: 12,
            borderWidth: 1, borderColor: `${C.gold}30`,
            padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold }} />
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sua Comissão VIP</Text>
            </View>
            <Text style={{ color: C.gold, fontSize: 20, fontWeight: '900' }}>R$ 25,00</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Forma de Pagamento
        </Text>
        <View style={{ gap: 10, marginBottom: 24 }}>
          {PAYMENT_METHODS.map((m) => {
            const selected = method === m.id
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMethod(m.id)}
                style={{
                  backgroundColor: selected ? `${C.gold}14` : 'rgba(255,255,255,0.04)',
                  borderRadius: 16, padding: 16,
                  borderWidth: 2, borderColor: selected ? C.gold : 'rgba(255,255,255,0.06)',
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: selected ? `${C.gold}25` : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={m.icon} size={22} color={selected ? C.gold : '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{m.label}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 1 }}>{m.desc}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={C.gold} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Security banner */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.6 }}>
          <Ionicons name="shield-checkmark-outline" size={14} color={C.primary} />
          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Pagamento 100% seguro e criptografado
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.dark, borderTopWidth: 1, borderTopColor: `${C.gold}28`,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      }}>
        <TouchableOpacity
          onPress={handlePay}
          disabled={paying}
          style={{
            backgroundColor: C.gold, borderRadius: 16, paddingVertical: 16,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
          }}
        >
          {paying
            ? <ActivityIndicator color="#111827" />
            : <Text style={{ color: '#111827', fontSize: 16, fontWeight: '900' }}>Confirmar Pagamento VIP</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

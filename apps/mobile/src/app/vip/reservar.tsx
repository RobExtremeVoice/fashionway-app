import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Switch, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

const MOTOBOYS = [
  { id: '1', name: 'Lucas Elite',  rating: 4.98, online: true,  initials: 'LE', specialty: 'Alta Costura' },
  { id: '2', name: 'Maria VIP',    rating: 4.96, online: true,  initials: 'MV', specialty: 'Moda Praia'   },
  { id: '3', name: 'Rafael Prem',  rating: 4.99, online: false, initials: 'RP', specialty: 'Bijuteria'    },
]

export default function ReservarVIPScreen() {
  const [selectedMotoboy, setSelectedMotoboy] = useState('1')
  const [origin, setOrigin]                   = useState('')
  const [destination, setDestination]         = useState('')
  const [items, setItems]                     = useState('')
  const [insurance, setInsurance]             = useState(true)
  const [priority, setPriority]               = useState(false)
  const [photos, setPhotos]                   = useState(false)

  const extras = (insurance ? 15 : 0) + (priority ? 20 : 0) + (photos ? 10 : 0)
  const basePrice = 68
  const total = basePrice + extras

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
            <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>VIP</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Reservar Motoboy</Text>
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
        keyboardShouldPersistTaps="handled"
      >

        {/* Select VIP Motoboy */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Selecionar Motoboy VIP
        </Text>
        <View style={{ gap: 10, marginBottom: 24 }}>
          {MOTOBOYS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMotoboy(m.id)}
              style={{
                backgroundColor: selectedMotoboy === m.id ? `${C.gold}14` : 'rgba(255,255,255,0.04)',
                borderRadius: 16, padding: 14,
                borderWidth: 2,
                borderColor: selectedMotoboy === m.id ? C.gold : 'rgba(255,255,255,0.06)',
                flexDirection: 'row', alignItems: 'center', gap: 14,
              }}
            >
              <View style={{
                width: 52, height: 52, borderRadius: 12,
                backgroundColor: m.online ? `${C.gold}20` : 'rgba(255,255,255,0.06)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: m.online ? C.gold : '#374151',
              }}>
                <Text style={{ color: m.online ? C.gold : '#6B7280', fontSize: 16, fontWeight: '800' }}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{m.name}</Text>
                  <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700' }}>{m.rating} ★</Text>
                </View>
                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{m.specialty}</Text>
              </View>
              {m.online ? (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
              ) : (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#374151' }} />
              )}
              {selectedMotoboy === m.id && (
                <Ionicons name="checkmark-circle" size={22} color={C.gold} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Address Fields */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Rota
        </Text>

        {/* Origin */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>Origem</Text>
          </View>
          <TextInput
            value={origin}
            onChangeText={setOrigin}
            placeholder="Endereço de coleta..."
            placeholderTextColor="#4B5563"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 14, paddingVertical: 13,
              color: '#fff', fontSize: 14,
            }}
          />
        </View>

        {/* Destination */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>Destino</Text>
          </View>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Endereço de entrega..."
            placeholderTextColor="#4B5563"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 14, paddingVertical: 13,
              color: '#fff', fontSize: 14,
            }}
          />
        </View>

        {/* Items */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Itens
        </Text>
        <TextInput
          value={items}
          onChangeText={setItems}
          placeholder="Ex: 80 peças (vestidos de seda, blazers)..."
          placeholderTextColor="#4B5563"
          multiline
          numberOfLines={3}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            paddingHorizontal: 14, paddingVertical: 13,
            color: '#fff', fontSize: 14, minHeight: 80,
            marginBottom: 24,
          }}
        />

        {/* VIP Extras */}
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Extras VIP
        </Text>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden', marginBottom: 24,
        }}>
          {[
            { label: 'Seguro Ouro', desc: 'Cobertura até R$ 50.000', value: insurance, set: setInsurance, price: 'R$ 15' },
            { label: 'Prioridade Máxima', desc: 'SLA garantido < 20 min', value: priority, set: setPriority, price: 'R$ 20' },
            { label: 'Fotos na Entrega', desc: 'Prova fotográfica', value: photos, set: setPhotos, price: 'R$ 10' },
          ].map((e, i) => (
            <View key={e.label} style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 14, gap: 14,
              borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{e.label}</Text>
                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{e.desc}</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700', marginRight: 8 }}>{e.price}</Text>
              <Switch
                value={e.value}
                onValueChange={e.set}
                trackColor={{ false: '#374151', true: C.gold }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Price Footer */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.dark, borderTopWidth: 1, borderTopColor: `${C.gold}28`,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: '#6B7280', fontSize: 11 }}>Frete base: R$ {basePrice}</Text>
            {extras > 0 && <Text style={{ color: '#6B7280', fontSize: 11 }}>Extras: R$ {extras}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Total estimado</Text>
            <Text style={{ color: C.gold, fontSize: 22, fontWeight: '900' }}>R$ {total}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/vip/servico' as any)}
          style={{
            backgroundColor: C.gold, borderRadius: 16, paddingVertical: 16,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
          }}
        >
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '900' }}>Continuar → Serviço VIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

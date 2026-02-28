import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Platform, Alert, Linking,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

const FREQUENT = [
  { initials: 'J',  name: 'João BellaModa', bg: ['#374151', '#1F2937'] },
  { initials: 'AV', name: 'Ateliê V.',      bg: ['#312E81', '#4C1D95'] },
  { initials: 'MV', name: 'Maria VIP',      bg: ['#7F1D1D', '#991B1B'] },
  { initials: 'L',  name: 'Logística SP',   bg: ['#064E3B', '#065F46'] },
  { initials: 'C',  name: 'Carlos M.',      bg: ['#374151', '#1F2937'] },
]

const CONTACTS = [
  { initials: 'A', name: 'Aline Boutique',     bg: '#2563EB' },
  { initials: 'B', name: 'Bruno Entrega',      bg: '#D97706' },
  { initials: 'D', name: 'Distribuidora Leste', bg: '#7C3AED' },
]

const WA_MSG = 'Olá! Segue o comprovante da entrega VIP #VIP-392 da FashionWay. Confira: fashionway.com.br/v/392'

export default function CompartilharVIPScreen() {
  const [search, setSearch] = useState('')

  const handleWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(WA_MSG)}`
    Linking.openURL(url).catch(() => Alert.alert('WhatsApp não encontrado', 'Instale o WhatsApp para compartilhar.'))
  }

  const filtered = CONTACTS.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{ paddingTop: 48, paddingBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Compartilhar Comprovante</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 200, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt preview */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22,
          borderWidth: 1, borderColor: C.gold,
          padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden',
        }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${C.gold}25`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.gold}40` }}>
            <Ionicons name="checkmark-circle-outline" size={24} color={C.gold} />
          </View>
          <View>
            <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Entrega Concluída</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' }}>VIP Delivery ID #VIP-392</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>FashionWay Logistics VIP</Text>
          </View>
        </View>

        {/* Search */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10,
        }}>
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar contato ou grupo"
            placeholderTextColor="#4B5563"
            style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 13 }}
          />
        </View>

        {/* Frequent contacts */}
        <View>
          <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Contatos Frequentes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {FREQUENT.map((c) => (
              <TouchableOpacity
                key={c.name}
                onPress={() => Alert.alert('Enviado', `Comprovante enviado para ${c.name}`)}
                style={{ alignItems: 'center', gap: 6, width: 64 }}
              >
                <View style={{
                  width: 56, height: 56, borderRadius: 18,
                  backgroundColor: c.bg[0],
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{c.initials}</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, textAlign: 'center', lineHeight: 13 }} numberOfLines={2}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All contacts */}
        <View>
          <Text style={{ color: C.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Todos os Contatos</Text>
          <View style={{ gap: 6 }}>
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.name}
                onPress={() => Alert.alert('Enviado', `Comprovante enviado para ${c.name}`)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 14,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${c.bg}30`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: c.bg, fontSize: 16, fontWeight: '800' }}>{c.initials}</Text>
                  </View>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{c.name}</Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Enviar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        gap: 14,
      }}>
        {/* Message preview */}
        <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 18, fontStyle: 'italic' }}>
            "{WA_MSG}"
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleWhatsApp}
          style={{
            backgroundColor: C.primary, borderRadius: 20, paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
            shadowColor: C.primary, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
          }}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Abrir no WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

export default function ExportarVIPScreen() {
  const handleSave = () => Alert.alert('PDF Salvo', 'Comprovante_VIP_392.pdf salvo nos Downloads.')

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
      }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Exportar Comprovante</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Paper document preview */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, alignItems: 'center', gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          backgroundColor: '#fff', width: '100%', borderRadius: 16, padding: 28,
          alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
        }}>
          {/* Brand icon */}
          <Ionicons name="star" size={36} color={C.gold} style={{ marginBottom: 14 }} />
          <Text style={{ color: '#111827', fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 }}>
            COMPROVANTE DE ENTREGA VIP
          </Text>
          <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700', marginTop: 4 }}>#VIP-392-FW</Text>

          {/* Dashed divider */}
          <View style={{ width: '100%', height: 1, borderTopWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', marginVertical: 20 }} />

          {/* Details */}
          <View style={{ width: '100%', gap: 14 }}>
            {[
              { label: 'Data da Entrega',           value: '27 de Fevereiro, 2026 • 16:42' },
              { label: 'Itens Entregues',            value: '80 peças (Alta Costura)' },
              { label: 'Detalhes',                   value: 'Vestidos de seda, Blazers' },
              { label: 'Entregador Responsável',     value: 'Lucas Elite' },
            ].map((row) => (
              <View key={row.label}>
                <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <Text style={{ color: '#111827', fontSize: 13, fontWeight: '700' }}>{row.value}</Text>
                  {row.label === 'Entregador Responsável' && (
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: '#FDE68A' }}>
                      <Text style={{ color: '#92400E', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>SELO GOLD</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Signature area */}
          <View style={{ width: '100%', marginTop: 24 }}>
            <View style={{ width: '100%', height: 1, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assinatura do Recebedor</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 9 }}>ID: FW-SIGN-992</Text>
            </View>
          </View>

          {/* Watermark */}
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.03, pointerEvents: 'none' }}>
            <Text style={{ fontSize: 48, fontWeight: '900', color: '#111827', transform: [{ rotate: '45deg' }], borderWidth: 6, borderColor: '#111827', paddingHorizontal: 12 }}>ORIGINAL</Text>
          </View>
        </View>

        <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', lineHeight: 18 }}>
          O arquivo PDF gerado contém certificado digital de autenticidade FashionWay.
        </Text>
      </ScrollView>

      {/* Footer actions */}
      <View style={{
        backgroundColor: `${C.dark}CC`,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        gap: 12,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
      }}>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: C.primary, borderRadius: 18, paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
          }}
        >
          <Ionicons name="download-outline" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>Salvar PDF</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/vip/compartilhar' as any)}
            style={{
              flex: 1, backgroundColor: '#1F2937', borderRadius: 14, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Ionicons name="share-outline" size={18} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '700' }}>Compartilhar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Imprimir', 'Enviando para impressora...')}
            style={{
              flex: 1, backgroundColor: '#1F2937', borderRadius: 14, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Ionicons name="print-outline" size={18} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '700' }}>Imprimir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

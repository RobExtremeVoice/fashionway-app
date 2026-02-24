import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { AddressForm, StepBar } from '../../components/AddressForm'
import { Breadcrumb } from '../../components/ui/Breadcrumb'

export default function ColetaOrigemScreen() {
  const setOrigin  = useColetaStore((s) => s.setOrigin)
  const [loading, setLoading] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          style={{ marginBottom: 16, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: '#93C5FD', fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>📍</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Local de Coleta</Text>
            <Text style={{ color: '#93C5FD', fontSize: 13, marginTop: 2 }}>De onde vamos buscar?</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <StepBar current={0} />
        <Breadcrumb
          items={[
            { label: 'Início', onPress: () => router.replace('/(loja)/home') },
            { label: 'Coleta' },
            { label: 'Origem' },
          ]}
        />

        <AddressForm
          submitLabel="Continuar → Destino"
          submitting={loading}
          contactPlaceholder="Nome de quem vai entregar ao motoboy"
          onSubmit={(data) => {
            setLoading(true)
            setOrigin(data)
            router.push('/coleta/destino')
            setLoading(false)
          }}
        />
      </ScrollView>
    </View>
  )
}

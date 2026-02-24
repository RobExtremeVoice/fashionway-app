import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { AddressForm, StepBar } from '../../components/AddressForm'
import { Breadcrumb } from '../../components/ui/Breadcrumb'

export default function ColetaDestinoScreen() {
  const setDestination = useColetaStore((s) => s.setDestination)
  const fetchQuotes    = useColetaStore((s) => s.fetchQuotes)
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
          accessibilityLabel="Voltar para a origem da coleta"
          style={{ marginBottom: 16, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: '#93C5FD', fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>🏁</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Local de Entrega</Text>
            <Text style={{ color: '#93C5FD', fontSize: 13, marginTop: 2 }}>Para onde vamos levar?</Text>
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
        <StepBar current={1} />
        <Breadcrumb
          items={[
            { label: 'Início', onPress: () => router.replace('/(loja)/home') },
            { label: 'Coleta', onPress: () => router.back() },
            { label: 'Destino' },
          ]}
        />

        <AddressForm
          submitLabel="Continuar → Serviço"
          submitting={loading}
          contactPlaceholder="Nome de quem vai receber"
          onSubmit={async (data) => {
            setLoading(true)
            try {
              setDestination(data)
              await fetchQuotes()
              router.push('/coleta/servico')
            } catch {
              Alert.alert('Erro', 'Não foi possível calcular a cotação')
            } finally {
              setLoading(false)
            }
          }}
        />
      </ScrollView>
    </View>
  )
}

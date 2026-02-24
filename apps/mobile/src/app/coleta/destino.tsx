import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { api } from '../../services/api'
import { formatCEP } from '@fashionway/shared'

const STEPS = ['Origem', 'Destino', 'Serviço', 'Pagamento']

function StepBar({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 0, marginBottom: 28, alignItems: 'center' }}>
      {STEPS.map((step, i) => (
        <View key={step} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {i > 0 && (
              <View style={{ flex: 1, height: 2, backgroundColor: i <= current ? '#1D4ED8' : '#E5E7EB' }} />
            )}
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: i <= current ? '#1D4ED8' : '#E5E7EB',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: i === current ? 3 : 0, borderColor: '#93C5FD',
            }}>
              <Text style={{ color: i <= current ? '#fff' : '#9CA3AF', fontSize: 11, fontWeight: '700' }}>
                {i < current ? '✓' : String(i + 1)}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{ flex: 1, height: 2, backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB' }} />
            )}
          </View>
          <Text style={{ fontSize: 10, fontWeight: '600', color: i <= current ? '#1D4ED8' : '#9CA3AF', textAlign: 'center' }}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  )
}

function Field({ label, value, onChangeText, placeholder, keyboardType, maxLength, autoCapitalize }: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder?: string; keyboardType?: any; maxLength?: number; autoCapitalize?: any
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{label}</Text>
      <View style={{
        backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
        borderRadius: 14, paddingHorizontal: 14,
      }}>
        <TextInput
          style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
          placeholder={placeholder} placeholderTextColor="#9CA3AF"
          value={value} onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'default'}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? 'sentences'}
        />
      </View>
    </View>
  )
}

export default function ColetaDestinoScreen() {
  const setDestination = useColetaStore((s) => s.setDestination)
  const fetchQuotes    = useColetaStore((s) => s.fetchQuotes)

  const [cep, setCep]                     = useState('')
  const [logradouro, setLogradouro]       = useState('')
  const [numero, setNumero]               = useState('')
  const [complemento, setComplemento]     = useState('')
  const [bairro, setBairro]               = useState('')
  const [cidade, setCidade]               = useState('')
  const [estado, setEstado]               = useState('')
  const [pessoaContato, setPessoaContato] = useState('')
  const [loading, setLoading]             = useState(false)
  const [cepLoading, setCepLoading]       = useState(false)

  async function handleCepChange(value: string) {
    const masked = formatCEP(value)
    setCep(masked)

    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 8) {
      setCepLoading(true)
      try {
        const { data } = await api.get(`/addresses/cep/${cleaned}`)
        setLogradouro(data.logradouro)
        setBairro(data.bairro)
        setCidade(data.localidade)
        setEstado(data.uf)
      } catch {
        Alert.alert('CEP não encontrado', 'Verifique o CEP e tente novamente')
      } finally {
        setCepLoading(false)
      }
    }
  }

  async function handleContinuar() {
    if (!cep || !logradouro || !numero || !cidade) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/addresses/geocode', {
        logradouro, numero, bairro, cidade, estado, cep,
      })

      setDestination({
        cep: cep.replace(/\D/g, ''),
        logradouro, numero, complemento,
        bairro, cidade, estado, pessoaContato,
        lat: data.lat, lng: data.lng,
      })

      await fetchQuotes()
      router.push('/coleta/servico')
    } catch {
      Alert.alert('Erro', 'Não foi possível obter as coordenadas do endereço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
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
      >
        <StepBar current={1} />

        {/* CEP */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>CEP *</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
            borderRadius: 14, paddingHorizontal: 14,
          }}>
            <Text style={{ fontSize: 17, marginRight: 10 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
              placeholder="00000-000" placeholderTextColor="#9CA3AF"
              value={cep} onChangeText={handleCepChange}
              keyboardType="numeric" maxLength={9}
            />
            {cepLoading && <ActivityIndicator size="small" color="#1D4ED8" />}
          </View>
        </View>

        <Field label="Logradouro *" value={logradouro} onChangeText={setLogradouro}
          placeholder="Rua, Avenida, etc." />

        {/* Número + Complemento */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Número *</Text>
            <View style={{
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <TextInput
                style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
                placeholder="123" placeholderTextColor="#9CA3AF"
                value={numero} onChangeText={setNumero} keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Complemento</Text>
            <View style={{
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <TextInput
                style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
                placeholder="Apto, Sala..." placeholderTextColor="#9CA3AF"
                value={complemento} onChangeText={setComplemento}
              />
            </View>
          </View>
        </View>

        <Field label="Bairro" value={bairro} onChangeText={setBairro} placeholder="Bairro" />

        {/* Cidade + UF */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Cidade</Text>
            <View style={{
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <TextInput
                style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
                placeholder="São Paulo" placeholderTextColor="#9CA3AF"
                value={cidade} onChangeText={setCidade}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>UF</Text>
            <View style={{
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <TextInput
                style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
                placeholder="SP" placeholderTextColor="#9CA3AF"
                value={estado} onChangeText={setEstado}
                maxLength={2} autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Pessoa de Contato */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Pessoa de Contato
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
            borderRadius: 14, paddingHorizontal: 14,
          }}>
            <Text style={{ fontSize: 17, marginRight: 10 }}>👤</Text>
            <TextInput
              style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
              placeholder="Nome de quem vai receber"
              placeholderTextColor="#9CA3AF"
              value={pessoaContato} onChangeText={setPessoaContato}
            />
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleContinuar} disabled={loading}
          style={{
            backgroundColor: loading ? '#93C5FD' : '#1D4ED8',
            borderRadius: 16, paddingVertical: 17, alignItems: 'center',
            shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
                Continuar → Serviço
              </Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

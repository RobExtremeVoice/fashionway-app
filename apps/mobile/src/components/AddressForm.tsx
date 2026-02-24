import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { api } from '../services/api'
import { formatCEP } from '@fashionway/shared'

export interface AddressData {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  pessoaContato: string
  lat: number
  lng: number
}

interface Suggestion {
  label: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  lat: number
  lng: number
}

interface Props {
  onSubmit: (data: AddressData) => void
  submitLabel: string
  submitting: boolean
  contactPlaceholder?: string
}

const STEPS = ['Origem', 'Destino', 'Serviço', 'Pagamento']

export function StepBar({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 0, marginBottom: 28, alignItems: 'center' }}>
      {STEPS.map((step, i) => (
        <View key={step} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {i > 0 && <View style={{ flex: 1, height: 2, backgroundColor: i <= current ? '#1D4ED8' : '#E5E7EB' }} />}
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
            {i < STEPS.length - 1 && <View style={{ flex: 1, height: 2, backgroundColor: i < current ? '#1D4ED8' : '#E5E7EB' }} />}
          </View>
          <Text style={{ fontSize: 10, fontWeight: '600', color: i <= current ? '#1D4ED8' : '#9CA3AF', textAlign: 'center' }}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function AddressForm({ onSubmit, submitLabel, submitting, contactPlaceholder }: Props) {
  const [cep, setCep]                     = useState('')
  const [logradouro, setLogradouro]       = useState('')
  const [numero, setNumero]               = useState('')
  const [complemento, setComplemento]     = useState('')
  const [bairro, setBairro]               = useState('')
  const [cidade, setCidade]               = useState('')
  const [estado, setEstado]               = useState('')
  const [pessoaContato, setPessoaContato] = useState('')
  const [cepLoading, setCepLoading]       = useState(false)
  const [suggestions, setSuggestions]     = useState<Suggestion[]>([])
  const [showSugg, setShowSugg]           = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Geocoded coords (filled by CEP lookup or suggestion selection)
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── CEP auto-fill ──────────────────────────────────────────────
  async function handleCepChange(value: string) {
    const masked = formatCEP(value)
    setCep(masked)

    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 8) {
      setCepLoading(true)
      try {
        const { data } = await api.get(`/addresses/cep/${cleaned}`)
        setLogradouro(data.logradouro ?? '')
        setBairro(data.bairro ?? '')
        setCidade(data.localidade ?? '')
        setEstado(data.uf ?? '')
        setSuggestions([])
        setShowSugg(false)
      } catch {
        Alert.alert('CEP não encontrado', 'Verifique o CEP e tente novamente')
      } finally {
        setCepLoading(false)
      }
    }
  }

  // ── Logradouro autocomplete ─────────────────────────────────────
  function handleLogradouroChange(text: string) {
    setLogradouro(text)
    setShowSugg(false)

    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (text.length < 4) {
      setSuggestions([])
      return
    }

    searchTimer.current = setTimeout(async () => {
      const q = cidade ? `${text}, ${cidade}, Brasil` : `${text}, Brasil`
      setSearchLoading(true)
      try {
        const { data } = await api.get('/addresses/search', { params: { q } })
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data)
          setShowSugg(true)
        } else {
          setSuggestions([])
          setShowSugg(false)
        }
      } catch {
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    }, 500)
  }

  function selectSuggestion(s: Suggestion) {
    setLogradouro(s.logradouro || s.label)
    if (s.bairro)  setBairro(s.bairro)
    if (s.cidade)  setCidade(s.cidade)
    if (s.estado)  setEstado(s.estado)
    if (s.cep)     setCep(formatCEP(s.cep))
    setLat(s.lat)
    setLng(s.lng)
    setSuggestions([])
    setShowSugg(false)
  }

  // ── Submit ──────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!logradouro || !numero || !cidade) {
      Alert.alert('Atenção', 'Preencha ao menos logradouro, número e cidade')
      return
    }

    let finalLat = lat
    let finalLng = lng

    // Se não temos coordenadas ainda, geocodifica agora
    if (!finalLat && !finalLng) {
      try {
        const { data } = await api.post('/addresses/geocode', {
          logradouro, numero, bairro, cidade, estado,
          cep: cep.replace(/\D/g, ''),
        })
        finalLat = data.lat
        finalLng = data.lng
      } catch {
        Alert.alert('Erro', 'Não foi possível obter as coordenadas do endereço')
        return
      }
    }

    onSubmit({
      cep: cep.replace(/\D/g, ''),
      logradouro, numero, complemento,
      bairro, cidade, estado, pessoaContato,
      lat: finalLat, lng: finalLng,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ── CEP ── */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>CEP</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
          borderRadius: 14, paddingHorizontal: 14,
        }}>
          <Text style={{ fontSize: 17, marginRight: 10 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
            placeholder="00000-000  →  preenche endereço automático"
            placeholderTextColor="#9CA3AF"
            value={cep} onChangeText={handleCepChange}
            keyboardType="numeric" maxLength={9}
          />
          {cepLoading && <ActivityIndicator size="small" color="#1D4ED8" />}
          {!cepLoading && cep.replace(/\D/g, '').length === 8 && (
            <Text style={{ fontSize: 16 }}>✅</Text>
          )}
        </View>
      </View>

      {/* ── Logradouro com autocomplete ── */}
      <View style={{ marginBottom: 14, zIndex: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
          Logradouro *
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#F9FAFB', borderWidth: 1.5,
          borderColor: showSugg ? '#1D4ED8' : '#E5E7EB',
          borderRadius: showSugg ? 14 : 14,
          borderBottomLeftRadius: showSugg ? 0 : 14,
          borderBottomRightRadius: showSugg ? 0 : 14,
          paddingHorizontal: 14,
        }}>
          <TextInput
            style={{ flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' }}
            placeholder="Rua, Avenida... (4+ letras para buscar)"
            placeholderTextColor="#9CA3AF"
            value={logradouro}
            onChangeText={handleLogradouroChange}
          />
          {searchLoading
            ? <ActivityIndicator size="small" color="#1D4ED8" />
            : logradouro.length >= 4
              ? <Text style={{ fontSize: 14, color: '#9CA3AF' }}>🏠</Text>
              : null
          }
        </View>

        {/* Suggestions dropdown */}
        {showSugg && suggestions.length > 0 && (
          <View style={{
            position: 'absolute', top: 49, left: 0, right: 0,
            backgroundColor: '#fff',
            borderWidth: 1.5, borderTopWidth: 0, borderColor: '#1D4ED8',
            borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
            zIndex: 999,
            shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
            overflow: 'hidden',
          }}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectSuggestion(s)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#F3F4F6',
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                <Text style={{ fontSize: 16 }}>📍</Text>
                <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 }} numberOfLines={2}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowSugg(false)}
              style={{
                paddingHorizontal: 14, paddingVertical: 10,
                backgroundColor: '#F9FAFB', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Fechar sugestões</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Número + Complemento ── */}
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

      {/* ── Bairro ── */}
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Bairro</Text>
        <View style={{
          backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
          borderRadius: 14, paddingHorizontal: 14,
        }}>
          <TextInput
            style={{ paddingVertical: 13, fontSize: 15, color: '#111827' }}
            placeholder="Bairro" placeholderTextColor="#9CA3AF"
            value={bairro} onChangeText={setBairro}
          />
        </View>
      </View>

      {/* ── Cidade + UF ── */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
        <View style={{ flex: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Cidade *</Text>
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

      {/* ── Pessoa de contato ── */}
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
            placeholder={contactPlaceholder ?? 'Nome para contato'}
            placeholderTextColor="#9CA3AF"
            value={pessoaContato} onChangeText={setPessoaContato}
          />
        </View>
      </View>

      {/* ── CTA ── */}
      <TouchableOpacity
        onPress={handleSubmit} disabled={submitting}
        style={{
          backgroundColor: submitting ? '#93C5FD' : '#1D4ED8',
          borderRadius: 16, paddingVertical: 17, alignItems: 'center',
          shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
        }}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
              {submitLabel}
            </Text>
        }
      </TouchableOpacity>
    </View>
  )
}

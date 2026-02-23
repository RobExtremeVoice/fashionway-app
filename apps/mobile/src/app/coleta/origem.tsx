import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { api } from '../../services/api'
import { formatCEP } from '@fashionway/shared'

export default function ColetaOrigemScreen() {
  const setOrigin = useColetaStore((s) => s.setOrigin)

  const [cep, setCep]             = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero]       = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro]       = useState('')
  const [cidade, setCidade]       = useState('')
  const [estado, setEstado]       = useState('')
  const [pessoaContato, setPessoaContato] = useState('')
  const [loading, setLoading]     = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  // Busca CEP via ViaCEP (através do backend)
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
      // Geocodifica o endereço para obter lat/lng
      const { data } = await api.post('/addresses/geocode', {
        logradouro, numero, bairro, cidade, estado, cep,
      })

      setOrigin({
        cep: cep.replace(/\D/g, ''),
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        pessoaContato,
        lat: data.lat,
        lng: data.lng,
      })

      router.push('/coleta/destino')
    } catch {
      Alert.alert('Erro', 'Não foi possível obter as coordenadas do endereço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="bg-blue-700 px-5 pt-14 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-blue-200">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Local de Coleta</Text>
        <Text className="text-blue-200 text-sm">De onde vamos buscar?</Text>
      </View>

      <View className="px-5 pt-6">
        {/* Progresso */}
        <View className="flex-row gap-2 mb-6">
          {['Origem', 'Destino', 'Serviço', 'Pagamento'].map((step, i) => (
            <View key={step} className="flex-1 items-center">
              <View className={`h-1.5 rounded-full w-full ${i === 0 ? 'bg-blue-700' : 'bg-gray-200'}`} />
              <Text className={`text-[10px] mt-1 ${i === 0 ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* CEP */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1 font-medium">CEP *</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              placeholder="00000-000"
              value={cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={9}
            />
            {cepLoading && (
              <View className="absolute right-4 top-3.5">
                <ActivityIndicator size="small" color="#1D4ED8" />
              </View>
            )}
          </View>
        </View>

        {/* Logradouro */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1 font-medium">Logradouro *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
            placeholder="Rua, Avenida, etc."
            value={logradouro}
            onChangeText={setLogradouro}
          />
        </View>

        {/* Número + Complemento */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1 font-medium">Número *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              placeholder="123"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1 font-medium">Complemento</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              placeholder="Apto, Sala..."
              value={complemento}
              onChangeText={setComplemento}
            />
          </View>
        </View>

        {/* Bairro */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1 font-medium">Bairro</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
            placeholder="Bairro"
            value={bairro}
            onChangeText={setBairro}
          />
        </View>

        {/* Cidade + Estado */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-[2]">
            <Text className="text-sm text-gray-600 mb-1 font-medium">Cidade</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              value={cidade}
              onChangeText={setCidade}
              placeholder="São Paulo"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1 font-medium">UF</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              value={estado}
              onChangeText={setEstado}
              placeholder="SP"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Pessoa de contato */}
        <View className="mb-6">
          <Text className="text-sm text-gray-600 mb-1 font-medium">Pessoa de Contato</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
            placeholder="Nome de quem vai entregar ao motoboy"
            value={pessoaContato}
            onChangeText={setPessoaContato}
          />
        </View>

        {/* Botão continuar */}
        <TouchableOpacity
          className="bg-blue-700 rounded-xl py-4 items-center mb-10"
          onPress={handleContinuar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-semibold text-base">Continuar → Destino</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

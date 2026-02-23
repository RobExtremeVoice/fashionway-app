import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import type { Role } from '@fashionway/shared'

const ROLES: { label: string; value: Role; icon: string }[] = [
  { label: 'Loja / Fábrica', value: 'LOJA',          icon: '🏪' },
  { label: 'Intermediário',   value: 'INTERMEDIARIO',  icon: '🤝' },
  { label: 'Motoboy',         value: 'MOTOBOY',        icon: '🏍️' },
  { label: 'Transportadora',  value: 'TRANSPORTADORA', icon: '🚚' },
]

export default function RegisterScreen() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]       = useState<Role>('LOJA')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)

  async function handleRegister() {
    if (!name || !email || !phone || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos')
      return
    }
    setLoading(true)
    try {
      await register({ name, email, phone, password, role })
      // Redireciona por role
      if (role === 'MOTOBOY') router.replace('/(motoboy)/home')
      else router.replace('/(loja)/home')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao cadastrar'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
      <View className="mb-8 mt-8">
        <Text className="text-3xl font-bold text-blue-700">Criar conta</Text>
        <Text className="text-gray-500 mt-1">FashionWay</Text>
      </View>

      {/* Seleção de role */}
      <Text className="text-sm font-medium text-gray-600 mb-2">Tipo de conta</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.value}
            onPress={() => setRole(r.value)}
            className={`px-4 py-2 rounded-full border flex-row items-center gap-1 ${
              role === r.value
                ? 'bg-blue-700 border-blue-700'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Text>{r.icon}</Text>
            <Text className={role === r.value ? 'text-white font-medium' : 'text-gray-700'}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Campos */}
      {[
        { label: 'Nome / Empresa', value: name,     setter: setName,     placeholder: 'Seu nome ou empresa' },
        { label: 'E-mail',         value: email,    setter: setEmail,    placeholder: 'seu@email.com',         type: 'email-address' },
        { label: 'Telefone',       value: phone,    setter: setPhone,    placeholder: '(11) 99999-9999',       type: 'phone-pad' },
        { label: 'Senha',          value: password, setter: setPassword, placeholder: 'Mínimo 6 caracteres',   secure: true },
      ].map((field) => (
        <View key={field.label} className="mb-4">
          <Text className="text-sm text-gray-600 mb-1 font-medium">{field.label}</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
            placeholder={field.placeholder}
            value={field.value}
            onChangeText={field.setter}
            keyboardType={(field.type as any) ?? 'default'}
            secureTextEntry={field.secure}
            autoCapitalize="none"
          />
        </View>
      ))}

      <TouchableOpacity
        className="bg-blue-700 rounded-xl py-4 mt-4 items-center"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text className="text-white font-semibold text-base">Criar conta</Text>
        }
      </TouchableOpacity>

      <View className="flex-row justify-center mt-4 mb-8">
        <Text className="text-gray-500">Já tem conta? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 font-medium">Entrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

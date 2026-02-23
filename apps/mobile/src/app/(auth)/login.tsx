import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      router.replace('/(loja)/home')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao fazer login'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-4xl font-bold text-blue-700">FashionWay</Text>
          <Text className="text-gray-500 mt-1">Entre na sua conta</Text>
        </View>

        {/* Inputs */}
        <View className="gap-4">
          <View>
            <Text className="text-sm text-gray-600 mb-1 font-medium">E-mail</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="text-sm text-gray-600 mb-1 font-medium">Senha</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Esqueci senha */}
        <TouchableOpacity className="mt-3 self-end" onPress={() => router.push('/(auth)/forgot-password')}>
          <Text className="text-blue-600 text-sm">Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Botão login */}
        <TouchableOpacity
          className="bg-blue-700 rounded-xl py-4 mt-8 items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-semibold text-base">Entrar</Text>
          }
        </TouchableOpacity>

        {/* Cadastro */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-blue-600 font-medium">Cadastrar-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

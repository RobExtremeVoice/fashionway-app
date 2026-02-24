import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const login = useAuthStore((s) => s.login)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'E-mail ou senha incorretos'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* ── HERO ── */}
        <View style={{
          backgroundColor: '#1D4ED8',
          paddingTop: 72, paddingBottom: 44, paddingHorizontal: 28,
          borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        }}>
          <View style={{
            width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}>
            <Text style={{ fontSize: 34 }}>👗</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -1 }}>FashionWay</Text>
          <Text style={{ color: '#93C5FD', fontSize: 15, marginTop: 6 }}>Logística inteligente para a moda</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            {[['1.200+', 'Lojas'], ['98%', 'No prazo'], ['5 ⭐', 'Avaliação']].map(([val, lbl]) => (
              <View key={lbl} style={{
                backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 9, alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{val}</Text>
                <Text style={{ color: '#BFDBFE', fontSize: 11, marginTop: 1 }}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FORM ── */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>Bem-vindo de volta</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 28 }}>Entre na sua conta para continuar</Text>

          {/* Email */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>E-mail</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <Text style={{ fontSize: 17, marginRight: 10 }}>📧</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' }}
                placeholder="seu@email.com" placeholderTextColor="#9CA3AF"
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
              />
            </View>
          </View>

          {/* Senha */}
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Senha</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <Text style={{ fontSize: 17, marginRight: 10 }}>🔒</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' }}
                placeholder="Sua senha" placeholderTextColor="#9CA3AF"
                value={password} onChangeText={setPassword} secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 28, padding: 4 }}>
            <Text style={{ color: '#1D4ED8', fontSize: 13, fontWeight: '600' }}>Esqueci a senha</Text>
          </TouchableOpacity>

          {/* CTA principal */}
          <TouchableOpacity
            onPress={handleLogin} disabled={loading}
            style={{
              backgroundColor: loading ? '#93C5FD' : '#1D4ED8',
              borderRadius: 16, paddingVertical: 17, alignItems: 'center',
              shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>Entrar →</Text>
            }
          </TouchableOpacity>

          {/* Divisor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
            <Text style={{ color: '#9CA3AF', paddingHorizontal: 14, fontSize: 13 }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
          </View>

          {/* Cadastro */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{
              borderWidth: 1.5, borderColor: '#1D4ED8',
              borderRadius: 16, paddingVertical: 17, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#1D4ED8', fontSize: 16, fontWeight: '700' }}>Criar nova conta</Text>
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 24, lineHeight: 18, marginBottom: 36 }}>
            Ao entrar, você concorda com nossos{'\n'}
            <Text style={{ color: '#1D4ED8' }}>Termos de Uso</Text>
            {' '}e{' '}
            <Text style={{ color: '#1D4ED8' }}>Política de Privacidade</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

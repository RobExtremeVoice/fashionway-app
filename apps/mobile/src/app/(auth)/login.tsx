import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
  ScrollView, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { Button } from '../../components/ui/Button'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const login = useAuthStore((s) => s.login)

  async function handleLogin() {
    const nextErrors: { email?: string; password?: string } = {}
    if (!email.trim()) nextErrors.email = 'E-mail é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = 'Informe um e-mail válido'
    if (!password) nextErrors.password = 'Senha é obrigatória'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

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

  const inputShell = (hasError?: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: hasError ? '#EF4444' : '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 54,
  })

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F172A' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ position: 'absolute', top: 80, right: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(59,130,246,0.35)' }} />
        <View style={{ position: 'absolute', top: 260, left: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(16,185,129,0.2)' }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 70, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.replace('/')} accessibilityLabel="Voltar para início" style={{ marginBottom: 18 }}>
            <Text style={{ color: '#BFDBFE', fontSize: 14, fontWeight: '700' }}>← Início</Text>
          </TouchableOpacity>

          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>FW</Text>
          </View>

          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 18 }}>Entrar</Text>
          <Text style={{ color: '#BFDBFE', fontSize: 15, marginTop: 8 }}>Acesse sua conta e continue seu fluxo de entregas.</Text>
        </View>

        <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 32 }}>
          <Text style={{ color: '#0F172A', fontSize: 21, fontWeight: '800' }}>Bem-vindo de volta</Text>
          <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4, marginBottom: 20 }}>Design mais limpo, campos maiores e leitura confortável.</Text>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>E-mail</Text>
            <View style={inputShell(Boolean(errors.email))}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>✉️</Text>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#111827', paddingVertical: 14 }}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Campo de e-mail"
              />
            </View>
            {errors.email && <Text style={{ color: '#EF4444', marginTop: 6, fontSize: 12 }}>{errors.email}</Text>}
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>Senha</Text>
            <View style={inputShell(Boolean(errors.password))}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>🔐</Text>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#111827', paddingVertical: 14 }}
                placeholder="Sua senha"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                accessibilityLabel="Campo de senha"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={{ color: '#EF4444', marginTop: 6, fontSize: 12 }}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Em breve', 'Recuperação de senha será disponibilizada em breve')}
            accessibilityRole="button"
            accessibilityLabel="Recuperar senha"
            style={{ alignSelf: 'flex-end', marginBottom: 20, padding: 4 }}
          >
            <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '700' }}>Esqueci a senha</Text>
          </TouchableOpacity>

          <Button onPress={handleLogin} disabled={loading} loading={loading} label="Entrar agora" accessibilityLabel="Entrar na conta" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text style={{ color: '#9CA3AF', paddingHorizontal: 12, fontSize: 12 }}>OU</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          <Button label="Criar nova conta" variant="secondary" onPress={() => router.push('/(auth)/register')} accessibilityLabel="Ir para criação de conta" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

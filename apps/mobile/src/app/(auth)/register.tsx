import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import type { Role } from '@fashionway/shared'
import { Button } from '../../components/ui/Button'

const ROLES: { label: string; value: Role; icon: string; desc: string; color: string }[] = [
  { label: 'Loja', value: 'LOJA', icon: '🏪', desc: 'Envie produtos com agilidade', color: '#1D4ED8' },
  { label: 'Intermediário', value: 'INTERMEDIARIO', icon: '🤝', desc: 'Gerencie múltiplos clientes', color: '#7C3AED' },
  { label: 'Motoboy', value: 'MOTOBOY', icon: '🏍️', desc: 'Receba corridas em tempo real', color: '#059669' },
  { label: 'Transportadora', value: 'TRANSPORTADORA', icon: '🚚', desc: 'Rotas e volume elevado', color: '#D97706' },
]

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('LOJA')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string }>({})
  const register = useAuthStore((s) => s.register)

  const selected = ROLES.find((r) => r.value === role)!

  function formatPhoneBR(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  async function handleRegister() {
    const normalizedPhone = formatPhoneBR(phone)
    const phoneDigits = normalizedPhone.replace(/\D/g, '')

    const nextErrors: { name?: string; email?: string; phone?: string; password?: string } = {}
    if (!name.trim()) nextErrors.name = 'Nome é obrigatório'
    if (!email.trim()) nextErrors.email = 'E-mail é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = 'Informe um e-mail válido'
    if (!phoneDigits) nextErrors.phone = 'Telefone é obrigatório'
    else if (phoneDigits.length < 10) nextErrors.phone = 'Telefone inválido'
    if (!password) nextErrors.password = 'Senha é obrigatória'
    else if (password.length < 6) nextErrors.password = 'Mínimo 6 caracteres'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), phone: normalizedPhone, password, role })
      if (role === 'MOTOBOY') router.replace('/(motoboy)/home')
      else router.replace('/(loja)/home')
    } catch (err: any) {
      const payloadMessage = err?.response?.data?.message
      const msg = Array.isArray(payloadMessage)
        ? payloadMessage.join('\n')
        : payloadMessage ?? 'Erro ao cadastrar'
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
    <ScrollView style={{ flex: 1, backgroundColor: '#0F172A' }} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={{ position: 'absolute', top: 60, left: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(59,130,246,0.35)' }} />
      <View style={{ position: 'absolute', top: 250, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(139,92,246,0.26)' }} />

      <View style={{ paddingHorizontal: 24, paddingTop: 70, paddingBottom: 22 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#BFDBFE', fontSize: 14, fontWeight: '700' }}>← Voltar</Text>
        </TouchableOpacity>

        <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: selected.color, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>FW</Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 16 }}>Criar conta</Text>
        <Text style={{ color: '#BFDBFE', fontSize: 15, marginTop: 8 }}>Visual premium com onboarding direto para operação.</Text>
      </View>

      <View style={{ backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 42 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Escolha seu perfil
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          {ROLES.map((r) => {
            const active = role === r.value
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={{
                  width: '47%',
                  backgroundColor: active ? r.color : '#FFFFFF',
                  borderWidth: 2,
                  borderColor: active ? r.color : '#E5E7EB',
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <Text style={{ fontSize: 23, marginBottom: 7 }}>{r.icon}</Text>
                <Text style={{ fontWeight: '800', fontSize: 13, color: active ? '#fff' : '#111827' }}>{r.label}</Text>
                <Text style={{ fontSize: 11, marginTop: 3, color: active ? 'rgba(255,255,255,0.85)' : '#6B7280' }}>{r.desc}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={{ fontSize: 12, fontWeight: '800', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Suas informações
        </Text>

        {[
          { key: 'name', label: 'Nome / Empresa', icon: '👤', value: name, setter: setName, ph: 'Seu nome ou empresa' },
          { key: 'email', label: 'E-mail', icon: '✉️', value: email, setter: setEmail, ph: 'seu@email.com', kb: 'email-address' },
          { key: 'phone', label: 'Telefone', icon: '📱', value: phone, setter: setPhone, ph: '(11) 99999-9999', kb: 'phone-pad' },
        ].map((f) => (
          <View key={f.label} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>{f.label}</Text>
            <View style={inputShell(Boolean(errors[f.key as keyof typeof errors]))}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>{f.icon}</Text>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#111827', paddingVertical: 14 }}
                placeholder={f.ph}
                placeholderTextColor="#9CA3AF"
                value={f.value}
                onChangeText={(value) => {
                  if (f.key === 'phone') {
                    setPhone(formatPhoneBR(value))
                    return
                  }
                  f.setter(value)
                }}
                keyboardType={(f.kb as any) ?? 'default'}
                autoCapitalize="none"
                accessibilityLabel={`Campo ${f.label}`}
              />
            </View>
            {errors[f.key as keyof typeof errors] && (
              <Text style={{ color: '#EF4444', marginTop: 6, fontSize: 12 }}>
                {errors[f.key as keyof typeof errors]}
              </Text>
            )}
          </View>
        ))}

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }}>Senha</Text>
          <View style={inputShell(Boolean(errors.password))}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>🔐</Text>
            <TextInput
              style={{ flex: 1, fontSize: 16, color: '#111827', paddingVertical: 14 }}
              placeholder="Mínimo 6 caracteres"
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

        <Button
          onPress={handleRegister}
          disabled={loading}
          loading={loading}
          label={`Criar conta ${selected.icon}`}
          accessibilityLabel="Criar conta"
          style={{ backgroundColor: selected.color, borderColor: selected.color }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text style={{ color: '#6B7280' }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#1D4ED8', fontWeight: '800' }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import type { Role } from '@fashionway/shared'
import { Button } from '../../components/ui/Button'

const PRIMARY = '#059669'
const BG_LIGHT = '#F5F8F7'
const CARD_BORDER = '#E2E8F0'
const TEXT_MUTED = '#64748B'

const ROLES: { label: string; value: Role; icon: string; desc: string }[] = [
  { label: 'Loja', value: 'LOJA', icon: '🏬', desc: 'Envie produtos com agilidade' },
  { label: 'Intermediário', value: 'INTERMEDIARIO', icon: '🤝', desc: 'Gerencie múltiplos clientes' },
  { label: 'Motoboy', value: 'MOTOBOY', icon: '🏍️', desc: 'Receba corridas em tempo real' },
  { label: 'Transportadora', value: 'TRANSPORTADORA', icon: '🚚', desc: 'Rotas e volume elevado' },
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

  const inputShell = (hasError?: boolean, focused?: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderWidth: focused ? 2 : 1.5,
    borderColor: hasError ? '#EF4444' : focused ? PRIMARY : CARD_BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG_LIGHT }} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" backgroundColor={BG_LIGHT} />
      <View style={{ maxWidth: 420, width: '100%', alignSelf: 'center', minHeight: '100%', paddingBottom: 36 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 26, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#64748B', fontSize: 22, fontWeight: '600' }}>←</Text>
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: '800',
              color: TEXT_MUTED,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              paddingRight: 40,
            }}
          >
            Escolha seu perfil
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginBottom: 30 }}>
            {ROLES.map((r) => {
              const active = role === r.value
              return (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={{
                    width: '48.5%',
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: active ? PRIMARY : CARD_BORDER,
                    backgroundColor: active ? PRIMARY : '#FFFFFF',
                    shadowColor: active ? PRIMARY : '#000000',
                    shadowOpacity: active ? 0.18 : 0.04,
                    shadowRadius: active ? 8 : 3,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: active ? 3 : 0,
                  }}
                >
                  <Text style={{ fontSize: 27, marginBottom: 8 }}>{r.icon}</Text>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: active ? '#FFFFFF' : '#0F172A' }}>{r.label}</Text>
                  <Text style={{ fontSize: 12, marginTop: 4, color: active ? '#D1FAE5' : TEXT_MUTED, lineHeight: 16 }}>
                    {r.desc}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={{ gap: 18 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: TEXT_MUTED, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Suas Informações
            </Text>

            {[
              { key: 'name', icon: '👤', value: name, setter: setName, ph: 'Seu nome ou empresa' },
              { key: 'email', icon: '✉️', value: email, setter: setEmail, ph: 'seu@email.com', kb: 'email-address' },
              { key: 'phone', icon: '📱', value: phone, setter: setPhone, ph: '(11) 99999-9999', kb: 'phone-pad' },
            ].map((f) => (
              <View key={f.key}>
                <View style={inputShell(Boolean(errors[f.key as keyof typeof errors]), focusedField === f.key)}>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{f.icon}</Text>
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: '#0F172A', paddingVertical: 15 }}
                    placeholder={f.ph}
                    placeholderTextColor="#94A3B8"
                    value={f.value}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField((prev) => (prev === f.key ? null : prev))}
                    onChangeText={(value) => {
                      if (f.key === 'phone') {
                        setPhone(formatPhoneBR(value))
                        return
                      }
                      f.setter(value)
                    }}
                    keyboardType={(f.kb as any) ?? 'default'}
                    autoCapitalize="none"
                    accessibilityLabel={`Campo ${f.key}`}
                  />
                </View>
                {errors[f.key as keyof typeof errors] && (
                  <Text style={{ color: '#EF4444', marginTop: 6, fontSize: 12 }}>
                    {errors[f.key as keyof typeof errors]}
                  </Text>
                )}
              </View>
            ))}

            <View>
              <View style={inputShell(Boolean(errors.password), focusedField === 'password')}>
                <Text style={{ fontSize: 18, marginRight: 10 }}>🔒</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: '#0F172A', paddingVertical: 15 }}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField((prev) => (prev === 'password' ? null : prev))}
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
          </View>

          <View style={{ marginTop: 28, gap: 18 }}>
            <Button
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              label="Criar conta 🚀"
              accessibilityLabel="Criar conta"
              style={{ backgroundColor: PRIMARY, borderColor: PRIMARY, borderRadius: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: TEXT_MUTED }}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: PRIMARY, fontWeight: '800' }}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import type { Role } from '@fashionway/shared'

const ROLES: { label: string; value: Role; icon: string; desc: string; color: string }[] = [
  { label: 'Loja / Fábrica',  value: 'LOJA',          icon: '🏪', desc: 'Envie produtos com agilidade', color: '#1D4ED8' },
  { label: 'Intermediário',   value: 'INTERMEDIARIO',  icon: '🤝', desc: 'Gerencie múltiplos clientes',  color: '#7C3AED' },
  { label: 'Motoboy',         value: 'MOTOBOY',        icon: '🏍️', desc: 'Faça entregas e ganhe mais',   color: '#059669' },
  { label: 'Transportadora',  value: 'TRANSPORTADORA', icon: '🚚', desc: 'Grandes volumes e rotas fixas', color: '#D97706' },
]

export default function RegisterScreen() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<Role>('LOJA')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const register = useAuthStore((s) => s.register)

  const selected = ROLES.find((r) => r.value === role)!

  async function handleRegister() {
    if (!name || !email || !phone || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos')
      return
    }
    if (password.length < 6) {
      Alert.alert('Senha fraca', 'Mínimo 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await register({ name, email, phone, password, role })
      if (role === 'MOTOBOY') router.replace('/(motoboy)/home')
      else router.replace('/(loja)/home')
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* Header */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#93C5FD', fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>Criar conta</Text>
        <Text style={{ color: '#93C5FD', fontSize: 14, marginTop: 4 }}>
          Junte-se à plataforma líder de moda
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 }}>

        {/* Role cards */}
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Selecione seu perfil
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {ROLES.map((r) => {
            const active = role === r.value
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={{
                  width: '47%',
                  backgroundColor: active ? r.color : '#F9FAFB',
                  borderWidth: 2, borderColor: active ? r.color : '#E5E7EB',
                  borderRadius: 16, padding: 16,
                  shadowColor: active ? r.color : '#000',
                  shadowOffset: { width: 0, height: active ? 6 : 1 },
                  shadowOpacity: active ? 0.3 : 0.04,
                  shadowRadius: active ? 10 : 3, elevation: active ? 6 : 1,
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</Text>
                <Text style={{ fontWeight: '700', fontSize: 14, color: active ? '#fff' : '#111827' }}>
                  {r.label}
                </Text>
                <Text style={{ fontSize: 11, marginTop: 3, color: active ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}>
                  {r.desc}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Campos */}
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Suas informações
        </Text>

        {[
          { label: 'Nome / Empresa', icon: '👤', value: name,  setter: setName,  ph: 'Seu nome ou empresa' },
          { label: 'E-mail',         icon: '📧', value: email, setter: setEmail, ph: 'seu@email.com', kb: 'email-address' },
          { label: 'Telefone',       icon: '📱', value: phone, setter: setPhone, ph: '(11) 99999-9999', kb: 'phone-pad' },
        ].map((f) => (
          <View key={f.label} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>{f.label}</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
              borderRadius: 14, paddingHorizontal: 14,
            }}>
              <Text style={{ fontSize: 17, marginRight: 10 }}>{f.icon}</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' }}
                placeholder={f.ph} placeholderTextColor="#9CA3AF"
                value={f.value} onChangeText={f.setter}
                keyboardType={(f.kb as any) ?? 'default'} autoCapitalize="none"
              />
            </View>
          </View>
        ))}

        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Senha</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
            borderRadius: 14, paddingHorizontal: 14,
          }}>
            <Text style={{ fontSize: 17, marginRight: 10 }}>🔒</Text>
            <TextInput
              style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827' }}
              placeholder="Mínimo 6 caracteres" placeholderTextColor="#9CA3AF"
              value={password} onChangeText={setPassword} secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão */}
        <TouchableOpacity
          onPress={handleRegister} disabled={loading}
          style={{
            backgroundColor: loading ? '#9CA3AF' : selected.color,
            borderRadius: 16, paddingVertical: 17, alignItems: 'center',
            shadowColor: selected.color, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                Criar conta {selected.icon}
              </Text>
          }
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
          <Text style={{ color: '#6B7280' }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

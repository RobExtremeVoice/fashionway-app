import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Alert,
} from 'react-native'
import { useAuthStore } from '../../store/auth.store'

interface MenuItem {
  icon: string
  label: string
  desc?: string
  badge?: string
  badgeColor?: string
  onPress: () => void
}

function Section({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: '#fff', borderRadius: 18,
        overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0',
      }}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingHorizontal: 18, paddingVertical: 16,
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#F1F5F9',
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>{item.label}</Text>
              {item.desc && (
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{item.desc}</Text>
              )}
            </View>
            {item.badge && (
              <View style={{
                backgroundColor: item.badgeColor ?? '#E5E7EB',
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{item.badge}</Text>
              </View>
            )}
            <Text style={{ color: '#CBD5E1', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default function MotoboyMenuScreen() {
  const { user, logout } = useAuthStore()

  const profile = (user as any)?.motoboyProfile
  const name    = profile?.nomeCompleto ?? user?.email?.split('@')[0] ?? 'Motoboy'

  const comingSoon = (feature: string) =>
    Alert.alert('Em breve', `${feature} estará disponível em uma próxima versão.`)

  const manageItems: MenuItem[] = [
    {
      icon: '🏍️', label: 'Meus veículos', desc: profile?.tipoVeiculo ?? 'Gerenciar veículo cadastrado',
      onPress: () => comingSoon('Gerenciamento de veículos'),
    },
    {
      icon: '📄', label: 'Documentos', desc: 'CNH, CRLV, Antecedentes',
      onPress: () => comingSoon('Upload de documentos'),
    },
    {
      icon: '🏦', label: 'Dados bancários', desc: 'Conta para recebimento de pagamentos',
      onPress: () => comingSoon('Dados bancários'),
    },
  ]

  const accountItems: MenuItem[] = [
    {
      icon: '⭐', label: 'Avaliações', desc: `Nota média: ${profile?.ratingMedia?.toFixed(1) ?? '—'}`,
      onPress: () => comingSoon('Avaliações'),
    },
    {
      icon: '🔔', label: 'Notificações', desc: 'Configurar alertas',
      onPress: () => comingSoon('Notificações'),
    },
    {
      icon: '🔒', label: 'Segurança', desc: 'Senha, 2FA',
      onPress: () => comingSoon('Segurança'),
    },
    {
      icon: '📋', label: 'Termos de uso',
      onPress: () => comingSoon('Termos de uso'),
    },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header / Profile card */}
      <View style={{
        backgroundColor: '#111827',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(16,185,129,0.25)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <View style={{
            width: 68, height: 68, borderRadius: 22,
            backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#6EE7B7', fontSize: 12, fontWeight: '700' }}>MOTOBOY</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
              {user?.email}
            </Text>
          </View>

          <View style={{
            backgroundColor: '#059669', borderRadius: 12,
            paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
              {profile?.ratingMedia?.toFixed(1) ?? '—'}
            </Text>
            <Text style={{ color: '#A7F3D0', fontSize: 9, fontWeight: '700' }}>NOTA</Text>
          </View>
        </View>

        <View style={{
          flexDirection: 'row', gap: 0, marginTop: 18,
          backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14,
        }}>
          {[
            { val: profile?.totalColetas ?? 0, lbl: 'Entregas' },
            { val: profile?.cidadeAtuacao ?? '—', lbl: 'Cidade' },
            { val: profile?.tipoVeiculo ?? '—', lbl: 'Veículo' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.15)' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }} numberOfLines={1}>{String(s.val)}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 2 }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="GERENCIAR" items={manageItems} />
        <Section title="CONTA" items={accountItems} />

        {/* Logout */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Sair', 'Tem certeza que deseja sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout },
            ])
          }
          style={{
            backgroundColor: '#FEF2F2', borderRadius: 16,
            paddingVertical: 16, alignItems: 'center',
            borderWidth: 1, borderColor: '#FECACA',
          }}
        >
          <Text style={{ color: '#DC2626', fontSize: 16, fontWeight: '700' }}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

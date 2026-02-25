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
  locked?: boolean
  onPress: () => void
}

function Section({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 12, fontWeight: '700', color: '#94A3B8',
        letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4,
      }}>
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
            activeOpacity={item.locked ? 1 : 0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingHorizontal: 18, paddingVertical: 16,
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#F1F5F9',
              opacity: item.locked ? 0.6 : 1,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: item.locked ? '#F1F5F9' : '#F8FAFC',
              alignItems: 'center', justifyContent: 'center',
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
            {!item.locked && <Text style={{ color: '#CBD5E1', fontSize: 18 }}>›</Text>}
            {item.locked && <Text style={{ fontSize: 16 }}>🔒</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default function LojaMenuScreen() {
  const { user, logout } = useAuthStore()

  const isIntermed   = !!(user as any)?.intermediarioProfile
  const lojaProfile  = (user as any)?.lojaProfile
  const interProfile = (user as any)?.intermediarioProfile
  const profileName  = lojaProfile?.nomeEmpresa ?? interProfile?.nomeEmpresa ?? user?.email?.split('@')[0] ?? 'Empresa'
  const role         = user?.role

  const comingSoon = (f: string) => Alert.alert('Em breve', `${f} estará disponível em breve.`)

  const faturamentoAtivo = !!(lojaProfile?.faturadoConfig?.ativo || interProfile?.faturadoConfig?.ativo)

  const manageItems: MenuItem[] = [
    ...(isIntermed ? [{
      icon: '⭐', label: 'Motoboys VIP',
      desc: 'Gerencie seus motoboys preferidos',
      onPress: () => comingSoon('Motoboys VIP'),
    }] : []),
    {
      icon: '📄', label: 'Documentos',
      desc: 'CNPJ, contratos e certificados',
      onPress: () => comingSoon('Documentos'),
    },
    {
      icon: '🏦', label: 'Dados bancários',
      desc: 'Conta para pagamentos e reembolsos',
      onPress: () => comingSoon('Dados bancários'),
    },
    {
      icon: '🧾', label: 'Faturamento',
      desc: faturamentoAtivo
        ? 'Limite de crédito ativo'
        : 'Aprovação pendente pelo FashionWay',
      badge: faturamentoAtivo ? 'ATIVO' : 'PENDENTE FW',
      badgeColor: faturamentoAtivo ? '#059669' : '#D97706',
      locked: !faturamentoAtivo,
      onPress: () => {
        if (!faturamentoAtivo) {
          Alert.alert(
            'Faturamento bloqueado',
            'Esta área precisa ser aprovada pelo FashionWay. Entre em contato com o suporte para solicitar a liberação.',
          )
        } else {
          comingSoon('Faturamento')
        }
      },
    },
  ]

  const accountItems: MenuItem[] = [
    {
      icon: '⭐', label: 'Avaliações', desc: 'Feedbacks recebidos dos motoboys',
      onPress: () => comingSoon('Avaliações'),
    },
    {
      icon: '🔔', label: 'Notificações', desc: 'Configurar alertas de coleta',
      onPress: () => comingSoon('Notificações'),
    },
    {
      icon: '🔒', label: 'Segurança', desc: 'Senha e autenticação',
      onPress: () => comingSoon('Segurança'),
    },
    {
      icon: '📋', label: 'Termos de uso',
      onPress: () => comingSoon('Termos de uso'),
    },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={{
        backgroundColor: '#0F172A',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(59,130,246,0.25)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <View style={{
            width: 68, height: 68, borderRadius: 22,
            backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>
              {profileName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#93C5FD', fontSize: 12, fontWeight: '700' }}>
              {role === 'INTERMEDIARIO' ? 'INTERMEDIÁRIO' : role === 'FABRICA' ? 'FÁBRICA' : 'LOJA'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
              {profileName}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="GERENCIAR" items={manageItems} />
        <Section title="CONTA" items={accountItems} />

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

import { useEffect } from 'react'
import { View, Text, ScrollView, StatusBar, RefreshControl, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { Button } from '../../components/ui/Button'
import { CardButton } from '../../components/ui/CardButton'
import { colors } from '../../theme/tokens'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NOVA: { label: 'Nova', color: '#1D4ED8', bg: '#EFF6FF' },
  PENDENTE: { label: 'Pendente', color: '#D97706', bg: '#FFFBEB' },
  ACEITA: { label: 'Aceita', color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho', color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO: { label: 'Coletado', color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO: { label: 'Em trânsito', color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE: { label: 'Entregue', color: '#16A34A', bg: '#F0FDF4' },
  CANCELADA: { label: 'Cancelada', color: '#DC2626', bg: '#FEF2F2' },
}

const QUICK_ACTIONS = [
  { icon: '⚡', label: 'Expressa', color: '#EFF6FF', border: '#BFDBFE' },
  { icon: '📦', label: 'Padrão', color: '#F5F3FF', border: '#DDD6FE' },
  { icon: '📅', label: 'Agendar', color: '#ECFDF5', border: '#A7F3D0' },
  { icon: '📋', label: 'Histórico', color: '#FFFBEB', border: '#FDE68A' },
]

export default function LojaHomeScreen() {
  const { user, logout } = useAuthStore()
  const { activeColetas, pastColetas, fetchActiveColetas, fetchPastColetas, isLoading } = useColetaStore()

  useEffect(() => {
    fetchActiveColetas()
    fetchPastColetas()
  }, [])

  const profileName =
    (user as any)?.lojaProfile?.nomeEmpresa ??
    (user as any)?.intermediarioProfile?.nomeEmpresa ??
    user?.email?.split('@')[0] ??
    'Usuário'

  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View
        style={{
          backgroundColor: '#0F172A',
          paddingTop: 56,
          paddingBottom: 30,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: -70, right: -70, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(59,130,246,0.35)' }} />
        <View style={{ position: 'absolute', bottom: -75, left: -75, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(16,185,129,0.25)' }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#93C5FD', fontSize: 13, fontWeight: '600' }}>{greeting}</Text>
            <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
              {profileName}
            </Text>
            <Text style={{ color: '#BFDBFE', fontSize: 13, marginTop: 4 }}>Painel premium de operações</Text>
          </View>

          <CardButton
            onPress={logout}
            accessibilityLabel="Sair da conta"
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderRadius: 14,
              padding: 10,
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </CardButton>
        </View>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 18,
            padding: 16,
            marginTop: 20,
            gap: 0,
          }}
        >
          {[
            { val: activeColetas.length.toString(), lbl: 'Em andamento' },
            { val: pastColetas.filter((c) => c.status === 'ENTREGUE').length.toString(), lbl: 'Entregues hoje' },
            { val: `R$ ${(activeColetas.reduce((s, c) => s + (c.valorFrete ?? 0), 0) / 100).toFixed(0)}`, lbl: 'Volume' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{s.val}</Text>
              <Text style={{ color: '#BFDBFE', fontSize: 11, marginTop: 2, textAlign: 'center' }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchActiveColetas} tintColor={colors.primary700} />}
      >
        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <CardButton
            onPress={() => router.push('/coleta/origem')}
            accessibilityLabel="Criar nova coleta"
            style={{
              backgroundColor: '#111827',
              borderRadius: 22,
              padding: 22,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ width: 54, height: 54, backgroundColor: '#2563EB', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ fontSize: 25 }}>✦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Nova Coleta</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 3 }}>Fluxo redesenhado para velocidade e clareza</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22 }}>→</Text>
          </CardButton>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Atalhos</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {QUICK_ACTIONS.map((a) => (
              <CardButton
                key={a.label}
                onPress={() => {
                  if (a.label.includes('Histórico')) {
                    Alert.alert('Em breve', 'Histórico detalhado estará disponível em breve')
                    return
                  }
                  router.push('/coleta/origem')
                }}
                accessibilityLabel={`Ação rápida ${a.label}`}
                style={{
                  flex: 1,
                  backgroundColor: a.color,
                  borderWidth: 1.5,
                  borderColor: a.border,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', textAlign: 'center' }}>{a.label}</Text>
              </CardButton>
            ))}
          </View>
        </View>

        {activeColetas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Em andamento</Text>
            {activeColetas.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.NOVA
              return (
                <View
                  key={c.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    padding: 18,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 }}>#{c.trackingCode}</Text>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 4 }} numberOfLines={1}>
                        → {(c as any).destinationAddress?.cidade ?? 'Destino'}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: cfg.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '800' }}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Text style={{ color: '#64748B', fontSize: 13 }}>{(c as any).serviceTier ?? 'PADRÃO'}</Text>
                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '900' }}>{formatBRL(c.valorFrete ?? 0)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {pastColetas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Últimas entregas</Text>
            {pastColetas.slice(0, 3).map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#DCFCE7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 20 }}>✓</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>#{c.trackingCode}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Entregue</Text>
                </View>
                <Button label="Repetir" size="sm" variant="secondary" fullWidth={false} accessibilityLabel="Repetir coleta" onPress={() => router.push('/coleta/origem')} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

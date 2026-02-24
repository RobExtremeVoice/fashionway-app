import { useState, useEffect } from 'react'
import {
  View, Text, Switch,
  ScrollView, Alert, StatusBar, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { CardButton } from '../../components/ui/CardButton'
import { colors } from '../../theme/tokens'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACEITA: { label: 'Aceita', color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho', color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO: { label: 'Coletado', color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO: { label: 'Em trânsito', color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE: { label: 'Entregue', color: '#16A34A', bg: '#F0FDF4' },
}

export default function MotoboyHomeScreen() {
  const { user, logout } = useAuthStore()
  const { activeColetas, fetchActiveColetas, isLoading } = useColetaStore()
  const [online, setOnline] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [dismissedColetas, setDismissedColetas] = useState<string[]>([])

  useEffect(() => {
    fetchActiveColetas()
    api
      .get('/motoboys/me')
      .then(({ data }) => {
        setOnline(data.onlineStatus ?? false)
      })
      .catch(() => {})
  }, [])

  async function toggleOnline(value: boolean) {
    setToggling(true)
    try {
      await api.patch('/motoboys/status', { online: value })
      setOnline(value)
      if (value) fetchActiveColetas()
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar seu status')
    } finally {
      setToggling(false)
    }
  }

  const firstName =
    (user as any)?.motoboyProfile?.nomeCompleto?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Motoboy'

  const disponiveis = activeColetas.filter(
    (c) => c.status === 'NOVA' && !(c as any).motoboyId && !dismissedColetas.includes(c.id),
  )
  const minhas = activeColetas.filter((c) => (c as any).motoboyId === user?.id)

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View
        style={{
          backgroundColor: '#111827',
          paddingTop: 56,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(16,185,129,0.35)' }} />
        <View style={{ position: 'absolute', bottom: -90, left: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(59,130,246,0.28)' }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: online ? '#6EE7B7' : '#9CA3AF', fontSize: 13, fontWeight: '600' }}>
              {online ? 'Status: Online' : 'Status: Offline'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 2 }}>Olá, {firstName}</Text>
            <Text style={{ color: '#BFDBFE', fontSize: 13, marginTop: 4 }}>Dashboard de corridas em tempo real</Text>
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

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 16, marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{online ? 'Aceitando corridas' : 'Ative para receber corridas'}</Text>
            <Text style={{ color: online ? '#6EE7B7' : '#9CA3AF', fontSize: 12, marginTop: 3 }}>
              {online
                ? `${disponiveis.length} coleta${disponiveis.length !== 1 ? 's' : ''} disponível na sua região`
                : 'Você está invisível para clientes agora'}
            </Text>
          </View>
          <Switch
            value={online}
            onValueChange={toggleOnline}
            disabled={toggling}
            trackColor={{ false: '#374151', true: '#34D399' }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }] }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchActiveColetas} tintColor={online ? colors.success : '#111827'} />}
      >
        {minhas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Em andamento</Text>
            {minhas.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? { label: c.status, color: '#334155', bg: '#E2E8F0' }
              return (
                <CardButton
                  key={c.id}
                  onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                  accessibilityLabel={`Ver detalhes da coleta ${c.trackingCode}`}
                  style={{ backgroundColor: '#0F172A', borderRadius: 20, padding: 18, marginBottom: 12 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>#{c.trackingCode}</Text>
                      <View style={{ backgroundColor: cfg.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' }}>
                        <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{formatBRL((c as any).valorRepasse ?? 0)}</Text>
                  </View>

                  <View style={{ marginTop: 14, gap: 4 }}>
                    <Text style={{ color: '#BFDBFE', fontSize: 13 }} numberOfLines={1}>📍 {(c as any).originAddress?.logradouro}, {(c as any).originAddress?.numero}</Text>
                    <Text style={{ color: '#93C5FD', fontSize: 13 }} numberOfLines={1}>🏁 {(c as any).destinationAddress?.logradouro}, {(c as any).destinationAddress?.numero}</Text>
                  </View>
                </CardButton>
              )
            })}
          </View>
        )}

        {online && (
          <View style={{ paddingHorizontal: 24, marginTop: minhas.length > 0 ? 8 : 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 }}>
              Disponíveis perto de você
            </Text>

            {disponiveis.length === 0 ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontSize: 46, marginBottom: 12 }}>🔎</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>Aguardando novas coletas</Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
                  Você receberá notificação assim que aparecer uma coleta.
                </Text>
              </View>
            ) : (
              disponiveis.map((c) => (
                <View key={c.id} style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 }}>#{c.trackingCode}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                        {(c as any).distanciaKm?.toFixed(1)} km • {(c as any).serviceTier ?? 'PADRÃO'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: '#059669' }}>{formatBRL((c as any).valorRepasse ?? 0)}</Text>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>seu repasse</Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 12, gap: 6 }}>
                    <Text style={{ color: '#334155', fontSize: 13 }} numberOfLines={1}>📍 {(c as any).originAddress?.logradouro}, {(c as any).originAddress?.numero}</Text>
                    <Text style={{ color: '#334155', fontSize: 13 }} numberOfLines={1}>🏁 {(c as any).destinationAddress?.logradouro}, {(c as any).destinationAddress?.numero}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Recusar"
                        variant="secondary"
                        accessibilityLabel={`Recusar corrida ${c.trackingCode}`}
                        onPress={() => setDismissedColetas((prev) => [...prev, c.id])}
                      />
                    </View>
                    <View style={{ flex: 2 }}>
                      <Button
                        style={{ backgroundColor: colors.success, borderColor: colors.success }}
                        onPress={async () => {
                          try {
                            await api.patch(`/coletas/${c.id}/status`, { status: 'ACEITA' })
                            fetchActiveColetas()
                          } catch {
                            Alert.alert('Erro', 'Não foi possível aceitar a coleta')
                          }
                        }}
                        label="Aceitar corrida"
                        accessibilityLabel={`Aceitar corrida ${c.trackingCode}`}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {!online && minhas.length === 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>🌙</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>Você está offline</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
                Ative seu status para começar a receber corridas.
              </Text>
              <Button
                onPress={() => toggleOnline(true)}
                style={{ backgroundColor: colors.success, borderColor: colors.success, marginTop: 24, paddingHorizontal: 36 }}
                label="Ficar Online"
                fullWidth={false}
                accessibilityLabel="Ativar status online"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

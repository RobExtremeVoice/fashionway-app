import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, Switch,
  ScrollView, Alert, StatusBar, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACEITA:         { label: 'Aceita',      color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho',   color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO:       { label: 'Coletado',    color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO:    { label: 'Em trânsito', color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE:       { label: 'Entregue',    color: '#16A34A', bg: '#F0FDF4' },
}

export default function MotoboyHomeScreen() {
  const { user, logout }    = useAuthStore()
  const { activeColetas, fetchActiveColetas, isLoading } = useColetaStore()
  const [online, setOnline]     = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchActiveColetas()
    api.get('/motoboys/me').then(({ data }) => {
      setOnline(data.onlineStatus ?? false)
    }).catch(() => {})
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

  const firstName = (user as any)?.motoboyProfile?.nomeCompleto?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'Motoboy'

  const disponiveis = activeColetas.filter((c) => c.status === 'NOVA' && !(c as any).motoboyId)
  const minhas      = activeColetas.filter((c) => (c as any).motoboyId === user?.id)

  const headerBg = online ? '#059669' : '#1F2937'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: headerBg,
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: online ? '#A7F3D0' : '#9CA3AF', fontSize: 13 }}>
              {online ? '🟢 Online agora' : '⚫ Você está offline'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
              Olá, {firstName} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12, padding: 10,
          }}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Online toggle card */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: 18, padding: 16, marginTop: 20,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              {online ? 'Aceitando corridas' : 'Ativar para receber corridas'}
            </Text>
            <Text style={{ color: online ? '#A7F3D0' : '#9CA3AF', fontSize: 12, marginTop: 3 }}>
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
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
        </View>

        {/* Stats bar */}
        <View style={{
          flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 16, padding: 16, marginTop: 14, gap: 0,
        }}>
          {[
            { val: minhas.length.toString(), lbl: 'Em andamento' },
            { val: '3',                      lbl: 'Hoje' },
            { val: formatBRL(18900),          lbl: 'Ganhos hoje' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, alignItems: 'center',
              borderRightWidth: i < 2 ? 1 : 0,
              borderRightColor: 'rgba(255,255,255,0.2)',
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{s.val}</Text>
              <Text style={{ color: online ? '#A7F3D0' : '#9CA3AF', fontSize: 11, marginTop: 2 }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchActiveColetas} tintColor={headerBg} />
        }
      >
        {/* ── MINHAS COLETAS ── */}
        {minhas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
              Em andamento
            </Text>
            {minhas.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? { label: c.status, color: '#374151', bg: '#F3F4F6' }
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                  style={{
                    backgroundColor: '#1D4ED8', borderRadius: 20,
                    padding: 18, marginBottom: 12,
                    shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ color: '#BFDBFE', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                        #{c.trackingCode}
                      </Text>
                      <View style={{
                        backgroundColor: cfg.bg, borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
                        alignSelf: 'flex-start',
                      }}>
                        <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
                      {formatBRL((c as any).valorRepasse ?? 0)}
                    </Text>
                  </View>

                  <View style={{ marginTop: 14, gap: 4 }}>
                    <Text style={{ color: '#BFDBFE', fontSize: 13 }} numberOfLines={1}>
                      📍 {(c as any).originAddress?.logradouro}, {(c as any).originAddress?.numero}
                    </Text>
                    <Text style={{ color: '#93C5FD', fontSize: 13 }} numberOfLines={1}>
                      🏁 {(c as any).destinationAddress?.logradouro}, {(c as any).destinationAddress?.numero}
                    </Text>
                  </View>

                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
                    paddingHorizontal: 14, paddingVertical: 8, marginTop: 14,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                      Ver detalhes →
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* ── COLETAS DISPONÍVEIS ── */}
        {online && (
          <View style={{ paddingHorizontal: 24, marginTop: minhas.length > 0 ? 8 : 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                Disponíveis perto de você
              </Text>
              <View style={{
                backgroundColor: '#ECFDF5', borderRadius: 20,
                paddingHorizontal: 10, paddingVertical: 4,
              }}>
                <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700' }}>{disponiveis.length}</Text>
              </View>
            </View>

            {disponiveis.length === 0 ? (
              <View style={{
                backgroundColor: '#fff', borderRadius: 20, padding: 32,
                alignItems: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
              }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                  Aguardando novas coletas
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
                  Você receberá uma notificação assim que uma coleta aparecer na sua região
                </Text>
              </View>
            ) : (
              disponiveis.map((c) => (
                <View key={c.id} style={{
                  backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 }}>
                        #{c.trackingCode}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                        {(c as any).distanciaKm?.toFixed(1)} km • {(c as any).serviceTier ?? 'PADRÃO'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: '#059669' }}>
                        {formatBRL((c as any).valorRepasse ?? 0)}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#6B7280' }}>seu repasse</Text>
                    </View>
                  </View>

                  <View style={{
                    backgroundColor: '#F8FAFC', borderRadius: 12,
                    padding: 12, marginTop: 12, gap: 6,
                  }}>
                    <Text style={{ color: '#374151', fontSize: 13 }} numberOfLines={1}>
                      📍 {(c as any).originAddress?.logradouro}, {(c as any).originAddress?.numero}
                    </Text>
                    <View style={{ width: 1, height: 8, backgroundColor: '#D1D5DB', marginLeft: 8 }} />
                    <Text style={{ color: '#374151', fontSize: 13 }} numberOfLines={1}>
                      🏁 {(c as any).destinationAddress?.logradouro}, {(c as any).destinationAddress?.numero}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity style={{
                      flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB',
                      borderRadius: 14, paddingVertical: 12, alignItems: 'center',
                    }}>
                      <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 2, backgroundColor: '#059669',
                        borderRadius: 14, paddingVertical: 12, alignItems: 'center',
                        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
                      }}
                      onPress={async () => {
                        try {
                          await api.patch(`/coletas/${c.id}/status`, { status: 'ACEITA' })
                          fetchActiveColetas()
                        } catch {
                          Alert.alert('Erro', 'Não foi possível aceitar a coleta')
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓ Aceitar corrida</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── OFFLINE STATE ── */}
        {!online && minhas.length === 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 24, padding: 40,
              alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
            }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>😴</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>
                Você está offline
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
                Ative seu status para começar a receber corridas e ganhar mais
              </Text>
              <TouchableOpacity
                onPress={() => toggleOnline(true)}
                style={{
                  backgroundColor: '#059669',
                  borderRadius: 16, paddingVertical: 14, paddingHorizontal: 36,
                  marginTop: 24,
                  shadowColor: '#059669', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  🟢 Ficar Online
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

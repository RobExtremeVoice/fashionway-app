import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, Alert, StatusBar,
  RefreshControl, Animated, Easing, TouchableOpacity, Switch,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { CardButton } from '../../components/ui/CardButton'
import { colors } from '../../theme/tokens'

const C = {
  primary: '#089161',
  dark:    '#111827',
  surface: '#F5F8F7',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#64748B',
  border:  '#E2E8F0',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACEITA:         { label: 'Aceita',      color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho',   color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO:       { label: 'Coletado',    color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO:    { label: 'Em trânsito', color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE:       { label: 'Entregue',    color: '#16A34A', bg: '#F0FDF4' },
}

const TIER_LABEL: Record<string, string> = {
  URGENTE:  'Urgente',
  PADRAO:   'Padrão',
  AGENDADO: 'Agendado',
}

const COUNTDOWN_SECONDS = 15

export default function MotoboyHomeScreen() {
  const { user, logout } = useAuthStore()
  const { activeColetas, fetchActiveColetas, isLoading } = useColetaStore()

  const [online,       setOnline]       = useState(false)
  const [toggling,     setToggling]     = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [acceptingId,  setAcceptingId]  = useState<string | null>(null)
  const [todayStats,   setTodayStats]   = useState({ ganhos: 0, coletas: 0 })

  const countdownAnim    = useRef(new Animated.Value(1)).current
  const countdownRef     = useRef<Animated.CompositeAnimation | null>(null)
  const currentCardIdRef = useRef<string | null>(null)

  const profile   = (user as any)?.motoboyProfile
  const firstName = profile?.nomeCompleto?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Motoboy'
  const rating    = profile?.ratingMedia?.toFixed(1) ?? '—'

  useEffect(() => {
    fetchActiveColetas()
    api.get('/motoboys/me').then(({ data }) => setOnline(data.onlineStatus ?? false)).catch(() => {})
    api.get('/motoboys/receitas').then(({ data }) => {
      const hoje = new Date().toISOString().slice(0, 10)
      const hojeColetas = (data as any[]).filter((c: any) => c.dataColeta?.slice(0, 10) === hoje)
      setTodayStats({
        ganhos:  hojeColetas.reduce((s: number, c: any) => s + (c.valorRepasse ?? 0), 0),
        coletas: hojeColetas.length,
      })
    }).catch(() => {})
  }, [])

  const disponiveis  = activeColetas.filter((c) => c.status === 'NOVA' && !(c as any).motoboyId && !dismissedIds.has(c.id))
  const minhas       = activeColetas.filter((c) => (c as any).motoboyId === user?.id)
  const currentCard  = online ? disponiveis[0] ?? null : null

  useEffect(() => {
    countdownRef.current?.stop()
    if (!currentCard) { countdownAnim.setValue(1); return }
    if (currentCardIdRef.current === currentCard.id) return
    currentCardIdRef.current = currentCard.id
    countdownAnim.setValue(1)
    countdownRef.current = Animated.timing(countdownAnim, {
      toValue: 0, duration: COUNTDOWN_SECONDS * 1000,
      easing: Easing.linear, useNativeDriver: false,
    })
    countdownRef.current.start(({ finished }) => { if (finished) dismissCard(currentCard.id) })
    return () => countdownRef.current?.stop()
  }, [currentCard?.id, online])

  function dismissCard(id: string) { currentCardIdRef.current = null; setDismissedIds((prev) => new Set([...prev, id])) }

  async function toggleOnline(value: boolean) {
    setToggling(true)
    try { await api.patch('/motoboys/status', { online: value }); setOnline(value); if (value) fetchActiveColetas() }
    catch { Alert.alert('Erro', 'Não foi possível alterar seu status') }
    finally { setToggling(false) }
  }

  async function acceptCard(coleta: typeof disponiveis[0]) {
    setAcceptingId(coleta.id)
    try {
      await api.patch(`/coletas/${coleta.id}/status`, { status: 'ACEITA' })
      countdownRef.current?.stop(); currentCardIdRef.current = null; fetchActiveColetas()
    } catch { Alert.alert('Erro', 'Não foi possível aceitar a coleta') }
    finally { setAcceptingId(null) }
  }

  const barColor = countdownAnim.interpolate({ inputRange: [0, 1], outputRange: ['#A7F3D0', '#047857'] })
  const barWidth = countdownAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  const heatPoints = activeColetas
    .filter((c) => c.status === 'NOVA' && !(c as any).motoboyId)
    .map((c) => ({ id: c.id, latitude: (c as any).originAddress?.lat ?? 0, longitude: (c as any).originAddress?.lng ?? 0 }))
    .filter((p) => p.latitude !== 0)

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* ── HEADER ─────────────────────────────────────── */}
      <View style={{
        backgroundColor: C.dark, paddingTop: 54, paddingBottom: 20,
        paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <View style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(8,145,97,0.20)' }} />

        {/* Top row: greeting + notification */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View>
            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500' }}>
              {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {firstName} 👋
            </Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>
              {online ? '● Online · pronto!' : '○ Offline'}
            </Text>
          </View>

          {/* Online toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
              backgroundColor: online ? 'rgba(8,145,97,0.25)' : 'rgba(255,255,255,0.1)',
              borderWidth: 1, borderColor: online ? 'rgba(8,145,97,0.4)' : 'rgba(255,255,255,0.15)',
              flexDirection: 'row', alignItems: 'center', gap: 5,
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: online ? C.primary : '#9CA3AF' }} />
              <Text style={{ color: online ? '#6EE7B7' : '#9CA3AF', fontSize: 11, fontWeight: '700' }}>
                {online ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Switch
              value={online}
              onValueChange={toggleOnline}
              disabled={toggling}
              trackColor={{ false: '#374151', true: C.primary }}
              thumbColor="#fff"
              ios_backgroundColor="#374151"
            />
          </View>
        </View>

        {/* Stats glass card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderRadius: 18, padding: 16,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: C.primary, fontSize: 17, fontWeight: '800' }}>{formatBRL(todayStats.ganhos)}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 }}>HOJE</Text>
          </View>
          <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{todayStats.coletas}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 }}>COLETAS</Text>
          </View>
          <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{rating}</Text>
            <Ionicons name="star" size={13} color="#FBBF24" />
          </View>
        </View>
      </View>

      {/* ── SEARCHING STATE: large map filling the space ─── */}
      {online && !currentCard && minhas.length === 0 && (
        <View style={{ flex: 1 }}>
          {/* Animated scanning bar */}
          <View style={{ height: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <Animated.View style={{ height: 4, backgroundColor: C.primary, width: barWidth }} />
          </View>

          {/* Full-flex map */}
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude:      heatPoints[0]?.latitude  ?? -23.55052,
              longitude:     heatPoints[0]?.longitude ?? -46.63330,
              latitudeDelta:  0.06,
              longitudeDelta: 0.06,
            }}
            scrollEnabled
            zoomEnabled
          >
            {heatPoints.map((p) => (
              <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: `${C.primary}55`,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: C.primary,
                }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary }} />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Status row pinned just above Quick Actions */}
          <View style={{
            backgroundColor: C.white,
            borderTopWidth: 1, borderTopColor: C.border,
            paddingHorizontal: 18, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: '#F0FDF8', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="radio-outline" size={24} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>Buscando Novas Coletas</Text>
              <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Rastreando coletas próximas a você...</Text>
            </View>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />
          </View>
        </View>
      )}

      {/* ── SCROLL CONTENT ──────────────────────────────── */}
      {(!online || !!currentCard || minhas.length > 0) && (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchActiveColetas} tintColor={C.primary} />
        }
      >
        {/* ── Available coleta card ── */}
        {online && currentCard && (
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 1 }}>
                COLETAS DISPONÍVEIS
              </Text>
              {disponiveis.length > 1 && (
                <View style={{ backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{disponiveis.length}</Text>
                </View>
              )}
            </View>

            <View style={{
              backgroundColor: C.white, borderRadius: 20, overflow: 'hidden',
              borderWidth: 1, borderColor: C.border,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
            }}>
              {/* Countdown bar */}
              <View style={{ height: 5, backgroundColor: '#E5E7EB' }}>
                <Animated.View style={{ height: 5, backgroundColor: barColor, width: barWidth }} />
              </View>

              <View style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View>
                    <Text style={{ fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 0.5 }}>SEU REPASSE</Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: C.primary, marginTop: 2 }}>
                      {formatBRL((currentCard as any).valorRepasse ?? 0)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={{ backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: '#047857', fontSize: 13, fontWeight: '700' }}>
                        {(currentCard as any).distanciaKm?.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={{ backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '600' }}>
                        {TIER_LABEL[(currentCard as any).serviceTier] ?? (currentCard as any).serviceTier}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Mini stats */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                  {[
                    { val: String((currentCard as any).quantidadeItens ?? '—'), lbl: 'Qtd' },
                    { val: (currentCard as any).pesoTotalKg != null ? `${(currentCard as any).pesoTotalKg.toFixed(1)} kg` : '—', lbl: 'Peso' },
                    { val: `${(currentCard as any).distanciaKm?.toFixed(1)} km`, lbl: 'Distância' },
                  ].map((s) => (
                    <View key={s.lbl} style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: C.text }}>{s.val}</Text>
                      <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.lbl}</Text>
                    </View>
                  ))}
                </View>

                {/* Addresses */}
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, gap: 8, marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="location" size={14} color={C.primary} />
                    <Text style={{ color: '#334155', fontSize: 13, flex: 1 }} numberOfLines={1}>
                      {(currentCard as any).originAddress?.logradouro}, {(currentCard as any).originAddress?.numero}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="flag" size={14} color="#7C3AED" />
                    <Text style={{ color: '#334155', fontSize: 13, flex: 1 }} numberOfLines={1}>
                      {(currentCard as any).destinationAddress?.logradouro}, {(currentCard as any).destinationAddress?.numero}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => dismissCard(currentCard.id)} activeOpacity={0.8}
                    style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
                  >
                    <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>Recusar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => acceptCard(currentCard)}
                    disabled={acceptingId === currentCard.id} activeOpacity={0.85}
                    style={{
                      flex: 2, height: 48, borderRadius: 14, backgroundColor: C.primary,
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      {acceptingId === currentCard.id ? 'Aceitando...' : 'Aceitar corrida'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* In-progress rides */}
        {minhas.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 10 }}>
              EM ANDAMENTO
            </Text>
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
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
                      {formatBRL((c as any).valorRepasse ?? 0)}
                    </Text>
                  </View>
                  <View style={{ marginTop: 14, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="location" size={13} color="#6EE7B7" />
                      <Text style={{ color: '#BFDBFE', fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {(c as any).originAddress?.logradouro}, {(c as any).originAddress?.numero}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="flag" size={13} color="#A78BFA" />
                      <Text style={{ color: '#93C5FD', fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {(c as any).destinationAddress?.logradouro}, {(c as any).destinationAddress?.numero}
                      </Text>
                    </View>
                  </View>
                </CardButton>
              )
            })}
          </View>
        )}

        {/* Offline empty state */}
        {!online && minhas.length === 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <View style={{
              backgroundColor: C.white, borderRadius: 24, padding: 40,
              alignItems: 'center', borderWidth: 1, borderColor: C.border,
            }}>
              <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="moon-outline" size={36} color="#94A3B8" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: C.text }}>Você está offline</Text>
              <Text style={{ fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
                Ative o toggle acima para começar a receber pedidos.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      )}

      {/* Quick actions — fixed strip just above the tab bar */}
      <View style={{
        backgroundColor: C.white,
        borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: 16, paddingVertical: 10,
        flexDirection: 'row', gap: 10,
      }}>
        {[
          { icon: 'person-outline'   as const, label: 'Minha Conta', bg: '#1E293B', onPress: () => router.push('/(motoboy)/menu') },
          { icon: 'headset-outline'  as const, label: 'Suporte',     bg: '#1D4ED8', onPress: () => Alert.alert('Suporte', 'suporte@fashionway.com.br') },
          { icon: 'time-outline'     as const, label: 'Histórico',   bg: '#D97706', onPress: () => router.push('/(motoboy)/historico') },
          { icon: 'cash-outline'     as const, label: 'Ganhos',      bg: C.primary, onPress: () => router.push('/(motoboy)/receitas') },
        ].map((a) => (
          <TouchableOpacity
            key={a.label} onPress={a.onPress} activeOpacity={0.82}
            style={{ flex: 1, backgroundColor: a.bg, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 6 }}
          >
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={a.icon} size={17} color="#fff" />
            </View>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

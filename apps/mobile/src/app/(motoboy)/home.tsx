import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, Alert, StatusBar,
  RefreshControl, Animated, Easing,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { CardButton } from '../../components/ui/CardButton'
import { colors } from '../../theme/tokens'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACEITA:         { label: 'Aceita',       color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho',    color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO:       { label: 'Coletado',     color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO:    { label: 'Em trânsito',  color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE:       { label: 'Entregue',     color: '#16A34A', bg: '#F0FDF4' },
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

  const [online, setOnline]                   = useState(false)
  const [toggling, setToggling]               = useState(false)
  const [dismissedIds, setDismissedIds]       = useState<Set<string>>(new Set())
  const [acceptingId, setAcceptingId]         = useState<string | null>(null)

  // 15-second countdown animation
  const countdownAnim = useRef(new Animated.Value(1)).current
  const countdownRef  = useRef<Animated.CompositeAnimation | null>(null)
  const currentCardIdRef = useRef<string | null>(null)

  useEffect(() => {
    fetchActiveColetas()
    api.get('/motoboys/me')
      .then(({ data }) => setOnline(data.onlineStatus ?? false))
      .catch(() => {})
  }, [])

  const firstName =
    (user as any)?.motoboyProfile?.nomeCompleto?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Motoboy'

  const disponiveis = activeColetas.filter(
    (c) => c.status === 'NOVA' && !(c as any).motoboyId && !dismissedIds.has(c.id),
  )
  const minhas = activeColetas.filter((c) => (c as any).motoboyId === user?.id)

  // Current single card shown to the motoboy
  const currentCard = online ? disponiveis[0] ?? null : null

  // Reset countdown whenever the current card changes
  useEffect(() => {
    countdownRef.current?.stop()

    if (!currentCard) {
      countdownAnim.setValue(1)
      return
    }

    // Only restart if it's a new card (avoids re-triggering on non-card state changes)
    if (currentCardIdRef.current === currentCard.id) return
    currentCardIdRef.current = currentCard.id

    countdownAnim.setValue(1)
    countdownRef.current = Animated.timing(countdownAnim, {
      toValue:        0,
      duration:       COUNTDOWN_SECONDS * 1000,
      easing:         Easing.linear,
      useNativeDriver: false,
    })
    countdownRef.current.start(({ finished }) => {
      if (finished) dismissCard(currentCard.id)
    })

    return () => countdownRef.current?.stop()
  }, [currentCard?.id, online])

  function dismissCard(id: string) {
    currentCardIdRef.current = null
    setDismissedIds((prev) => new Set([...prev, id]))
  }

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

  async function acceptCard(coleta: typeof disponiveis[0]) {
    setAcceptingId(coleta.id)
    try {
      await api.patch(`/coletas/${coleta.id}/status`, { status: 'ACEITA' })
      countdownRef.current?.stop()
      currentCardIdRef.current = null
      fetchActiveColetas()
    } catch {
      Alert.alert('Erro', 'Não foi possível aceitar a coleta')
    } finally {
      setAcceptingId(null)
    }
  }

  // Color: dark green (#047857) when full, light green (#A7F3D0) when expiring
  const barColor = countdownAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['#A7F3D0', '#047857'],
  })
  const barWidth = countdownAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  })

  // Heatmap points from origin addresses of available coletas
  const heatPoints = activeColetas
    .filter((c) => c.status === 'NOVA' && !(c as any).motoboyId)
    .map((c) => ({
      id:        c.id,
      latitude:  (c as any).originAddress?.lat  ?? 0,
      longitude: (c as any).originAddress?.lng  ?? 0,
    }))
    .filter((p) => p.latitude !== 0)

  const mapRegion = heatPoints.length > 0
    ? {
        latitude:       heatPoints[0].latitude,
        longitude:      heatPoints[0].longitude,
        latitudeDelta:  0.08,
        longitudeDelta: 0.08,
      }
    : {
        latitude:       -23.55,
        longitude:      -46.63,
        latitudeDelta:  0.12,
        longitudeDelta: 0.12,
      }

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* ─── HEADER ──────────────────────────────────────────── */}
      <View style={{
        backgroundColor: '#111827',
        paddingTop: 56, paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(16,185,129,0.35)' }} />
        <View style={{ position: 'absolute', bottom: -90, left: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(59,130,246,0.28)' }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: online ? '#6EE7B7' : '#9CA3AF', fontSize: 13, fontWeight: '600' }}>
              {online ? '● Online' : '○ Offline'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 2 }}>
              Olá, {firstName}
            </Text>
            <Text style={{ color: '#BFDBFE', fontSize: 13, marginTop: 4 }}>
              {online
                ? `${disponiveis.length} coleta${disponiveis.length !== 1 ? 's' : ''} disponível`
                : 'Ative para receber corridas'}
            </Text>
          </View>

          <CardButton
            onPress={logout}
            accessibilityLabel="Sair da conta"
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14,
              padding: 10, minHeight: 44, minWidth: 44,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </CardButton>
        </View>
      </View>

      {/* ─── HEATMAP ─────────────────────────────────────────── */}
      <View style={{ height: 200, marginHorizontal: 0, overflow: 'hidden' }}>
        <MapView
          style={{ flex: 1 }}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          showsUserLocation
        >
          {heatPoints.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: 'rgba(5,150,105,0.55)',
                borderWidth: 2, borderColor: 'rgba(5,150,105,0.9)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' }} />
              </View>
            </Marker>
          ))}
        </MapView>

        {heatPoints.length === 0 && (
          <View style={{
            position: 'absolute', bottom: 8, left: 12,
            backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>Sem coletas próximas no momento</Text>
          </View>
        )}

        <View style={{
          position: 'absolute', top: 8, right: 12,
          backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ color: '#6EE7B7', fontSize: 11, fontWeight: '700' }}>
            🟢 {heatPoints.length} solicitação{heatPoints.length !== 1 ? 'ões' : ''}
          </Text>
        </View>
      </View>

      {/* ─── SCROLL CONTENT ──────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchActiveColetas}
            tintColor={online ? colors.success : '#111827'}
          />
        }
      >
        {/* ── Single ride card (one at a time) ── */}
        {online && currentCard && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 10 }}>
              Nova corrida disponível
            </Text>

            <View style={{
              backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
              borderWidth: 1, borderColor: '#E2E8F0',
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
            }}>
              {/* Countdown progress bar */}
              <View style={{ height: 6, backgroundColor: '#E5E7EB' }}>
                <Animated.View style={{
                  height: 6,
                  backgroundColor: barColor,
                  width: barWidth,
                }} />
              </View>

              <View style={{ padding: 18 }}>
                {/* Value + distance */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View>
                    <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '700', letterSpacing: 0.5 }}>
                      SEU REPASSE
                    </Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#059669', marginTop: 2 }}>
                      {formatBRL((currentCard as any).valorRepasse ?? 0)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={{
                      backgroundColor: '#F0FDF4', borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 4,
                    }}>
                      <Text style={{ color: '#047857', fontSize: 13, fontWeight: '700' }}>
                        {(currentCard as any).distanciaKm?.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: '#EFF6FF', borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 4,
                    }}>
                      <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '600' }}>
                        {TIER_LABEL[(currentCard as any).serviceTier] ?? (currentCard as any).serviceTier}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats row */}
                <View style={{
                  flexDirection: 'row', gap: 8, marginBottom: 14,
                }}>
                  <View style={{
                    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
                    paddingVertical: 10, alignItems: 'center',
                    borderWidth: 1, borderColor: '#E2E8F0',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                      {(currentCard as any).quantidadeItens ?? '—'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Qty</Text>
                  </View>
                  <View style={{
                    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
                    paddingVertical: 10, alignItems: 'center',
                    borderWidth: 1, borderColor: '#E2E8F0',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                      {(currentCard as any).pesoTotalKg != null
                        ? `${(currentCard as any).pesoTotalKg.toFixed(1)} kg`
                        : '—'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>TT Kgs</Text>
                  </View>
                  <View style={{
                    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
                    paddingVertical: 10, alignItems: 'center',
                    borderWidth: 1, borderColor: '#E2E8F0',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                      {(currentCard as any).distanciaKm?.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Total km</Text>
                  </View>
                </View>

                {/* Addresses */}
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, gap: 6, marginBottom: 14 }}>
                  <Text style={{ color: '#334155', fontSize: 13 }} numberOfLines={1}>
                    📍 {(currentCard as any).originAddress?.logradouro}, {(currentCard as any).originAddress?.numero}
                  </Text>
                  <Text style={{ color: '#334155', fontSize: 13 }} numberOfLines={1}>
                    🏁 {(currentCard as any).destinationAddress?.logradouro}, {(currentCard as any).destinationAddress?.numero}
                  </Text>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Recusar"
                      variant="secondary"
                      accessibilityLabel={`Recusar corrida ${currentCard.trackingCode}`}
                      onPress={() => dismissCard(currentCard.id)}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Button
                      style={{ backgroundColor: colors.success, borderColor: colors.success }}
                      label={acceptingId === currentCard.id ? 'Aceitando...' : 'Aceitar corrida'}
                      accessibilityLabel={`Aceitar corrida ${currentCard.trackingCode}`}
                      onPress={() => acceptCard(currentCard)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Queue indicator */}
            {disponiveis.length > 1 && (
              <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                +{disponiveis.length - 1} corrida{disponiveis.length - 1 !== 1 ? 's' : ''} na fila
              </Text>
            )}
          </View>
        )}

        {/* Empty state when online but no cards */}
        {online && !currentCard && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 20, padding: 32,
              alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
            }}>
              <Text style={{ fontSize: 46, marginBottom: 12 }}>🔎</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>Aguardando novas coletas</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
                Você receberá uma notificação assim que aparecer uma coleta.
              </Text>
            </View>
          </View>
        )}

        {/* In-progress rides */}
        {minhas.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 10 }}>Em andamento</Text>
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
                      <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                        #{c.trackingCode}
                      </Text>
                      <View style={{
                        backgroundColor: cfg.bg, borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 3,
                        marginTop: 6, alignSelf: 'flex-start',
                      }}>
                        <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
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
                </CardButton>
              )
            })}
          </View>
        )}

        {/* Offline empty state */}
        {!online && minhas.length === 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <View style={{
              backgroundColor: '#fff', borderRadius: 24, padding: 40,
              alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
            }}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>🌙</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>Você está offline</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
                Toque em "Aceitar Corridas" para começar a receber pedidos.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── FIXED FOOTER BUTTON ─────────────────────────────── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.07, shadowRadius: 12, elevation: 10,
      }}>
        <Button
          onPress={() => toggleOnline(!online)}
          label={toggling ? 'Aguarde...' : online ? '⏸ Pausar corridas' : '▶ Aceitar Corridas'}
          accessibilityLabel={online ? 'Pausar recebimento de corridas' : 'Começar a aceitar corridas'}
          style={{
            backgroundColor: online ? '#374151' : colors.success,
            borderColor:     online ? '#374151' : colors.success,
            paddingHorizontal: 40,
          }}
          fullWidth={false}
        />
      </View>
    </View>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps'
import { router, useLocalSearchParams } from 'expo-router'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/auth.store'
import { formatBRL } from '@fashionway/shared'
import type { Coleta } from '@fashionway/shared'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  NOVA:           { label: 'Nova',          color: '#1D4ED8', bg: '#EFF6FF', icon: '🆕' },
  PENDENTE:       { label: 'Pendente',      color: '#D97706', bg: '#FFFBEB', icon: '⏳' },
  ACEITA:         { label: 'Aceita',        color: '#059669', bg: '#ECFDF5', icon: '✅' },
  EM_ROTA_COLETA: { label: 'A caminho',     color: '#7C3AED', bg: '#F5F3FF', icon: '🏍️' },
  COLETADO:       { label: 'Coletado',      color: '#0891B2', bg: '#ECFEFF', icon: '📦' },
  EM_TRANSITO:    { label: 'Em trânsito',   color: '#EA580C', bg: '#FFF7ED', icon: '🚀' },
  ENTREGUE:       { label: 'Entregue',      color: '#16A34A', bg: '#F0FDF4', icon: '✓' },
  CANCELADA:      { label: 'Cancelada',     color: '#DC2626', bg: '#FEF2F2', icon: '✕' },
  DISPUTA:        { label: 'Em disputa',    color: '#9333EA', bg: '#FAF5FF', icon: '⚖️' },
}

// Status steps in order
const STATUS_STEPS = [
  { key: 'ACEITA',         label: 'Motoboy aceito',       icon: '✅' },
  { key: 'EM_ROTA_COLETA', label: 'A caminho da coleta',  icon: '🏍️' },
  { key: 'COLETADO',       label: 'Produto coletado',     icon: '📦' },
  { key: 'EM_TRANSITO',    label: 'Em trânsito',          icon: '🚀' },
  { key: 'ENTREGUE',       label: 'Entregue',             icon: '✓' },
]

const STATUS_ORDER = ['NOVA', 'PENDENTE', 'ACEITA', 'EM_ROTA_COLETA', 'COLETADO', 'EM_TRANSITO', 'ENTREGUE']

// Motoboy next action map
const MOTOBOY_ACTIONS: Record<string, { label: string; next: string; color: string }> = {
  ACEITA:         { label: '🏍️  Iniciar rota de coleta', next: 'EM_ROTA_COLETA', color: '#7C3AED' },
  EM_ROTA_COLETA: { label: '📦  Confirmar coleta',        next: 'COLETADO',       color: '#0891B2' },
  COLETADO:       { label: '🚀  Iniciar entrega',         next: 'EM_TRANSITO',    color: '#EA580C' },
  EM_TRANSITO:    { label: '✓   Confirmar entrega',       next: 'ENTREGUE',       color: '#16A34A' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAddr(addr: any) {
  if (!addr) return '—'
  return `${addr.logradouro}, ${addr.numero} - ${addr.bairro}, ${addr.cidade}`
}

function statusIndex(status: string) {
  return STATUS_ORDER.indexOf(status)
}

function tierLabel(tier: string) {
  return tier === 'URGENTE' ? '⚡ Urgente' : tier === 'AGENDADO' ? '📅 Agendado' : '📦 Padrão'
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ColetaTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const isMotoboy = user?.role === 'MOTOBOY'

  const [coleta, setColeta]         = useState<Coleta | null>(null)
  const [loading, setLoading]       = useState(true)
  const [updating, setUpdating]     = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchColeta() {
    try {
      const { data } = await api.get(`/coletas/${id}`)
      setColeta(data)
    } catch {
      // silently fail on poll errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColeta()
    pollingRef.current = setInterval(fetchColeta, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [id])

  async function handleStatusUpdate(nextStatus: string) {
    if (!coleta) return
    setUpdating(true)
    try {
      await api.patch(`/coletas/${coleta.id}/status`, { status: nextStatus })
      await fetchColeta()
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status. Tente novamente.')
    } finally {
      setUpdating(false)
    }
  }

  function confirmStatusUpdate(action: { label: string; next: string; color: string }) {
    Alert.alert(
      'Confirmar ação',
      `Deseja confirmar: "${action.label.replace(/^[^\w]+/, '').trim()}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => handleStatusUpdate(action.next) },
      ],
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' }}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Carregando rastreio...</Text>
      </View>
    )
  }

  if (!coleta) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>😕</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Coleta não encontrada</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: '#1D4ED8', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const cfg     = STATUS_CONFIG[coleta.status] ?? { label: coleta.status, color: '#374151', bg: '#E2E8F0', icon: '📋' }
  const action  = isMotoboy ? MOTOBOY_ACTIONS[coleta.status] : null
  const isDone  = coleta.status === 'ENTREGUE' || coleta.status === 'CANCELADA'

  const originLat = (coleta as any).originAddress?.lat
  const originLng = (coleta as any).originAddress?.lng
  const destLat   = (coleta as any).destinationAddress?.lat
  const destLng   = (coleta as any).destinationAddress?.lng
  const hasCoords = originLat && originLng && destLat && destLng

  const midLat = hasCoords ? (originLat + destLat) / 2 : -23.5505
  const midLng = hasCoords ? (originLng + destLng) / 2 : -46.6333
  const latDelta = hasCoords ? Math.abs(originLat - destLat) * 1.6 + 0.02 : 0.05
  const lngDelta = hasCoords ? Math.abs(originLng - destLng) * 1.6 + 0.02 : 0.05

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={{
        backgroundColor: '#0F172A',
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <View style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(99,102,241,0.25)' }} />

        {/* Back + title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 18, marginLeft: -1 }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#A5B4FC', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>RASTREAMENTO</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>#{coleta.trackingCode}</Text>
          </View>
          {/* Chat button */}
          <TouchableOpacity
            onPress={() => router.push(`/chat/${coleta.id}` as any)}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* Status badge + info row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ backgroundColor: cfg.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
            <Text style={{ color: cfg.color, fontWeight: '800', fontSize: 13 }}>{cfg.label}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: '#CBD5E1', fontSize: 12, fontWeight: '600' }}>{tierLabel(coleta.serviceTier)}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={{ color: '#34D399', fontSize: 16, fontWeight: '900' }}>{formatBRL(coleta.valorFrete)}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: action ? 110 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View style={{ height: 200, marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            initialRegion={{ latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {hasCoords && (
              <>
                {/* Origin marker */}
                <Marker coordinate={{ latitude: originLat, longitude: originLng }} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
                    <Text style={{ fontSize: 12 }}>A</Text>
                  </View>
                </Marker>
                {/* Destination marker */}
                <Marker coordinate={{ latitude: destLat, longitude: destLng }} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' }}>
                    <Text style={{ fontSize: 12 }}>B</Text>
                  </View>
                </Marker>
                {/* Route line */}
                <Polyline
                  coordinates={[
                    { latitude: originLat, longitude: originLng },
                    { latitude: destLat,   longitude: destLng },
                  ]}
                  strokeColor="#1D4ED8"
                  strokeWidth={2}
                  lineDashPattern={[6, 4]}
                />
              </>
            )}
          </MapView>
        </View>

        {/* Status Timeline */}
        {!isDone && (
          <View style={{ backgroundColor: '#fff', borderRadius: 20, margin: 16, marginBottom: 0, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Progresso da entrega</Text>
            {STATUS_STEPS.map((step, i) => {
              const stepIdx    = statusIndex(step.key)
              const currentIdx = statusIndex(coleta.status)
              const done       = currentIdx > stepIdx
              const active     = currentIdx === stepIdx
              const isLast     = i === STATUS_STEPS.length - 1
              return (
                <View key={step.key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  {/* Circle + line */}
                  <View style={{ alignItems: 'center', width: 28 }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: done ? '#059669' : active ? '#1D4ED8' : '#E2E8F0',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: active ? 2 : 0, borderColor: '#93C5FD',
                    }}>
                      {done
                        ? <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>
                        : <Text style={{ fontSize: 12 }}>{active ? step.icon : '·'}</Text>
                      }
                    </View>
                    {!isLast && (
                      <View style={{ width: 2, height: 20, backgroundColor: done ? '#059669' : '#E2E8F0', marginTop: 2 }} />
                    )}
                  </View>
                  {/* Label */}
                  <View style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 16 }}>
                    <Text style={{
                      fontSize: 13, fontWeight: active ? '800' : '600',
                      color: done ? '#059669' : active ? '#1D4ED8' : '#94A3B8',
                    }}>
                      {step.label}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* Delivered / Cancelled state */}
        {isDone && (
          <View style={{
            backgroundColor: coleta.status === 'ENTREGUE' ? '#F0FDF4' : '#FEF2F2',
            borderRadius: 20, margin: 16, marginBottom: 0, padding: 20,
            alignItems: 'center', borderWidth: 1,
            borderColor: coleta.status === 'ENTREGUE' ? '#BBF7D0' : '#FECACA',
          }}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>
              {coleta.status === 'ENTREGUE' ? '🎉' : '❌'}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: coleta.status === 'ENTREGUE' ? '#15803D' : '#DC2626' }}>
              {coleta.status === 'ENTREGUE' ? 'Entrega concluída!' : 'Coleta cancelada'}
            </Text>
            {coleta.status === 'ENTREGUE' && (
              <Text style={{ fontSize: 13, color: '#4ADE80', marginTop: 4, fontWeight: '600' }}>
                {formatBRL(isMotoboy ? coleta.valorRepasse : coleta.valorFrete)}
              </Text>
            )}
          </View>
        )}

        {/* Addresses */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, margin: 16, marginBottom: 0, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 2 }}>Endereços</Text>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#1D4ED8' }}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 }}>ORIGEM</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
                {fmtAddr((coleta as any).originAddress)}
              </Text>
              {(coleta as any).originAddress?.pessoaContato && (
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {(coleta as any).originAddress.pessoaContato}
                  {(coleta as any).originAddress.telefoneContato ? ` · ${(coleta as any).originAddress.telefoneContato}` : ''}
                </Text>
              )}
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#DC2626' }}>B</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 }}>DESTINO</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
                {fmtAddr((coleta as any).destinationAddress)}
              </Text>
              {(coleta as any).destinationAddress?.pessoaContato && (
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {(coleta as any).destinationAddress.pessoaContato}
                  {(coleta as any).destinationAddress.telefoneContato ? ` · ${(coleta as any).destinationAddress.telefoneContato}` : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, margin: 16, marginBottom: 0, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 14 }}>Detalhes</Text>
          {[
            { label: 'Distância',     value: `${(coleta.distanciaKm ?? 0).toFixed(1)} km` },
            { label: 'Serviço',       value: tierLabel(coleta.serviceTier) },
            { label: 'Pagamento',     value: coleta.paymentMethod ?? '—' },
            { label: 'Frete total',   value: formatBRL(coleta.valorFrete) },
            ...(isMotoboy ? [{ label: 'Seu repasse', value: formatBRL(coleta.valorRepasse) }] : []),
            ...((coleta as any).quantidadeItens ? [{ label: 'Itens', value: String((coleta as any).quantidadeItens) }] : []),
            ...((coleta as any).pesoTotalKg ? [{ label: 'Peso', value: `${(coleta as any).pesoTotalKg} kg` }] : []),
          ].map((row, i, arr) => (
            <View key={row.label} style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9',
            }}>
              <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>{row.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Motoboy action button — fixed at bottom */}
      {action && !updating && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16,
          paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#E2E8F0',
        }}>
          <TouchableOpacity
            onPress={() => confirmStatusUpdate(action)}
            style={{ backgroundColor: action.color, borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{action.label}</Text>
          </TouchableOpacity>
        </View>
      )}

      {updating && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 24,
          paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#E2E8F0',
          alignItems: 'center',
        }}>
          <ActivityIndicator color="#1D4ED8" />
          <Text style={{ color: '#64748B', marginTop: 8, fontWeight: '600' }}>Atualizando status...</Text>
        </View>
      )}
    </View>
  )
}

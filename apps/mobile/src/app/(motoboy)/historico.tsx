import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Platform, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

const C = {
  primary: '#059669',
  dark:    '#111827',
  surface: '#1F2937',
  border:  '#374151',
  muted:   '#6B7280',
}

type Filter = 'todas' | 'concluidas' | 'canceladas' | 'gorjetas'

const FILTERS: { key: Filter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'todas',      label: 'Todas',      icon: 'apps-outline' },
  { key: 'concluidas', label: 'Concluídas', icon: 'checkmark-circle-outline' },
  { key: 'canceladas', label: 'Canceladas', icon: 'close-circle-outline' },
  { key: 'gorjetas',   label: 'Gorjetas',   icon: 'cash-outline' },
]

// Mock history cards for visual completeness
const MOCK_COLETAS = [
  {
    id: 'm1', status: 'ENTREGUE',  store: 'BellaModa',     time: '14:30',
    origin: 'BellaModa Centro',      dest: 'TopMalhas Distribuidora',
    valor: 32.00, gorjeta: 5.00,
  },
  {
    id: 'm2', status: 'ENTREGUE',  store: 'Loja Glamour',  time: '11:15',
    origin: 'Loja Glamour Jd. Paulista', dest: 'Central Logistics',
    valor: 28.50, gorjeta: 0,
  },
  {
    id: 'm3', status: 'CANCELADA', store: 'Fashion Outlet', time: '09:00',
    origin: '',                       dest: '',
    valor: 0,    gorjeta: 0,
    cancelReason: 'Pedido cancelado pelo estabelecimento',
  },
]

function statusStyle(status: string): { label: string; color: string; bg: string } {
  if (status === 'ENTREGUE')  return { label: 'Concluída', color: '#059669', bg: 'rgba(5,150,105,0.12)' }
  if (status === 'CANCELADA') return { label: 'Cancelada', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  return { label: status, color: C.muted, bg: C.surface }
}

function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function MotoboyHistoricoScreen() {
  const { pastColetas, activeColetas, fetchPastColetas, fetchActiveColetas, isLoading } = useColetaStore()
  const [filter, setFilter]   = useState<Filter>('todas')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetchPastColetas()
    fetchActiveColetas()
  }, [])

  // Use real data when available, fall back to mock
  const allColetas  = pastColetas.length > 0 ? pastColetas : (MOCK_COLETAS as any[])
  const totalGanhos = pastColetas
    .filter((c) => c.status === 'ENTREGUE')
    .reduce((s, c) => s + ((c as any).valorRepasse ?? 0), 0)
  const displayTotal = pastColetas.length > 0 ? totalGanhos : 9850

  const filtered = allColetas.filter((c: any) => {
    const matchSearch = !search ||
      (c.store ?? c.trackingCode ?? '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'concluidas') return matchSearch && c.status === 'ENTREGUE'
    if (filter === 'canceladas') return matchSearch && c.status === 'CANCELADA'
    if (filter === 'gorjetas')   return matchSearch && (c.gorjeta ?? 0) > 0
    return matchSearch
  })

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: C.dark,
        paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Histórico de Coletas</Text>
          <TouchableOpacity
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Metrics grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1, backgroundColor: C.surface, borderRadius: 16,
            borderWidth: 1, borderColor: C.border, padding: 16,
          }}>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Total Coletas
            </Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>
              {pastColetas.length > 0 ? pastColetas.length : 428}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: C.surface, borderRadius: 16,
            borderWidth: 1, borderColor: C.border, padding: 16,
          }}>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Ganhos Totais
            </Text>
            <Text style={{ color: C.primary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>
              {formatBRL(displayTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Sticky search ───────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: C.dark,
        paddingHorizontal: 20, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: C.border,
      }}>
        <View style={{
          backgroundColor: C.surface, borderRadius: 14,
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 14, gap: 10,
        }}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por loja ou data..."
            placeholderTextColor="#4B5563"
            style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 13 }}
          />
        </View>
      </View>

      {/* ── Filter pills ─────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key
          const pillColor = f.key === 'concluidas' ? '#059669'
                          : f.key === 'canceladas' ? '#EF4444'
                          : f.key === 'gorjetas'   ? '#F59E0B'
                          : C.primary
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: active ? pillColor : 'transparent',
                borderWidth: 1,
                borderColor: active ? pillColor : C.border,
              }}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? '#fff' : C.muted}
              />
              <Text style={{
                color: active ? '#fff' : C.muted,
                fontSize: 13, fontWeight: active ? '700' : '500',
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Delivery list ─────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { fetchPastColetas(); fetchActiveColetas() }}
            tintColor={C.primary}
          />
        }
      >
        {/* Date section header */}
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
          Hoje, 27 de Fevereiro
        </Text>

        {filtered.length === 0 ? (
          <View style={{
            backgroundColor: C.surface, borderRadius: 20, padding: 40,
            alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 8,
          }}>
            <Ionicons name="document-outline" size={48} color={C.muted} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Nenhum resultado</Text>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              Tente outro filtro ou termo de busca.
            </Text>
          </View>
        ) : (
          filtered.map((c: any, i: number) => {
            const cfg     = statusStyle(c.status)
            const timeStr = c.time ?? fmtDate((c as any).updatedAt ?? (c as any).createdAt)
            const storeName = c.store ?? c.trackingCode ?? `#${c.id?.slice(0, 8)}`
            const origin  = c.origin ?? (c as any).originAddress?.logradouro ?? '—'
            const dest    = c.dest   ?? (c as any).destinationAddress?.logradouro ?? '—'
            const valor   = c.valor  ?? (c as any).valorRepasse ?? 0
            const gorjeta = c.gorjeta ?? 0

            return (
              <TouchableOpacity
                key={c.id ?? i}
                activeOpacity={0.85}
                onPress={() => pastColetas.length > 0
                  ? router.push(`/coleta/tracking?id=${c.id}` as any)
                  : undefined
                }
                style={{
                  backgroundColor: C.surface, borderRadius: 18,
                  borderWidth: 1, borderColor: C.border,
                  padding: 16,
                  opacity: c.status === 'CANCELADA' ? 0.7 : 1,
                }}
              >
                {/* Top row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View>
                    <View style={{
                      backgroundColor: cfg.bg, borderRadius: 6,
                      paddingHorizontal: 8, paddingVertical: 3,
                      alignSelf: 'flex-start', marginBottom: 6,
                    }}>
                      <Text style={{ color: cfg.color, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {cfg.label}
                      </Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{storeName}</Text>
                  </View>
                  <Text style={{ color: C.muted, fontSize: 12, fontWeight: '600' }}>{timeStr}</Text>
                </View>

                {/* Route connector */}
                {c.status !== 'CANCELADA' && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    {/* Dot + line + dot */}
                    <View style={{ alignItems: 'center', paddingTop: 3 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
                      <View style={{ width: 1, height: 20, backgroundColor: C.border, marginVertical: 2 }} />
                      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: C.primary }} />
                    </View>
                    <View style={{ gap: 10, flex: 1 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 13 }} numberOfLines={1}>{origin}</Text>
                      <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{dest}</Text>
                    </View>
                  </View>
                )}

                {/* Cancelled reason */}
                {c.status === 'CANCELADA' && c.cancelReason ? (
                  <Text style={{ color: C.muted, fontSize: 12, fontStyle: 'italic', marginBottom: 8 }}>
                    {c.cancelReason}
                  </Text>
                ) : null}

                {/* Bottom row */}
                {c.status !== 'CANCELADA' && (
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{formatBRL(valor)}</Text>
                      {gorjeta > 0 && (
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', gap: 4,
                          backgroundColor: 'rgba(245,158,11,0.15)',
                          borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
                          borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
                        }}>
                          <Ionicons name="cash-outline" size={11} color="#F59E0B" />
                          <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700' }}>
                            + {formatBRL(gorjeta)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.border} />
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

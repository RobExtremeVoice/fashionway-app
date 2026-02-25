import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

type Tab = 'ao_vivo' | 'pendentes' | 'feitas'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NOVA:           { label: 'Nova',        color: '#1D4ED8', bg: '#EFF6FF' },
  PENDENTE:       { label: 'Pendente',    color: '#D97706', bg: '#FFFBEB' },
  ACEITA:         { label: 'Aceita',      color: '#059669', bg: '#ECFDF5' },
  EM_ROTA_COLETA: { label: 'A caminho',   color: '#7C3AED', bg: '#F5F3FF' },
  COLETADO:       { label: 'Coletado',    color: '#0891B2', bg: '#ECFEFF' },
  EM_TRANSITO:    { label: 'Em trânsito', color: '#EA580C', bg: '#FFF7ED' },
  ENTREGUE:       { label: 'Entregue',    color: '#16A34A', bg: '#F0FDF4' },
  CANCELADA:      { label: 'Cancelada',   color: '#DC2626', bg: '#FEF2F2' },
}

function fmtDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function MotoboyHistoricoScreen() {
  const { activeColetas, pastColetas, fetchActiveColetas, fetchPastColetas, isLoading } = useColetaStore()
  const [tab, setTab] = useState<Tab>('ao_vivo')

  useEffect(() => {
    fetchActiveColetas()
    fetchPastColetas()
  }, [])

  const aoVivo   = activeColetas.filter((c) => ['ACEITA', 'EM_ROTA_COLETA', 'COLETADO', 'EM_TRANSITO'].includes(c.status))
  const pendentes = activeColetas.filter((c) => ['NOVA', 'PENDENTE'].includes(c.status))
  const feitas   = pastColetas

  const TABS: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'ao_vivo',   label: 'Ao vivo',   count: aoVivo.length,   color: '#059669' },
    { key: 'pendentes', label: 'Pendentes', count: pendentes.length, color: '#D97706' },
    { key: 'feitas',    label: 'Feitas',    count: feitas.length,   color: '#64748B' },
  ]

  const currentList = tab === 'ao_vivo' ? aoVivo : tab === 'pendentes' ? pendentes : feitas

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={{
        backgroundColor: '#0F172A',
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(99,102,241,0.3)' }} />
        <Text style={{ color: '#A5B4FC', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>HISTÓRICO</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>Suas Corridas</Text>

        {/* Tab pills */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: tab === t.key ? t.color : 'rgba(255,255,255,0.1)',
                borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{t.label}</Text>
              {t.count > 0 && (
                <View style={{
                  backgroundColor: tab === t.key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                  borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1,
                }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{t.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { fetchActiveColetas(); fetchPastColetas() }}
            tintColor="#1D4ED8"
          />
        }
      >
        {currentList.length === 0 ? (
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 40,
            alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 16,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>
              {tab === 'ao_vivo' ? '🏍️' : tab === 'pendentes' ? '⏳' : '📋'}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
              {tab === 'ao_vivo' ? 'Nenhuma corrida ao vivo' : tab === 'pendentes' ? 'Nenhuma pendente' : 'Nenhuma coleta feita'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              {tab === 'ao_vivo' ? 'Aceite corridas para vê-las aqui.' : tab === 'pendentes' ? 'Não há coletas aguardando.' : 'Suas entregas concluídas aparecerão aqui.'}
            </Text>
          </View>
        ) : (
          currentList.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? { label: c.status, color: '#374151', bg: '#E2E8F0' }
            const dateStr = fmtDate((c as any).updatedAt ?? (c as any).createdAt)
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#fff', borderRadius: 18, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0',
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                }}
              >
                {/* Status icon */}
                <View style={{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>
                    {c.status === 'ENTREGUE' ? '✓' : c.status === 'CANCELADA' ? '✕' : c.status === 'ACEITA' ? '🏍️' : '📦'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>#{c.trackingCode}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#059669' }}>
                      {formatBRL((c as any).valorRepasse ?? 0)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 3 }} numberOfLines={1}>
                    {(c as any).originAddress?.cidade ?? '—'} → {(c as any).destinationAddress?.cidade ?? '—'}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <View style={{ backgroundColor: cfg.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '700' }}>{cfg.label}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#94A3B8' }}>{dateStr}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

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

export default function LojaHistoricoScreen() {
  const { activeColetas, pastColetas, fetchActiveColetas, fetchPastColetas, isLoading } = useColetaStore()
  const [tab, setTab] = useState<Tab>('ao_vivo')

  useEffect(() => {
    fetchActiveColetas()
    fetchPastColetas()
  }, [])

  const aoVivo    = activeColetas.filter((c) => ['ACEITA', 'EM_ROTA_COLETA', 'COLETADO', 'EM_TRANSITO'].includes(c.status))
  const pendentes = activeColetas.filter((c) => ['NOVA', 'PENDENTE'].includes(c.status))
  const feitas    = pastColetas

  const TABS: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'ao_vivo',   label: 'Ao vivo',   count: aoVivo.length,    color: '#059669' },
    { key: 'pendentes', label: 'Pendentes', count: pendentes.length, color: '#D97706' },
    { key: 'feitas',    label: 'Feitas',    count: feitas.length,    color: '#64748B' },
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
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(59,130,246,0.3)' }} />
        <Text style={{ color: '#93C5FD', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>HISTÓRICO</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>Suas Coletas</Text>

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
                  backgroundColor: 'rgba(255,255,255,0.25)',
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
              {tab === 'ao_vivo' ? '🚀' : tab === 'pendentes' ? '⏳' : '📦'}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
              {tab === 'ao_vivo' ? 'Nenhuma coleta ao vivo' : tab === 'pendentes' ? 'Nenhuma pendente' : 'Nenhuma coleta feita'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              {tab === 'ao_vivo'
                ? 'Coletas em andamento aparecerão aqui.'
                : tab === 'pendentes'
                ? 'Coletas aguardando motoboy aparecerão aqui.'
                : 'Histórico de coletas entregues ou canceladas.'}
            </Text>
          </View>
        ) : (
          currentList.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? { label: c.status, color: '#374151', bg: '#E2E8F0' }
            const dateStr = fmtDate((c as any).updatedAt ?? (c as any).createdAt)
            const motoboyNome = (c as any).motoboy?.motoboyProfile?.nomeCompleto

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/coleta/tracking?id=${c.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#fff', borderRadius: 18, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0',
                }}
              >
                {/* Top row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 }}>
                      #{c.trackingCode}
                    </Text>
                    <View style={{ backgroundColor: cfg.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5, alignSelf: 'flex-start' }}>
                      <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                      {formatBRL((c as any).valorFrete ?? 0)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{dateStr}</Text>
                  </View>
                </View>

                {/* Addresses */}
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, gap: 4 }}>
                  <Text style={{ color: '#334155', fontSize: 12 }} numberOfLines={1}>
                    📍 {(c as any).originAddress?.logradouro ?? '—'}, {(c as any).originAddress?.numero ?? ''}
                  </Text>
                  <Text style={{ color: '#334155', fontSize: 12 }} numberOfLines={1}>
                    🏁 {(c as any).destinationAddress?.logradouro ?? '—'}, {(c as any).destinationAddress?.numero ?? ''}
                  </Text>
                </View>

                {/* Motoboy + service tier */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  {motoboyNome ? (
                    <Text style={{ fontSize: 12, color: '#059669', fontWeight: '700' }}>
                      🏍️ {motoboyNome}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>Aguardando motoboy</Text>
                  )}
                  <Text style={{ fontSize: 11, color: '#6B7280' }}>
                    {(c as any).serviceTier ?? ''}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

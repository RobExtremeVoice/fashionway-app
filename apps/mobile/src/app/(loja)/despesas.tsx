import { useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Alert,
} from 'react-native'
import { useColetaStore } from '../../store/coleta.store'
import { useAuthStore } from '../../store/auth.store'
import { formatBRL } from '@fashionway/shared'

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_SHORTS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function last7Days() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function next15Days() {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1)
  const CHART_H = 100
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H + 24, gap: 4 }}>
      {data.map((val, i) => {
        const barH = val > 0 ? Math.max((val / max) * CHART_H, 6) : 0
        const isToday = i === data.length - 1
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H + 24 }}>
            <View style={{
              width: '72%', height: barH,
              backgroundColor: isToday ? '#1D4ED8' : '#BFDBFE',
              borderRadius: 5,
            }} />
            <Text style={{
              fontSize: 9, color: '#64748B', marginTop: 5,
              fontWeight: isToday ? '800' : '500',
            }}>
              {labels[i]}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

// ── Breakdown bar ─────────────────────────────────────────────────────────────

function BreakdownBar({ segments }: { segments: Array<{ label: string; pct: number; color: string }> }) {
  return (
    <>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 12 }}>
        {segments.map((s) => (
          <View key={s.label} style={{ flex: s.pct > 0 ? s.pct : 0.01, backgroundColor: s.color }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {segments.map((s) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>
              {s.label}: {s.pct.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function LojaDespesasScreen() {
  const { pastColetas, activeColetas, fetchPastColetas, fetchActiveColetas } = useColetaStore()
  const { user } = useAuthStore()

  const isFaturado = !!(user as any)?.intermediarioProfile?.faturadoConfig?.ativo

  useEffect(() => {
    fetchPastColetas()
    fetchActiveColetas()
  }, [])

  const days = useMemo(() => last7Days(), [])

  const dailyExpenses = useMemo(() =>
    days.map((day) =>
      pastColetas
        .filter((c) => {
          if (c.status !== 'ENTREGUE') return false
          const d = (c as any).deliveredAt
            ? new Date((c as any).deliveredAt)
            : new Date((c as any).updatedAt)
          return isSameDay(d, day)
        })
        .reduce((sum, c) => sum + ((c as any).valorFrete ?? 0), 0),
    ), [pastColetas, days])

  const labels = days.map((d) => DAY_SHORTS[d.getDay()])
  const totalWeek = dailyExpenses.reduce((a, b) => a + b, 0)

  const entregues = pastColetas.filter((c) => c.status === 'ENTREGUE')
  const totalFrete      = entregues.reduce((s, c) => s + ((c as any).valorFrete      ?? 0), 0)
  const totalTaxa       = entregues.reduce((s, c) => s + ((c as any).taxaPlataforma  ?? 0), 0)
  const totalRepasse    = entregues.reduce((s, c) => s + ((c as any).valorRepasse    ?? 0), 0)
  const totalBase       = Math.max(totalFrete, 1)

  const pctLoja  = ((totalFrete - totalTaxa) / totalBase) * 100
  const pctFW    = (totalTaxa   / totalBase) * 100
  const pctOther = Math.max(0, 100 - pctLoja - pctFW)

  // Pending expenses (active coletas)
  const pendingExpenses = activeColetas
    .filter((c) => !['CANCELADA', 'ENTREGUE'].includes(c.status))
    .reduce((s, c) => s + ((c as any).valorFrete ?? 0), 0)

  const profileName =
    (user as any)?.lojaProfile?.nomeEmpresa ??
    (user as any)?.intermediarioProfile?.nomeEmpresa ??
    user?.email?.split('@')[0] ?? 'Empresa'

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header */}
      <View style={{
        backgroundColor: '#1E3A8A',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(59,130,246,0.4)' }} />
        <Text style={{ color: '#BFDBFE', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>DESPESAS</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }} numberOfLines={1}>
          {profileName}
        </Text>

        <View style={{
          flexDirection: 'row', gap: 0, marginTop: 20,
          backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 16,
        }}>
          {[
            { val: formatBRL(totalFrete),   lbl: 'Total gasto' },
            { val: formatBRL(totalWeek),    lbl: 'Essa semana' },
            { val: entregues.length.toString(), lbl: 'Coletas' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, alignItems: 'center',
              borderRightWidth: i < 2 ? 1 : 0,
              borderRightColor: 'rgba(255,255,255,0.2)',
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{s.val}</Text>
              <Text style={{ color: '#93C5FD', fontSize: 11, marginTop: 2 }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly chart */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 20,
          marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827' }}>Despesas diárias</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Últimos 7 dias</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert(
                'Detalhes',
                `Total semana: ${formatBRL(totalWeek)}\nMédia diária: ${formatBRL(Math.round(totalWeek / 7))}\nDia mais caro: ${formatBRL(Math.max(...dailyExpenses))}`,
              )}
              style={{ backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '700' }}>Ver detalhes</Text>
            </TouchableOpacity>
          </View>
          <BarChart data={dailyExpenses.map((v) => v / 100)} labels={labels} />
        </View>

        {/* Carteira */}
        <View style={{
          backgroundColor: '#1E3A8A', borderRadius: 20, padding: 20,
          marginBottom: 16, overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(96,165,250,0.3)' }} />
          <Text style={{ color: '#93C5FD', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
            CARTEIRA
          </Text>

          <Text style={{ color: '#BFDBFE', fontSize: 11 }}>Volume total de frete</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
            {formatBRL(totalFrete)}
          </Text>

          {pendingExpenses > 0 && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10,
              paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
              flexDirection: 'row', alignItems: 'center', gap: 8,
            }}>
              <Text style={{ fontSize: 14 }}>⏳</Text>
              <View>
                <Text style={{ color: '#FDE68A', fontSize: 11, fontWeight: '700' }}>EM ABERTO</Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{formatBRL(pendingExpenses)}</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <Text style={{ fontSize: 16 }}>📅</Text>
            <View>
              <Text style={{ color: '#93C5FD', fontSize: 11 }}>
                {isFaturado ? 'Próximo vencimento (faturado)' : 'Processamento cartão'}
              </Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                {isFaturado ? `15dd — ${next15Days()}` : 'Processado no ato do pagamento'}
              </Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: '#E2E8F0',
        }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            Breakdown de custos
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
            Distribuição dos valores de frete
          </Text>
          <BreakdownBar segments={[
            { label: 'Motoboy', pct: (totalRepasse / totalBase) * 100, color: '#059669' },
            { label: 'FW',      pct: pctFW,    color: '#1D4ED8' },
            { label: 'Outros',  pct: pctOther, color: '#E5E7EB' },
          ]} />
        </View>
      </ScrollView>
    </View>
  )
}

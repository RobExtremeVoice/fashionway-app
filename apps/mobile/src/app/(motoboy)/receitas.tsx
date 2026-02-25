import { useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Alert,
} from 'react-native'
import { useColetaStore } from '../../store/coleta.store'
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
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function nextTuesdayStr() {
  const today = new Date()
  const dow = today.getDay() // 0=Sun … 6=Sat
  const daysUntil = dow <= 2 ? (2 - dow === 0 ? 7 : 2 - dow) : 9 - dow
  const d = new Date(today)
  d.setDate(today.getDate() + daysUntil)
  return `${DAY_SHORTS[2]}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} às 16:00`
}

// ── Bar chart component ───────────────────────────────────────────────────────

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
              width: '72%',
              height: barH,
              backgroundColor: isToday ? '#059669' : '#A7F3D0',
              borderRadius: 5,
              borderTopLeftRadius: 5, borderTopRightRadius: 5,
            }} />
            <Text style={{ fontSize: 9, color: '#64748B', marginTop: 5, fontWeight: isToday ? '800' : '500' }}>
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

export default function MotoboyReceitasScreen() {
  const { pastColetas, activeColetas, fetchPastColetas, fetchActiveColetas } = useColetaStore()

  useEffect(() => {
    fetchPastColetas()
    fetchActiveColetas()
  }, [])

  const days = useMemo(() => last7Days(), [])

  const dailyEarnings = useMemo(() =>
    days.map((day) =>
      pastColetas
        .filter((c) => {
          if (c.status !== 'ENTREGUE') return false
          const d = (c as any).deliveredAt ? new Date((c as any).deliveredAt) : new Date((c as any).updatedAt)
          return isSameDay(d, day)
        })
        .reduce((sum, c) => sum + ((c as any).valorRepasse ?? 0), 0),
    ), [pastColetas, days])

  const labels = days.map((d) => DAY_SHORTS[d.getDay()])

  const totalWeek = dailyEarnings.reduce((a, b) => a + b, 0)

  const entregues = pastColetas.filter((c) => c.status === 'ENTREGUE')
  const totalRepasse    = entregues.reduce((s, c) => s + ((c as any).valorRepasse    ?? 0), 0)
  const totalFrete      = entregues.reduce((s, c) => s + ((c as any).valorFrete      ?? 0), 0)
  const totalTaxa       = entregues.reduce((s, c) => s + ((c as any).taxaPlataforma  ?? 0), 0)
  const totalBase       = Math.max(totalFrete, 1)

  const pctVoce = (totalRepasse / totalBase) * 100
  const pctFW   = (totalTaxa   / totalBase) * 100
  const pctOther = Math.max(0, 100 - pctVoce - pctFW)

  // Pending earnings (active coletas' repasse not yet paid)
  const pendingEarnings = activeColetas
    .filter((c) => ['ACEITA', 'EM_ROTA_COLETA', 'COLETADO', 'EM_TRANSITO'].includes(c.status))
    .reduce((s, c) => s + ((c as any).valorRepasse ?? 0), 0)

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* Header */}
      <View style={{
        backgroundColor: '#064E3B',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(16,185,129,0.35)' }} />
        <Text style={{ color: '#6EE7B7', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>RECEITAS</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>Seus Ganhos</Text>

        <View style={{
          flexDirection: 'row', gap: 0, marginTop: 20,
          backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 16,
        }}>
          <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{formatBRL(totalRepasse)}</Text>
            <Text style={{ color: '#6EE7B7', fontSize: 11, marginTop: 2 }}>Total ganho</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{formatBRL(totalWeek)}</Text>
            <Text style={{ color: '#6EE7B7', fontSize: 11, marginTop: 2 }}>Essa semana</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{entregues.length}</Text>
            <Text style={{ color: '#6EE7B7', fontSize: 11, marginTop: 2 }}>Entregas</Text>
          </View>
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
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827' }}>Ganhos diários</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Últimos 7 dias</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Detalhes', `Total semana: ${formatBRL(totalWeek)}\nMédia diária: ${formatBRL(Math.round(totalWeek / 7))}\nMelhor dia: ${formatBRL(Math.max(...dailyEarnings))}`)}
              style={{ backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#059669', fontWeight: '700' }}>Ver detalhes</Text>
            </TouchableOpacity>
          </View>
          <BarChart data={dailyEarnings.map((v) => v / 100)} labels={labels} />
        </View>

        {/* Carteira */}
        <View style={{
          backgroundColor: '#064E3B', borderRadius: 20, padding: 20,
          marginBottom: 16, overflow: 'hidden',
        }}>
          <View style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(16,185,129,0.3)' }} />
          <Text style={{ color: '#6EE7B7', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
            CARTEIRA
          </Text>

          <Text style={{ color: '#fff', fontSize: 11, color: '#A7F3D0' }}>Saldo disponível</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
            {formatBRL(totalRepasse)}
          </Text>

          {pendingEarnings > 0 && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10,
              paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
              flexDirection: 'row', alignItems: 'center', gap: 8,
            }}>
              <Text style={{ fontSize: 14 }}>⏳</Text>
              <View>
                <Text style={{ color: '#FDE68A', fontSize: 11, fontWeight: '700' }}>A RECEBER</Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{formatBRL(pendingEarnings)}</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <Text style={{ fontSize: 16 }}>📅</Text>
            <View>
              <Text style={{ color: '#A7F3D0', fontSize: 11 }}>Próximo pagamento</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{nextTuesdayStr()}</Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <View style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: '#E2E8F0',
        }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            Breakdown de ganhos
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
            Distribuição baseada no seu histórico
          </Text>
          <BreakdownBar segments={[
            { label: 'Você',  pct: pctVoce,  color: '#059669' },
            { label: 'FW',    pct: pctFW,    color: '#1D4ED8' },
            { label: 'Outros', pct: pctOther, color: '#E5E7EB' },
          ]} />
        </View>
      </ScrollView>
    </View>
  )
}

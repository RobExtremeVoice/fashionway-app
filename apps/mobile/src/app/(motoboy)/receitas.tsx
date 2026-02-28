import { useEffect, useMemo, useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Platform, Alert,
} from 'react-native'
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

type Period = 'hoje' | 'semana' | 'mes' | 'total'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'hoje',   label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mês' },
  { key: 'total',  label: 'Total' },
]

// Week bar heights (% of max) — Dom→Sáb
const MOCK_BARS   = [42, 68, 55, 30, 72, 95, 60]
const MOCK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const ACTIVITY = [
  { icon: 'arrow-up-circle-outline'   as const, color: '#EF4444', label: 'Saque PIX',            sub: 'Hoje, 14:30', amount: -250.00 },
  { icon: 'arrow-down-circle-outline' as const, color: C.primary, label: 'Recebido coleta #8821', sub: 'Hoje, 13:12', amount:   42.50 },
  { icon: 'arrow-down-circle-outline' as const, color: C.primary, label: 'Recebido Express VIP',  sub: 'Hoje, 11:45', amount:   42.50 },
]

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
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate()
  )
}

// ── Bar chart ────────────────────────────────────────────────────────────────

function WeekBars({ percents, labels, highlightIdx }: { percents: number[]; labels: string[]; highlightIdx: number }) {
  const CHART_H = 90
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: CHART_H + 28 }}>
      {percents.map((pct, i) => {
        const barH = Math.max((pct / 100) * CHART_H, 4)
        const active = i === highlightIdx
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H + 28 }}>
            <View style={{
              width: '80%', height: barH,
              backgroundColor: active ? C.primary : '#374151',
              borderRadius: 6,
              borderTopLeftRadius: 6, borderTopRightRadius: 6,
            }} />
            <Text style={{
              fontSize: 9, marginTop: 6,
              color: active ? C.primary : C.muted,
              fontWeight: active ? '800' : '500',
            }}>
              {labels[i]}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MotoboyReceitasScreen() {
  const [period, setPeriod] = useState<Period>('semana')
  const { pastColetas, fetchPastColetas } = useColetaStore()

  useEffect(() => { fetchPastColetas() }, [])

  const days = useMemo(() => last7Days(), [])

  // Real daily earnings (used for bar chart when data exists)
  const dailyEarnings = useMemo(() =>
    days.map((day) =>
      pastColetas
        .filter((c) => {
          if (c.status !== 'ENTREGUE') return false
          const d = (c as any).deliveredAt
            ? new Date((c as any).deliveredAt)
            : new Date((c as any).updatedAt)
          return isSameDay(d, day)
        })
        .reduce((sum, c) => sum + ((c as any).valorRepasse ?? 0), 0),
    ), [pastColetas, days])

  const hasRealData = dailyEarnings.some((v) => v > 0)

  const barMax = hasRealData ? Math.max(...dailyEarnings, 1) : 100
  const barPercents = hasRealData
    ? dailyEarnings.map((v) => Math.round((v / barMax) * 100))
    : MOCK_BARS
  const barLabels = days.map((d) => DAY_SHORTS[d.getDay()])

  // Highlight today's bar
  const todayIdx = barLabels.length - 1

  // Summary values
  const entregues  = pastColetas.filter((c) => c.status === 'ENTREGUE')
  const totalAll   = entregues.reduce((s, c) => s + ((c as any).valorRepasse ?? 0), 0)
  const totalWeek  = dailyEarnings.reduce((a, b) => a + b, 0)

  // Display values per period
  const mainValue  = period === 'hoje'   ? dailyEarnings[todayIdx]
                   : period === 'semana' ? totalWeek
                   : period === 'total'  ? totalAll
                   : totalAll   // mes — same as total for now

  const coletas  = hasRealData ? mainValue * 0.59 : 840.00
  const express  = hasRealData ? mainValue * 0.29 : 420.80
  const bonus    = hasRealData ? mainValue * 0.12 : 160.00
  const displayTotal = hasRealData ? mainValue : 1420.80

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={{
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
      }}>
        <Ionicons name="wallet-outline" size={24} color={C.primary} />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Receitas</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Filtros', 'Filtros avançados em breve.')}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="options-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? 160 : 140,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Period pills ────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={{
                paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
                backgroundColor: period === p.key ? C.primary : C.surface,
                borderWidth: period === p.key ? 0 : 1,
                borderColor: C.border,
              }}
            >
              <Text style={{
                color: period === p.key ? '#fff' : '#9CA3AF',
                fontSize: 13, fontWeight: period === p.key ? '700' : '500',
              }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Main earnings card ──────────────────────────────────────── */}
        <View style={{
          backgroundColor: C.surface, borderRadius: 24,
          borderWidth: 1, borderColor: C.border,
          padding: 20, gap: 16,
        }}>
          {/* Total + trend */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Ganhos — {PERIODS.find((p) => p.key === period)?.label}
              </Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 6 }}>
                {formatBRL(displayTotal)}
              </Text>
            </View>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              backgroundColor: 'rgba(5,150,105,0.15)', borderRadius: 10,
              paddingHorizontal: 10, paddingVertical: 5,
              borderWidth: 1, borderColor: 'rgba(5,150,105,0.25)',
            }}>
              <Ionicons name="trending-up-outline" size={14} color={C.primary} />
              <Text style={{ color: C.primary, fontSize: 12, fontWeight: '800' }}>+18%</Text>
            </View>
          </View>

          {/* Breakdown grid */}
          <View style={{
            flexDirection: 'row', gap: 1,
            backgroundColor: C.border, borderRadius: 16, overflow: 'hidden',
          }}>
            {[
              { label: 'Coletas', value: coletas,  icon: 'bag-outline' as const },
              { label: 'Express', value: express,  icon: 'flash-outline' as const },
              { label: 'Bônus',   value: bonus,    icon: 'star-outline' as const },
            ].map((item, i) => (
              <View key={item.label} style={{
                flex: 1, alignItems: 'center', paddingVertical: 14,
                backgroundColor: C.dark,
                borderLeftWidth: i > 0 ? 1 : 0,
                borderLeftColor: C.border,
              }}>
                <Ionicons name={item.icon} size={16} color={C.muted} style={{ marginBottom: 4 }} />
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>
                  {formatBRL(item.value)}
                </Text>
                <Text style={{ color: C.muted, fontSize: 9, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Weekly bar chart ────────────────────────────────────────── */}
        <View style={{
          backgroundColor: C.surface, borderRadius: 24,
          borderWidth: 1, borderColor: C.border,
          padding: 20,
        }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 }}>Desempenho Semanal</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginBottom: 16 }}>Últimos 7 dias</Text>
          <WeekBars percents={barPercents} labels={barLabels} highlightIdx={todayIdx} />
        </View>

        {/* ── Recent activity ─────────────────────────────────────────── */}
        <View style={{ gap: 12 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
            Atividade Recente
          </Text>
          {ACTIVITY.map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: C.surface, borderRadius: 18,
                borderWidth: 1, borderColor: C.border,
                padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: `${item.color}18`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '700' }}>{item.label}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <Text style={{
                fontSize: 14, fontWeight: '800',
                color: item.amount < 0 ? '#EF4444' : C.primary,
              }}>
                {item.amount < 0 ? '−' : '+'}
                {formatBRL(Math.abs(item.amount))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Floating bottom card ─────────────────────────────────────────── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface,
        borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: 20, paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <View>
          <Text style={{ color: C.muted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Saldo disponível
          </Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 }}>R$ 450,20</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Saque PIX', 'Solicitação de saque enviada.')}
          style={{
            backgroundColor: C.primary, borderRadius: 16,
            paddingVertical: 14, paddingHorizontal: 24,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
          }}
        >
          <Ionicons name="arrow-up-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Sacar para PIX</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

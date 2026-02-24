import { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import { useColetaStore } from '../../store/coleta.store'
import { formatBRL } from '@fashionway/shared'

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

const QUICK_ACTIONS = [
  { icon: '🏍️', label: 'Coleta\nExpressa', color: '#EFF6FF', border: '#BFDBFE' },
  { icon: '📦', label: 'Coleta\nPadrão',   color: '#F5F3FF', border: '#DDD6FE' },
  { icon: '📅', label: 'Agendar',          color: '#ECFDF5', border: '#A7F3D0' },
  { icon: '📋', label: 'Histórico',        color: '#FFFBEB', border: '#FDE68A' },
]

export default function LojaHomeScreen() {
  const { user, logout }                                   = useAuthStore()
  const { activeColetas, pastColetas, fetchActiveColetas, fetchPastColetas, isLoading } = useColetaStore()

  useEffect(() => {
    fetchActiveColetas()
    fetchPastColetas()
  }, [])

  const profileName = (user as any)?.lojaProfile?.nomeEmpresa
    ?? (user as any)?.intermediarioProfile?.nomeEmpresa
    ?? user?.email?.split('@')[0]
    ?? 'Usuário'

  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#1D4ED8',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#93C5FD', fontSize: 13 }}>{greeting},</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>
              {profileName} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 12, padding: 10,
          }}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Stats bar */}
        <View style={{
          flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: 16, padding: 16, marginTop: 20, gap: 0,
        }}>
          {[
            { val: activeColetas.length.toString(), lbl: 'Em andamento' },
            { val: pastColetas.filter((c) => c.status === 'ENTREGUE').length.toString(), lbl: 'Entregues hoje' },
            { val: `R$ ${(activeColetas.reduce((s, c) => s + (c.valorFrete ?? 0), 0) / 100).toFixed(0)}`, lbl: 'Em trânsito' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{s.val}</Text>
              <Text style={{ color: '#BFDBFE', fontSize: 11, marginTop: 2, textAlign: 'center' }}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchActiveColetas} tintColor="#1D4ED8" />}
      >
        {/* ── NOVA COLETA CTA ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => router.push('/coleta/origem')}
            style={{
              backgroundColor: '#1D4ED8', borderRadius: 20,
              padding: 20, flexDirection: 'row', alignItems: 'center',
              shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
            }}
          >
            <View style={{
              width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16,
            }}>
              <Text style={{ fontSize: 26 }}>🚀</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Nova Coleta</Text>
              <Text style={{ color: '#BFDBFE', fontSize: 13, marginTop: 2 }}>
                Cotação em segundos • Pagamento Pix
              </Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22 }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* ── AÇÕES RÁPIDAS ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
            Ações rápidas
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => a.label.includes('Histórico') ? undefined : router.push('/coleta/origem')}
                style={{
                  flex: 1, backgroundColor: a.color,
                  borderWidth: 1.5, borderColor: a.border,
                  borderRadius: 16, padding: 14, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── COLETAS ATIVAS ── */}
        {activeColetas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>Em andamento</Text>
              <View style={{
                backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
              }}>
                <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '700' }}>{activeColetas.length}</Text>
              </View>
            </View>

            {activeColetas.map((c) => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.NOVA
              return (
                <TouchableOpacity
                  key={c.id}
                  style={{
                    backgroundColor: '#fff', borderRadius: 18, padding: 18,
                    marginBottom: 12,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 }}>
                        #{c.trackingCode}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 }} numberOfLines={1}>
                        → {(c as any).destinationAddress?.cidade ?? 'Destino'}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: cfg.bg, borderRadius: 10,
                      paddingHorizontal: 10, paddingVertical: 5,
                    }}>
                      <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '700' }}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    marginTop: 14, paddingTop: 12,
                    borderTopWidth: 1, borderTopColor: '#F3F4F6',
                  }}>
                    <Text style={{ color: '#6B7280', fontSize: 13 }}>
                      {(c as any).serviceTier ?? 'PADRÃO'}
                    </Text>
                    <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }}>
                      {formatBRL(c.valorFrete ?? 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* ── RECENTES ── */}
        {pastColetas.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
              Últimas entregas
            </Text>
            {pastColetas.slice(0, 3).map((c) => (
              <View
                key={c.id}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#fff', borderRadius: 14, padding: 14,
                  marginBottom: 8,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                }}
              >
                <View style={{
                  width: 40, height: 40, backgroundColor: '#F0FDF4',
                  borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Text style={{ fontSize: 20 }}>✅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
                    #{c.trackingCode}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Entregue</Text>
                </View>
                <TouchableOpacity style={{
                  backgroundColor: '#EFF6FF', borderRadius: 10,
                  paddingHorizontal: 12, paddingVertical: 6,
                }}>
                  <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '700' }}>Repetir →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeColetas.length === 0 && pastColetas.length === 0 && !isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 56, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📦</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' }}>
              Nenhuma coleta ainda
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Crie sua primeira coleta e veja o FashionWay em ação!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

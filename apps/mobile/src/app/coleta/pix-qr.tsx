import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Image,
  Alert, ActivityIndicator, StatusBar, ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { api } from '../../services/api'
import { formatCountdown, PIX_POLL_INTERVAL_MS, PIX_EXPIRES_SECONDS } from '@fashionway/shared'

export default function PixQrScreen() {
  const { coletaId, trackingCode, paymentIntentId } = useLocalSearchParams<{
    coletaId: string
    trackingCode: string
    paymentIntentId: string
  }>()

  const [qrCode, setCodigo]     = useState<string | null>(null)
  const [copyPaste, setCopyPaste] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(PIX_EXPIRES_SECONDS)
  const [paid, setPaid]           = useState(false)
  const [copied, setCopied]       = useState(false)
  const [loading, setLoading]     = useState(true)

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadPixData()
    startCountdown()
    startPolling()
    return () => {
      if (pollRef.current)  clearInterval(pollRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function loadPixData() {
    try {
      const { data } = await api.get(`/payments/pix/${paymentIntentId}`)
      setCodigo(data.qrCode)
      setCopyPaste(data.copyPaste)
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o QR Code')
    } finally {
      setLoading(false)
    }
  }

  function startCountdown() {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function startPolling() {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/payments/status/${paymentIntentId}`)
        if (data.paid) {
          setPaid(true)
          clearInterval(pollRef.current!)
          clearInterval(timerRef.current!)
          setTimeout(() => {
            router.replace({
              pathname: '/coleta/confirmacao',
              params: { coletaId, trackingCode },
            })
          }, 1500)
        }
      } catch { /* ignora erros de polling */ }
    }, PIX_POLL_INTERVAL_MS)
  }

  async function handleCopy() {
    if (!copyPaste) return
    await Clipboard.setStringAsync(copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  function handleNewQr() {
    setCountdown(PIX_EXPIRES_SECONDS)
    setLoading(true)
    loadPixData()
    startCountdown()
  }

  const expired = countdown === 0
  const urgent  = countdown < 60

  if (paid) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
        <View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          shadowColor: '#059669', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
        }}>
          <Text style={{ fontSize: 50 }}>✅</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#059669' }}>Pago!</Text>
        <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 15 }}>Redirecionando...</Text>
        <ActivityIndicator color="#059669" style={{ marginTop: 16 }} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* ── HEADER ── */}
      <View style={{
        backgroundColor: '#059669',
        paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        alignItems: 'center',
      }}>
        <View style={{
          width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 18, alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 28 }}>⚡</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Pagamento via Pix</Text>
        <Text style={{ color: '#A7F3D0', fontSize: 13, marginTop: 4 }}>
          Escaneie o QR code no seu banco
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={{ color: '#6B7280', marginTop: 12, fontSize: 14 }}>Gerando QR Code...</Text>
          </View>
        ) : (
          <>
            {/* QR Code card */}
            <View style={{
              backgroundColor: '#fff', padding: 20, borderRadius: 24,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
              alignItems: 'center', width: '100%',
            }}>
              {qrCode ? (
                <Image
                  source={{ uri: `data:image/png;base64,${qrCode}` }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{
                  width: 220, height: 220, backgroundColor: '#F9FAFB',
                  borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>🔲</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>QR Code indisponível</Text>
                </View>
              )}

              {/* Countdown */}
              <View style={{
                backgroundColor: expired ? '#FEF2F2' : urgent ? '#FFFBEB' : '#F0FDF4',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8,
                marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6,
              }}>
                <Text style={{ fontSize: 14 }}>{expired ? '⚠️' : '⏱'}</Text>
                <Text style={{
                  fontWeight: '700', fontSize: 16,
                  color: expired ? '#DC2626' : urgent ? '#D97706' : '#059669',
                  fontVariant: ['tabular-nums'],
                }}>
                  {expired ? 'Expirado' : formatCountdown(countdown)}
                </Text>
              </View>

              {expired && (
                <TouchableOpacity
                  onPress={handleNewQr}
                  style={{
                    backgroundColor: '#1D4ED8', borderRadius: 12,
                    paddingHorizontal: 20, paddingVertical: 10, marginTop: 12,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                    🔄 Gerar novo QR Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tracking code */}
            <View style={{
              backgroundColor: '#fff', borderRadius: 16, padding: 16,
              width: '100%', marginTop: 16, flexDirection: 'row',
              alignItems: 'center', justifyContent: 'space-between',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
            }}>
              <View>
                <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5 }}>
                  CÓDIGO DA COLETA
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 2 }}>
                  {trackingCode}
                </Text>
              </View>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>

            {/* Copy button */}
            <TouchableOpacity
              onPress={handleCopy}
              disabled={!copyPaste || expired}
              style={{
                width: '100%', marginTop: 12,
                backgroundColor: copied ? '#059669' : expired ? '#E5E7EB' : '#111827',
                borderRadius: 16, paddingVertical: 16, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 10,
                shadowColor: copied ? '#059669' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: copied ? 0.3 : 0.12,
                shadowRadius: 8, elevation: 4,
              }}
            >
              <Text style={{ fontSize: 18 }}>{copied ? '✅' : '📋'}</Text>
              <Text style={{
                color: expired ? '#9CA3AF' : '#fff',
                fontSize: 15, fontWeight: '700',
              }}>
                {copied ? 'Código copiado!' : 'Copiar código Pix'}
              </Text>
            </TouchableOpacity>

            <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
              Abra o app do seu banco, escolha Pix e cole o código ou escaneie o QR Code acima.
            </Text>

            {/* Security */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20,
              backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
            }}>
              <Text style={{ fontSize: 14 }}>🔒</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Pagamentos processados por</Text>
              <Text style={{ color: '#6366F1', fontSize: 12, fontWeight: '700' }}>Stripe</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

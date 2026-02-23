import { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Image,
  Alert, ActivityIndicator,
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

  const [qrCode, setQrCode]         = useState<string | null>(null)
  const [copyPaste, setCopyPaste]   = useState<string | null>(null)
  const [countdown, setCountdown]   = useState(PIX_EXPIRES_SECONDS)
  const [paid, setPaid]             = useState(false)
  const [copied, setCopied]         = useState(false)
  const [loading, setLoading]       = useState(true)

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
      setQrCode(data.qrCode)
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
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
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
          // Redireciona para confirmação após 1.5s
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

  if (paid) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-6xl mb-4">✅</Text>
        <Text className="text-2xl font-bold text-green-600">Pago!</Text>
        <Text className="text-gray-500 mt-2">Redirecionando...</Text>
        <ActivityIndicator color="#059669" className="mt-4" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-green-600 px-5 pt-14 pb-6 items-center">
        <Text className="text-white text-2xl font-bold">Pagamento via Pix</Text>
        <Text className="text-green-100 text-sm mt-1">Escaneie o QR code no seu banco</Text>
      </View>

      <View className="flex-1 items-center px-5 pt-8">
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-400 mt-3">Gerando QR Code...</Text>
          </View>
        ) : (
          <>
            {/* QR Code */}
            <View className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              {qrCode ? (
                <Image
                  source={{ uri: `data:image/png;base64,${qrCode}` }}
                  style={{ width: 240, height: 240 }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{ width: 240, height: 240 }} className="bg-gray-100 rounded-xl items-center justify-center">
                  <Text className="text-gray-400">QR Code indisponível</Text>
                </View>
              )}
            </View>

            <Text className="text-gray-400 text-sm mt-3">Toque na imagem para ampliar</Text>

            {/* Countdown */}
            <View className={`mt-4 px-4 py-2 rounded-full ${countdown < 60 ? 'bg-red-50' : 'bg-gray-100'}`}>
              <Text className={`font-mono font-bold text-lg ${countdown < 60 ? 'text-red-600' : 'text-gray-600'}`}>
                ⏱ {formatCountdown(countdown)}
              </Text>
            </View>

            {countdown === 0 && (
              <TouchableOpacity
                onPress={handleNewQr}
                className="mt-2 bg-blue-700 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-medium">🔄 Gerar novo QR Code</Text>
              </TouchableOpacity>
            )}

            {/* Copiar código */}
            <TouchableOpacity
              onPress={handleCopy}
              disabled={!copyPaste || countdown === 0}
              className={`mt-6 w-full rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                copied ? 'bg-green-600' : 'bg-blue-700'
              }`}
            >
              <Text className="text-white font-semibold text-base">
                {copied ? '✅ Código copiado!' : '📋 Copiar código para app do banco'}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-400 text-xs text-center mt-4 px-4">
              Abra o app do seu banco, escolha Pix e cole o código ou escaneie o QR.
            </Text>

            {/* Tracking code */}
            <View className="mt-6 bg-gray-50 rounded-xl px-4 py-3 w-full">
              <Text className="text-gray-400 text-xs">Código da coleta</Text>
              <Text className="font-bold text-gray-700 text-base">{trackingCode}</Text>
            </View>
          </>
        )}
      </View>

      {/* Footer segurança */}
      <View className="px-5 pb-8 items-center">
        <Text className="text-gray-400 text-xs">🔒 Pagamentos processados por Stripe</Text>
      </View>
    </View>
  )
}

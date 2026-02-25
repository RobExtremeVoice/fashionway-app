import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/auth.store'

interface Message {
  id:        string
  text:      string
  senderId:  string
  sender:    { id: string; role: string }
  createdAt: string
}

export default function ChatScreen() {
  const { coletaId } = useLocalSearchParams<{ coletaId: string }>()
  const { user }     = useAuthStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)

  const listRef    = useRef<FlatList<Message>>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadMessages()
    pollingRef.current = setInterval(loadMessages, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  async function loadMessages() {
    try {
      const { data } = await api.get(`/coletas/${coletaId}/messages`)
      setMessages(data)
    } catch {
      // ignore polling errors
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText('')
    try {
      const { data } = await api.post(`/coletas/${coletaId}/messages`, { text: trimmed })
      setMessages((prev) => [...prev, data])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    } catch {
      setText(trimmed) // restore on error
    } finally {
      setSending(false)
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id
    return (
      <View style={{
        alignSelf:    isMine ? 'flex-end' : 'flex-start',
        maxWidth:     '78%',
        marginBottom: 8,
        marginHorizontal: 16,
      }}>
        <View style={{
          backgroundColor: isMine ? '#1D4ED8' : '#fff',
          borderRadius:    isMine ? 18 : 18,
          borderBottomRightRadius: isMine ? 4 : 18,
          borderBottomLeftRadius:  isMine ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical:   10,
          borderWidth:       isMine ? 0 : 1,
          borderColor:       '#E2E8F0',
          shadowColor:       '#000',
          shadowOffset:      { width: 0, height: 1 },
          shadowOpacity:     0.06,
          shadowRadius:      4,
          elevation:         2,
        }}>
          <Text style={{ color: isMine ? '#fff' : '#111827', fontSize: 14, lineHeight: 20 }}>
            {item.text}
          </Text>
        </View>
        <Text style={{
          fontSize: 10, color: '#9CA3AF', marginTop: 3,
          alignSelf: isMine ? 'flex-end' : 'flex-start',
          marginHorizontal: 4,
        }}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={{
        backgroundColor: '#fff',
        paddingTop:  56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 12,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: '#F1F5F9',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>Chat da Coleta</Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }} numberOfLines={1}>
            {coletaId}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          onLayout={() => messages.length > 0 && listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
              <Text style={{ fontSize: 46, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>Nenhuma mensagem ainda</Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
                Envie uma mensagem para iniciar a conversa com o motoboy.
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={{
        flexDirection:  'row',
        alignItems:     'flex-end',
        paddingHorizontal: 16,
        paddingVertical:   12,
        paddingBottom:     Platform.OS === 'ios' ? 28 : 12,
        backgroundColor:   '#fff',
        borderTopWidth:    1,
        borderTopColor:    '#E5E7EB',
        gap: 10,
      }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          returnKeyType="default"
          style={{
            flex: 1,
            backgroundColor: '#F1F5F9',
            borderRadius:    20,
            paddingHorizontal: 16,
            paddingVertical:   10,
            fontSize:          15,
            color:             '#111827',
            maxHeight:         100,
            borderWidth:       1,
            borderColor:       '#E2E8F0',
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          accessibilityLabel="Enviar mensagem"
          style={{
            width:  46,
            height: 46,
            borderRadius:    23,
            backgroundColor: text.trim() && !sending ? '#1D4ED8' : '#E5E7EB',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>
            {sending ? '⏳' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

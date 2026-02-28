import { useState } from 'react'
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  primary: '#089161',
  muted:   '#64748B',
}

export default function EmailVIPScreen() {
  const [subject, setSubject] = useState('Comprovante VIP #VIP-392 - FashionWay Logistics')
  const [body, setBody] = useState(
    'Olá! Segue em anexo o comprovante da entrega VIP #VIP-392.\n\nAtenciosamente,\nEquipe FashionWay.'
  )

  const handleSend = () => Alert.alert('E-mail enviado', 'Comprovante enviado para financeiro@bellamoda.com')

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Header */}
      <View style={{
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Enviar por E-mail</Text>
        <TouchableOpacity onPress={handleSend}>
          <Text style={{ color: C.primary, fontSize: 15, fontWeight: '800' }}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 48 : 28, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* To field */}
        <View>
          <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Para:</Text>
          <View style={{
            backgroundColor: '#111827', borderRadius: 14,
            borderWidth: 1, borderColor: '#1F2937',
            padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center',
          }}>
            {/* Chip */}
            <View style={{ backgroundColor: '#1F2937', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#374151' }}>
              <Text style={{ color: '#E5E7EB', fontSize: 12 }}>BellaModa <Text style={{ color: '#6B7280', fontSize: 11 }}>(financeiro@bellamoda.com)</Text></Text>
              <Ionicons name="close" size={14} color="#6B7280" />
            </View>
            <TextInput
              placeholder=""
              style={{ flex: 1, minWidth: 50, color: '#fff', fontSize: 13, paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* Subject */}
        <View>
          <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Assunto:</Text>
          <View style={{ backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1F2937', paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '500' }}
            />
          </View>
        </View>

        {/* Body */}
        <View>
          <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Mensagem:</Text>
          <View style={{ backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1F2937', padding: 14 }}>
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={6}
              style={{ color: '#D1D5DB', fontSize: 13, lineHeight: 22, minHeight: 120 }}
            />
          </View>
        </View>

        {/* Attachment */}
        <View>
          <Text style={{ color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Anexo (1):</Text>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
          }}>
            {/* PDF icon */}
            <View style={{ position: 'relative' }}>
              <View style={{ width: 52, height: 64, backgroundColor: '#1F2937', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}>
                <Ionicons name="document-outline" size={28} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontSize: 8, fontWeight: '900', marginTop: 2 }}>PDF</Text>
              </View>
              {/* VIP badge */}
              <View style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 }}>
                <Ionicons name="star" size={9} color="#111827" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '700' }}>Comprovante_VIP_392.pdf</Text>
              <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 3 }}>1.2 MB</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <Ionicons name="checkmark-circle" size={12} color={C.primary} />
                <Text style={{ color: C.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 }}>Assinado Digitalmente</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer note */}
      <View style={{
        padding: 16, alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#1F2937',
        backgroundColor: 'rgba(17,24,39,0.8)',
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
      }}>
        <Text style={{ color: '#4B5563', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', lineHeight: 14 }}>
          Este documento contém assinatura digital de autenticidade protegida por blockchain.
        </Text>
        <View style={{ width: 48, height: 4, backgroundColor: '#374151', borderRadius: 2, marginTop: 12 }} />
      </View>
    </View>
  )
}

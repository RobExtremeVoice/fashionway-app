import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth.store'

const C = {
  gold:    '#F59E0B',
  dark:    '#111827',
  surface: '#F5F8F7',
  primary: '#089161',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#64748B',
  border:  '#E2E8F0',
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface MenuItem {
  icon:     IoniconName
  label:    string
  desc?:    string
  badge?:   string
  badgeColor?: string
  onPress:  () => void
}

function MenuRow({ item, isLast }: { item: MenuItem; isLast: boolean }) {
  return (
    <TouchableOpacity
      onPress={item.onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 15, gap: 14,
        borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.gold}18`, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={item.icon} size={20} color={C.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{item.label}</Text>
        {item.desc && <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{item.desc}</Text>}
      </View>
      {item.badge && (
        <View style={{ backgroundColor: item.badgeColor ?? C.muted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{item.badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  )
}

export default function IntermediarioMenuScreen() {
  const { user, logout } = useAuthStore()

  const profileName = (user as any)?.name ?? user?.email?.split('@')[0] ?? 'Intermediário'
  const comingSoon  = (f: string) => Alert.alert('Em breve', `${f} estará disponível em breve.`)

  const STATS = [
    { icon: 'star-outline'  as IoniconName, label: 'VIPs', value: '3' },
    { icon: 'star-outline'  as IoniconName, label: 'Rating', value: '4.97★' },
    { icon: 'cube-outline'  as IoniconName, label: 'Entregas', value: '86' },
  ]

  const menuItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Meu Perfil', desc: 'Nome, contato, empresa', onPress: () => comingSoon('Perfil') },
    { icon: 'wallet-outline', label: 'Financeiro', desc: 'Comissões e repasses', onPress: () => comingSoon('Financeiro'), badge: 'VIP', badgeColor: C.gold },
    { icon: 'shield-checkmark-outline', label: 'Acordos VIP', desc: 'Contratos com motoboys', onPress: () => comingSoon('Acordos') },
    { icon: 'bar-chart-outline', label: 'Relatórios', desc: 'Exportar dados e PDFs', onPress: () => comingSoon('Relatórios') },
    { icon: 'notifications-outline', label: 'Notificações', desc: 'Alertas e preferências', onPress: () => comingSoon('Notificações') },
    { icon: 'help-circle-outline', label: 'Suporte', desc: 'Fale com o FashionWay', onPress: () => comingSoon('Suporte') },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />

      {/* Profile Header */}
      <View style={{
        backgroundColor: C.dark,
        paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        {/* Avatar */}
        <View style={{ position: 'relative', marginBottom: 12 }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            borderWidth: 3, borderColor: C.gold,
            backgroundColor: `${C.gold}18`,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: C.gold, fontSize: 34, fontWeight: '900' }}>
              {profileName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {/* Gold crown badge */}
          <View style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: 13,
            backgroundColor: C.gold,
            borderWidth: 2, borderColor: C.dark,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="star" size={12} color="#111827" />
          </View>
        </View>

        <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', textAlign: 'center' }}>
          {profileName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <View style={{ backgroundColor: `${C.gold}25`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: `${C.gold}40` }}>
            <Text style={{ color: C.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Intermediário VIP</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: C.white, borderRadius: 16,
              padding: 12, alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}>
              <Ionicons name={s.icon} size={20} color={C.gold} style={{ marginBottom: 4 }} />
              <Text style={{ fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: C.text, marginTop: 2 }}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Menu List */}
        <View style={{
          backgroundColor: C.white, borderRadius: 18, overflow: 'hidden',
          marginBottom: 16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        }}>
          {menuItems.map((item, i) => (
            <MenuRow key={item.label} item={item} isLast={i === menuItems.length - 1} />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Sair', 'Tem certeza que deseja sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: logout },
            ])
          }
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 15,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626' }}>Sair da conta</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(239,68,68,0.4)" />
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>FashionWay VIP v1.0 © 2026</Text>
      </ScrollView>
    </View>
  )
}

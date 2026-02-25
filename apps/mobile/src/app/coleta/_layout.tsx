import { Stack } from 'expo-router'

export default function ColetaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="origem" />
      <Stack.Screen name="destino" />
      <Stack.Screen name="servico" />
      <Stack.Screen name="pagamento" />
      <Stack.Screen name="pix-qr" />
      <Stack.Screen name="confirmacao" />
      <Stack.Screen name="tracking" />
    </Stack>
  )
}

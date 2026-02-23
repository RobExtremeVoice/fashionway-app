// Preços base em centavos BRL
export const PRICING = {
  URGENTE: {
    label: 'Urgente',
    description: '~30 minutos',
    basePrice: 2890,      // R$ 28,90
    pricePerKm: 180,      // R$ 1,80/km
    etaMinutes: 30,
  },
  PADRAO: {
    label: 'Padrão',
    description: '1 a 2 horas',
    basePrice: 1950,      // R$ 19,50
    pricePerKm: 120,      // R$ 1,20/km
    etaMinutes: 90,
  },
  AGENDADO: {
    label: 'Agendado',
    description: 'Escolha data e hora',
    basePrice: 1500,      // R$ 15,00
    pricePerKm: 100,      // R$ 1,00/km
    etaMinutes: 0,
  },
} as const

// Taxa da plataforma (%)
export const PLATFORM_FEE_PERCENT = 15

// Pix expira em 10 minutos
export const PIX_EXPIRES_SECONDS = 600

// Boleto expira em 3 dias úteis
export const BOLETO_EXPIRES_DAYS = 3

// Polling de status Pix (ms)
export const PIX_POLL_INTERVAL_MS = 15_000

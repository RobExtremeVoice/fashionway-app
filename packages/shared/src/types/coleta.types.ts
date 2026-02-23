export type ColetaStatus =
  | 'NOVA'
  | 'PENDENTE'
  | 'ACEITA'
  | 'EM_ROTA_COLETA'
  | 'COLETADO'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADA'
  | 'DISPUTA'

export type ServiceTier = 'URGENTE' | 'PADRAO' | 'AGENDADO'

export type PaymentMethod = 'PIX' | 'CARTAO' | 'BOLETO' | 'FATURADO'

export interface Address {
  id: string
  label?: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  lat: number
  lng: number
  pessoaContato?: string
  telefoneContato?: string
}

export interface Coleta {
  id: string
  trackingCode: string
  lojaId?: string
  intermediarioId?: string
  motoboyId?: string
  originAddress: Address
  destinationAddress: Address
  serviceTier: ServiceTier
  scheduledAt?: string
  status: ColetaStatus
  valorFrete: number      // centavos
  valorRepasse: number    // centavos
  taxaPlataforma: number  // centavos
  distanciaKm: number
  pickupPhotoUrl?: string
  deliveryPhotoUrl?: string
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
}

export interface CreateColetaDto {
  originAddressId?: string
  originAddress?: Omit<Address, 'id'>
  destinationAddressId?: string
  destinationAddress?: Omit<Address, 'id'>
  serviceTier: ServiceTier
  scheduledAt?: string
  paymentMethod: PaymentMethod
  vipMotoboyId?: string   // apenas Intermediário
}

export interface ColetaQuote {
  serviceTier: ServiceTier
  distanciaKm: number
  valorFrete: number      // centavos
  etaMinutes: number
  label: string           // "Urgente", "Padrão", "Agendado"
}

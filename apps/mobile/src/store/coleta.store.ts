import { create } from 'zustand'
import { api } from '../services/api'
import type { Coleta, CreateColetaDto, ColetaQuote } from '@fashionway/shared'

interface ColetaState {
  // Fluxo de criação
  originAddress: any | null
  destinationAddress: any | null
  quotes: ColetaQuote[]
  selectedTier: string | null
  selectedPaymentMethod: string | null

  // Coletas do usuário
  activeColetas: Coleta[]
  pastColetas: Coleta[]
  isLoading: boolean

  // Ações de fluxo
  setOrigin: (addr: any) => void
  setDestination: (addr: any) => void
  fetchQuotes: () => Promise<void>
  selectTier: (tier: string) => void
  selectPaymentMethod: (method: string) => void
  resetFlow: () => void

  // API calls
  createColeta: (dto: CreateColetaDto) => Promise<Coleta>
  fetchActiveColetas: () => Promise<void>
  fetchPastColetas: () => Promise<void>
  updateStatus: (id: string, status: string, photoUrl?: string) => Promise<void>
}

export const useColetaStore = create<ColetaState>((set, get) => ({
  originAddress: null,
  destinationAddress: null,
  quotes: [],
  selectedTier: null,
  selectedPaymentMethod: null,
  activeColetas: [],
  pastColetas: [],
  isLoading: false,

  setOrigin: (addr) => set({ originAddress: addr }),
  setDestination: (addr) => set({ destinationAddress: addr }),
  selectTier: (tier) => set({ selectedTier: tier }),
  selectPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  resetFlow: () => set({
    originAddress: null,
    destinationAddress: null,
    quotes: [],
    selectedTier: null,
    selectedPaymentMethod: null,
  }),

  fetchQuotes: async () => {
    const { originAddress, destinationAddress } = get()
    if (!originAddress || !destinationAddress) return

    const { data } = await api.post('/coletas/quote', {
      originLat:      originAddress.lat,
      originLng:      originAddress.lng,
      destinationLat: destinationAddress.lat,
      destinationLng: destinationAddress.lng,
    })
    set({ quotes: data })
  },

  createColeta: async (dto) => {
    const { data } = await api.post<Coleta>('/coletas', dto)
    return data
  },

  fetchActiveColetas: async () => {
    set({ isLoading: true })
    const { data } = await api.get('/coletas', {
      params: { status: 'NOVA,PENDENTE,ACEITA,EM_ROTA_COLETA,COLETADO,EM_TRANSITO' },
    })
    set({ activeColetas: data.items, isLoading: false })
  },

  fetchPastColetas: async () => {
    const { data } = await api.get('/coletas', {
      params: { status: 'ENTREGUE,CANCELADA', limit: 50 },
    })
    set({ pastColetas: data.items })
  },

  updateStatus: async (id, status, photoUrl) => {
    await api.patch(`/coletas/${id}/status`, { status, photoUrl })
    await get().fetchActiveColetas()
  },
}))

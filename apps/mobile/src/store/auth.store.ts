import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../services/api'
import type { User, Role } from '@fashionway/shared'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string; phone: string; password: string; role: Role; name: string
  }) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    await get().loadUser()
  },

  register: async (registerData) => {
    const { data } = await api.post('/auth/register', registerData)
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.refreshToken)
    await get().loadUser()
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken')
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch { /* ignora erro de logout */ }
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  loadUser: async () => {
    try {
      const { data } = await api.get('/users/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

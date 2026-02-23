import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta access token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh token automático em caso de 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })

        await SecureStore.setItemAsync('accessToken', data.accessToken)
        await SecureStore.setItemAsync('refreshToken', data.refreshToken)

        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        // Refresh falhou → desloga
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
      }
    }

    return Promise.reject(error)
  },
)

import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth'
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const authApi = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(500)
      const res: AuthResponse = {
        accessToken: `mock-jwt-${Date.now()}`,
        user: { id: 'u1', email: data.email, name: data.name, phone: data.phone },
      }
      return res
    }
    return (await client.post<AuthResponse>('/auth/signup', data)).data
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await delay(500)
      return {
        accessToken: `mock-jwt-${Date.now()}`,
        user: { id: 'u1', email: data.email, name: 'Test User', phone: '010-0000-0000' },
      }
    }
    return (await client.post<AuthResponse>('/auth/login', data)).data
  },
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

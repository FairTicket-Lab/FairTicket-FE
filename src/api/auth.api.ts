import type { AuthResponse, AuthApiResponse, LoginRequest, SignupRequest } from '@/types/auth'
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function mapAuthResponse(raw: AuthApiResponse, name?: string, phone?: string): AuthResponse {
  return {
    accessToken: raw.token,
    user: {
      id: String(raw.userId),
      email: raw.email,
      name: name ?? raw.name ?? '',
      phone: phone ?? '',
    },
  }
}

function mockAuthResponse(email: string, name?: string, phone?: string): AuthResponse {
  return {
    accessToken: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '1',
      email,
      name: name ?? email.split('@')[0] ?? 'User',
      phone: phone ?? '010-0000-0000',
    },
  }
}

export const authApi = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return mockAuthResponse(data.email, data.name, data.phone)
    }
    const raw = (await client.post<AuthApiResponse>('/v1/auth/signup', data)).data
    return mapAuthResponse(raw, data.name, data.phone)
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return mockAuthResponse(data.email)
    }
    const raw = (await client.post<AuthApiResponse>('/v1/auth/login', data)).data
    return mapAuthResponse(raw)
  },

  async logout(): Promise<void> {
    if (USE_MOCK) return
    await client.post('/v1/auth/logout')
  },
}

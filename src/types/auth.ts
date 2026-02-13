export interface User {
  id: string
  email: string
  name: string
  phone: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  phone: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// BE 실제 응답 형식
export interface AuthApiResponse {
  userId: number
  email: string
  name: string
  token: string
}

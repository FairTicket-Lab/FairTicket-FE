import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types/auth'
import { authApi } from '@/api/auth.api'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<User | null>(loadUser())
  const token = ref<string | null>(localStorage.getItem('access_token'))

  const isLoggedIn = computed(() => !!token.value)

  async function signup(email: string, password: string, name: string, phone: string) {
    const res = await authApi.signup({ email, password, name, phone })
    token.value = res.accessToken
    user.value = res.user
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
  }

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    token.value = res.accessToken
    user.value = res.user
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // 토큰 만료 등으로 실패해도 로컬은 정리
    }
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { user, token, isLoggedIn, signup, login, logout }
})

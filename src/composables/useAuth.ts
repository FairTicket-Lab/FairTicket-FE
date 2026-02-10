import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  async function loginAndRedirect(email: string, password: string, redirect?: string) {
    await store.login(email, password)
    router.push(redirect || '/')
  }

  async function signupAndRedirect(
    email: string,
    password: string,
    name: string,
    phone: string
  ) {
    await store.signup(email, password, name, phone)
    router.push('/')
  }

  function logoutAndRedirect() {
    store.logout()
    router.push('/login')
  }

  return {
    ...store,
    loginAndRedirect,
    signupAndRedirect,
    logoutAndRedirect,
  }
}

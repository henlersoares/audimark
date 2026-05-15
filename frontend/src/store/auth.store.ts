import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('audimark_token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('audimark_token')
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'audimark_auth',
    }
  )
)
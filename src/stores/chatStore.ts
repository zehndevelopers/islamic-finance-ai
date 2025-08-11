import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'

interface ChatStore {
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentSession: (sessionId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCurrentSession: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      currentSessionId: null,
      isLoading: false,
      error: null,

      setCurrentSession: (sessionId: string | null) => {
        set({ currentSessionId: sessionId })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearCurrentSession: () => {
        set({ currentSessionId: null })
      }
    }),
    {
      name: STORAGE_KEYS.CURRENT_SESSION,
      partialize: (state) => ({
        currentSessionId: state.currentSessionId
      })
    }
  )
)

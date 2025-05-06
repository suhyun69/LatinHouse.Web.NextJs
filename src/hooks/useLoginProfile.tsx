import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type LoginProfile = {
  id: string
  nickname: string
  gender: string
  is_instructor: boolean
  is_admin: boolean
  avatar_url: string
} | null

type Store = {
  loginProfile: LoginProfile
  setLoginProfile: (profile: LoginProfile) => void
  clearLoginProfile: () => void
}

export const useLoginProfile = create<Store>()(
  persist(
    (set) => ({
      loginProfile: null,
      setLoginProfile: (profile) => set({ loginProfile: profile }),
      clearLoginProfile: () => set({ loginProfile: null })
    }),
    {
      name: 'login-profile',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
// ✅ hooks/useLoginProfile.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type LoginProfile = {
  id: string
  nickname: string
  gender: string
  is_instructor: boolean
  is_admin: boolean
  avatar_url: string | null
} | null

type LoginProfileStore = {
  loginProfile: LoginProfile
  setLoginProfile: (profile: LoginProfile) => void
  clearLoginProfile: () => void
}

export const useLoginProfile = create<LoginProfileStore>()(
  persist(
    (set) => ({
      loginProfile: null,
      setLoginProfile: (profile) => set({ loginProfile: profile }),
      clearLoginProfile: () => set({ loginProfile: null }),
    }),
    {
      name: 'login-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
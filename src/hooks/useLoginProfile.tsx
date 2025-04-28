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

type LoginProfileStore = {
  loginProfile: LoginProfile
  setLoginProfile: (loginProfile: LoginProfile) => void
  clearLoginProfile: () => void
}

export const useLoginProfile = create<LoginProfileStore>()(
  persist(
    (set) => ({
      loginProfile: null,
      setLoginProfile: (loginProfile) => set({ loginProfile }),
      clearLoginProfile: () => {
        set({ loginProfile: null })
        // 스토리지 데이터 삭제
        if (typeof window !== 'undefined') {
          localStorage.removeItem('login-profile-storage')
          sessionStorage.removeItem('login-profile-storage')
        }
      }
    }),
    {
      name: 'login-profile-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
) 
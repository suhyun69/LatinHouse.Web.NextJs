import { create } from 'zustand'

type Profile = {
  id: string
  nickname: string
  avatar_url: string
  is_instructor: boolean
} | null

type ProfileStore = {
  profile: Profile
  setProfile: (profile: Profile) => void
}

export const useProfile = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
})) 
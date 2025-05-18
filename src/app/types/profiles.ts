export type ProfileRequest = {
  email: string
  id: string
  nickname: string
  gender: string
}

export type ProfileView = {
  id: string
  nickname: string
  gender: string
  avatar_url: string
  is_instructor: boolean
  is_admin: boolean
}
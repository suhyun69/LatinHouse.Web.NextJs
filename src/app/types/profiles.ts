export type ProfileRequest = {
  email: string
  id: string
  nickname: string
  gender: string
}

export type Profile = {
  id: string
  nickname: string
  gender: string
  is_instructor: boolean
  is_admin: boolean
}
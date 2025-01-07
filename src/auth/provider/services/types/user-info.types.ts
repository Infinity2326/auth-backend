export type UserInfo = {
  id: string
  picture: string
  name: string
  email: string
  access_token?: string | null
  refresh_token?: string | null
  expires_at?: number | null
  provider: string
}

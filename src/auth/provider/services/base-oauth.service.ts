import { BadRequestException, Injectable } from '@nestjs/common'
import { BaseProviderOptions } from './types/base.provider-options.types'
import { UserInfo } from './types/user-info.types'

@Injectable()
export class BaseOAuthService {
  private BASE_URL: string

  constructor(private readonly options: BaseProviderOptions) {}

  protected async extractUserInfo(data: any): Promise<UserInfo> {
    return { ...data, provider: this.options.name }
  }

  public getAuthUrl() {
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: this.options.client_id,
      redirect_uri: this.getRedirectUri(),
      scope: (this.options.scopes || []).join(' '),
      acess_type: 'offline',
      prompt: 'select_account',
    })

    return `${this.options.authorize_url}?${query}`
  }

  public async findUserByCode(code: string): Promise<UserInfo> {
    const client_id = this.options.client_id
    const client_secret = this.options.client_secret

    const tokenQuery = new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri: this.getRedirectUri(),
      grant_type: 'authorization_code',
    })

    const tokenRequest = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
    const tokens = await tokenRequest.json()

    if (!tokens.access_token) {
      console.log(tokens)
      throw new BadRequestException('Access token not found')
    }

    const userRequest = await fetch(this.options.profile_url, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userRequest.ok) {
      throw new BadRequestException('Unable to get user profile')
    }

    const user = await userRequest.json()

    const userInfo = await this.extractUserInfo(user)

    return {
      ...userInfo,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at || tokens.expires_in,
      provider: this.options.name,
    }
  }

  public getRedirectUri() {
    return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`
  }

  set baseUrl(url: string) {
    this.BASE_URL = url
  }

  get name() {
    return this.options.name
  }

  get access_url() {
    return this.options.access_url
  }

  get profile_url() {
    return this.options.profile_url
  }

  get scopes() {
    return this.options.scopes
  }
}

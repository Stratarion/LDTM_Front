import { API } from './api'
import { User, UserRegisterData, UserLoginData } from '@/types/user'
import { storage } from '@/utils/storage'

interface TokenData {
	token: string
	refreshToken: string
	expiresIn: number
	result: User
}

export class AuthService {
	static async signIn(email: string, password: string): Promise<TokenData> {
		try {
			const { data } = await API.post<TokenData>('/user/signin', {
				email,
				password
			})
			if (!data.token || !data.refreshToken || !data.result) {
				throw new Error('Invalid server response')
			}

			storage.setAuthData({
				token: data.token,
				refreshToken: data.refreshToken,
				expiresIn: data.expiresIn || 3600,
				user: data.result
			})

			return data
		} catch (error: any) {
			throw error
		}
	}

	static async signUp(userData: UserRegisterData): Promise<TokenData> {
		try {
			const { data } = await API.post<TokenData>('/user/signup', userData)

			if (!data.token || !data.refreshToken || !data.result) {
				throw new Error('Invalid server response')
			}

			storage.setAuthData({
				token: data.token,
				refreshToken: data.refreshToken,
				expiresIn: data.expiresIn || 3600,
				user: data.result
			})

			return data
		} catch (error: any) {
			throw error
		}
	}

	static async uploadAvatar(userId: string, file: File): Promise<string> {
		try {
			const formData = new FormData()
			formData.append('avatar', file)

			const { data } = await API.post<{ url: string }>(
				`/user/avatar?id=${userId}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			)

			return data.url
		} catch (error: any) {
			throw error
		}
	}

	static async refreshToken(): Promise<TokenData> {
		try {
			const { data } = await API.post<TokenData>('/user/refresh')

			if (data.token && data.result) {
				storage.setToken(data)
			}

			return data
		} catch (error: any) {
			storage.removeToken()
			throw error
		}
	}

	static async logout(): Promise<void> {
		try {
			await API.post('/user/logout')
		} finally {
			storage.clearAuth()
		}
	}

	static async verifyEmail(token: string): Promise<void> {
		try {
			await API.post('/user/verify-email', { token })
		} catch (error: any) {
			throw error
		}
	}

	static async requestPasswordReset(email: string): Promise<void> {
		try {
			await API.post('/user/forgot-password', { email })
		} catch (error: any) {
			throw error
		}
	}

	static async resetPassword(token: string, newPassword: string): Promise<void> {
		try {
			await API.post('/user/reset-password', {
				token,
				new_password: newPassword
			})
		} catch (error: any) {
			throw error
		}
	}

	static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
		try {
			await API.post('/user/change-password', {
				old_password: oldPassword,
				new_password: newPassword
			})
		} catch (error: any) {
			throw error
		}
	}
} 
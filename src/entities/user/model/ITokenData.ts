import { IUserLogin } from "./IUserLogin"

export interface ITokenData {
	token: string
	refreshToken: string
	expiresIn: number
	result: IUserLogin
}
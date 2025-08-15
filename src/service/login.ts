import { post } from './publicBase'
import { get, put } from "./base"
export const login = async (params: any) => {
  return post('auth/login', params)
}

export const verifyLogin = async () => {
  return get('auth/verify')
}

export const  updateUser = async (params: any) => {
  return put(`users/profile`, params)
}

export const resetPassword = async (params: { oldPassword: string, newPassword: string }  ) => {
  return put(`users/reset-password`, params)
}
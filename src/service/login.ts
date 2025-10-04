import { API_PREFIX } from '@/constant'
import { get, put } from "./base"
import Toast from '@/components/base/Toast'
import { tokenManager } from "./fetch"

export const login = async (params: any) => {
  try {
    const response = await fetch(`${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    // 2. 需要将用户信息存储
    if (!response.ok) {
      Toast.notify({ type: "error", message: `登录失败:${response.status} ${response.statusText}`})
    }
    const res = await response.json();
    console.log("login", res)
    if (res.status !== 'success') {
      Toast.notify({ type: "error", message: res.message || '登录失败，请检查账号密码' });
    }

    // 存储令牌（考虑安全性）
    if (res.data?.accessToken && res.data?.refreshToken) {
      tokenManager.setTokens(res.data.accessToken, res.data.refreshToken)
    }
    return res
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '登录时发生未知错误';
    Toast.notify({ type: "error", message: errorMessage});
  }
}

export const verifyLogin = async () => {
  return get('/auth/verify')
}

export const updateUser = async (params: any) => {
  return put(`users/profile`, { body: {...params}})
}

export const resetPassword = async (params: { oldPassword: string, newPassword: string }) => {
  return put(`users/reset-password`, { body: {...params}})
}
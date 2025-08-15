import { publicClient } from './fetch'

// request methods
export const get = <T>(url: string, options = {}) => {
  return publicClient.get<T>(url, options)
}

export const post = <T>(url: string, data?: any, options = {}) => {
  return publicClient.post<T>(url, { json: data, ...options })
}

export const put = <T>(url: string, data?: any, options = {}) => {
  return publicClient.put<T>(url, { json: data, ...options })
}

export const del = <T>(url: string, options = {}) => {
  return publicClient.delete<T>(url, options)
}

export const patch = <T>(url: string, data?: any, options = {}) => {
  return publicClient.patch<T>(url, { json: data, ...options })
}
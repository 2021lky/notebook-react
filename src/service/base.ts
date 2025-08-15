import { baseClient } from './fetch'

// request methods
export const get = <T>(url: string, options = {}) => {
  return baseClient.get<T>(url, options)
}

export const post = <T>(url: string, data?: any, options = {}) => {
  return baseClient.post<T>(url, { json: data, ...options })
}

export const put = <T>(url: string, data?: any, options = {}) => {
  return baseClient.put<T>(url, { json: data, ...options })
}

export const del = <T>(url: string, options = {}) => {
  return baseClient.delete<T>(url, options)
}

export const patch = <T>(url: string, data?: any, options = {}) => {
  return baseClient.patch<T>(url, { json: data, ...options })
}
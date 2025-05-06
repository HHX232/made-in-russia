/* eslint-disable @typescript-eslint/no-explicit-any */

import Cookies from 'js-cookie'

export const saveTokenStorage = (data: any) => {
  Cookies.set('accessToken', data.accessToken)
  Cookies.set('refreshToken', data.refreshToken)
}

export const removeFromStorage = (): void => {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  localStorage.removeItem('user')
}

export const saveToStorage = (data: any): void => {
  saveTokenStorage(data)
  localStorage.setItem('user', JSON.stringify(data.user))
}

export const getAccessToken = async () => {
  const accessToken = Cookies.get('accessToken')
  return accessToken || null
}

export const getRefreshToken = async () => {
  const refreshToken = Cookies.get('refreshToken')
  return refreshToken || null
}

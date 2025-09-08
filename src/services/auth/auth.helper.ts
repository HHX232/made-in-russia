/* eslint-disable @typescript-eslint/no-explicit-any */

import Cookies from 'js-cookie'

export const saveTokenStorage = (data: {accessToken: string; refreshToken: string}) => {
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

export const getAccessToken = () => {
  const accessToken = Cookies.get('accessToken')
  return accessToken || null
}

export const getAccessTokenServer = async () => {
  if (typeof window !== 'undefined') {
    // Если код выполняется на клиенте, используем обычную функцию
    return getAccessToken()
  }

  try {
    const {cookies} = await import('next/headers')
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')
    return accessToken?.value || null
  } catch (error) {
    console.error('Error getting access token on server:', error)
    return null
  }
}

export const getRefreshToken = () => {
  const refreshToken = Cookies.get('refreshToken')
  return refreshToken || null
}

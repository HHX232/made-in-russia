// lib/server/userDataFetcher.ts
import instance from '@/api/api.interceptor'
import {cookies} from 'next/headers'
import {getCurrentLocale} from '@/lib/locale-detection'

import {IVendorData, User} from '@/store/User/user.slice'
import {saveTokenStorage} from '@/middleware'
import {removeFromStorage} from '@/services/auth/auth.helper'

interface ServerUserFetchResult {
  user: User | null
  phoneNumberCode?: string
  error?: string
}

// Утилита для обрезки префикса телефона
export const trimPhonePrefix = (
  phoneNumber: string | undefined
): {
  trimmedNumber: string | undefined
  code: string | undefined
} => {
  if (!phoneNumber) return {trimmedNumber: phoneNumber, code: undefined}

  const prefixesToTrim = ['+375', '+7', '+86', '+']

  for (const prefix of prefixesToTrim) {
    if (phoneNumber.startsWith(prefix)) {
      return {
        trimmedNumber: phoneNumber.substring(prefix.length),
        code: prefix
      }
    }
  }

  return {trimmedNumber: phoneNumber, code: undefined}
}

// Основная функция для получения данных пользователя на сервере
export async function fetchUserDataOnServer(): Promise<ServerUserFetchResult> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value || ''
    const refreshTokenStorage = cookieStore.get('refreshToken')?.value || ''

    if (!accessToken) {
      return {user: null, error: 'No access token'}
    }

    const locale = await getCurrentLocale()

    try {
      // Первая попытка получить данные пользователя с текущим токеном
      const response = await instance.get<IVendorData>('/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
          'Accept-Language': locale,
          'x-language': locale
        }
      })

      const userData = response.data
      const {trimmedNumber, code} = trimPhonePrefix(userData.phoneNumber)

      // Создаем нормализованный объект пользователя
      const normalizedUser: User = {
        id: userData.id || 0,
        role: userData.role || '',
        email: userData.email || '',
        login: userData.login || '',
        phoneNumber: trimmedNumber || '',
        region: userData.region || '',
        registrationDate: userData.registrationDate || '',
        lastModificationDate: userData.lastModificationDate || '',
        avatarUrl: userData.avatarUrl || '',
        vendorDetails: userData.vendorDetails
      }

      return {
        user: normalizedUser,
        phoneNumberCode: code
      }
    } catch (initialError) {
      console.log('Error fetching userData:', initialError)

      // Если нет refresh токена, возвращаем ошибку
      if (!refreshTokenStorage) {
        return {
          user: null,
          error: 'No refresh token available'
        }
      }

      try {
        // Пытаемся обновить токены
        const refreshResponse = await instance.post('/refresh', {
          refreshToken: refreshTokenStorage
        })

        const {accessToken: newAccessToken, refreshToken: newRefreshToken} = refreshResponse.data
        console.log('tokens after update', newAccessToken.slice(0, 5))

        // Сохраняем новые токены
        saveTokenStorage({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        })

        // Повторная попытка получить данные пользователя с новым токеном
        const retryResponse = await instance.get<IVendorData>('/me', {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
            'Accept-Language': locale,
            'x-language': locale
          }
        })

        const userData = retryResponse.data
        const {trimmedNumber, code} = trimPhonePrefix(userData.phoneNumber)

        // Создаем нормализованный объект пользователя
        const normalizedUser: User = {
          id: userData.id || 0,
          role: userData.role || '',
          email: userData.email || '',
          login: userData.login || '',
          phoneNumber: trimmedNumber || '',
          region: userData.region || '',
          registrationDate: userData.registrationDate || '',
          lastModificationDate: userData.lastModificationDate || '',
          avatarUrl: userData.avatarUrl || '',
          vendorDetails: userData.vendorDetails
        }

        return {
          user: normalizedUser,
          phoneNumberCode: code
        }
      } catch (refreshError) {
        // Если обновление токенов не удалось, очищаем storage
        removeFromStorage()
        console.log('delete user from storage on fetchUserDataOnServer')
        console.log('Error refreshing tokens:', refreshError)

        return {
          user: null,
          error: refreshError instanceof Error ? refreshError.message : 'Token refresh failed'
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user data on server:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Функция для предзаполнения кэша React Query
export function getDehydratedUserQuery(user: User | null) {
  return user
    ? {
        queryKey: ['user'],
        queryFn: () => Promise.resolve(user),
        staleTime: Infinity // Данные уже свежие с сервера
      }
    : null
}

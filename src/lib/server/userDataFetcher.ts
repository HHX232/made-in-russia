// lib/server/userDataFetcher.ts
import instance from '@/api/api.interceptor'
import {cookies} from 'next/headers'
import {getAbsoluteLanguage} from '@/api/api.helper'
import {IVendorData, User} from '@/store/User/user.slice'

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

    if (!accessToken) {
      return {user: null, error: 'No access token'}
    }

    const locale = await getAbsoluteLanguage()

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

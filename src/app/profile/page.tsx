import {getCurrentLocale} from '@/lib/locale-detection'

import instance from '@/api/api.interceptor'
import ProfilePage from '@/components/pages/ProfilePage/ProfilePage'
import {User} from '@/services/users.types'
import {cookies} from 'next/headers'
import {saveTokenStorage} from '@/middleware'
import {removeFromStorage} from '@/services/auth/auth.helper'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
import {getTranslations} from 'next-intl/server'

export default async function ProfilePageMain() {
  let userData

  // Правильный способ получения cookies в серверном компоненте
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value || ''
  const refreshTokenStorage = cookieStore.get('refreshToken')?.value || ''
  const locale = await getCurrentLocale()

  try {
    // console.log('accessToken:', accessToken)
    userData = await instance.get<User>('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
        'Accept-Language': locale,
        'x-language': locale
      }
    })
    // console.log('userData:', userData?.data)
  } catch (e) {
    console.log('Error fetching userData:', e)
    if (!refreshTokenStorage) return
    try {
      const response = await instance.post('/refresh', {
        refreshToken: refreshTokenStorage
      })
      const {accessToken, refreshToken} = response.data
      console.log('tokens after update', accessToken.slice(0, 5))
      saveTokenStorage({accessToken, refreshToken})
      userData = await instance.get<User>('/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
          'Accept-Language': locale,
          'x-language': locale
        }
      })
    } catch (error) {
      removeFromStorage()
      console.log('delete user from storage on page - Profile')
      console.log('Error refreshing tokens:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trimPhonePrefix = (phoneNumber: string | undefined): string | undefined => {
    if (!phoneNumber) return phoneNumber

    // Убираем все нецифровые символы
    const digitsOnly = phoneNumber.replace(/\D/g, '')

    if (!digitsOnly) return phoneNumber

    const prefixMap = [
      {prefix: '+375', code: '375', length: 12},
      {prefix: '+7', code: '7', length: 11},
      {prefix: '+86', code: '86', length: 13}
    ]

    // Проверяем каждый префикс
    for (const {prefix, code, length} of prefixMap) {
      if (phoneNumber.startsWith(prefix) || digitsOnly.startsWith(code)) {
        // Если длина номера правильная - просто убираем префикс
        if (digitsOnly.length === length) {
          return digitsOnly.substring(code.length)
        }

        // Проверяем на дубликат кода (например: 375375...)
        const doubleCode = code + code
        if (digitsOnly.startsWith(doubleCode)) {
          const lengthWithoutOneCode = digitsOnly.length - code.length

          // Если после удаления одного кода длина правильная - убираем дубликат и префикс
          if (lengthWithoutOneCode === length) {
            return digitsOnly.substring(code.length * 2) // Убираем оба дубликата
          }
        }

        // В остальных случаях просто убираем префикс
        return digitsOnly.substring(code.length)
      }
    }

    // Если префикс не найден - возвращаем только цифры
    return digitsOnly
  }

  const initialUserData = {
    ...userData?.data,
    phoneNumber: userData?.data.phoneNumber || '',
    id: userData?.data.id || 0,
    role: userData?.data.role || '',
    email: userData?.data.email || '',
    login: userData?.data.login || '',
    region: userData?.data.region || '',
    registrationDate: userData?.data.registrationDate || '',
    lastModificationDate: userData?.data.lastModificationDate || '',
    avatarUrl: userData?.data.avatarUrl || '',
    vendorDetails: userData?.data.vendorDetails || undefined
  }
  // console.log('initialUserData:', initialUserData)
  return <ProfilePage isForOwner firstUserData={initialUserData} />
}

export async function generateMetadata() {
  const t = await getTranslations('metaTitles')
  return {
    title: t('profile'),
    ...NO_INDEX_PAGE
  }
}
